package com.ezfinanz.eligibility.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.eligibility.dto.EligibilityCheckRequest;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import com.ezfinanz.eligibility.repository.EligibilityResultRepository;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.repository.FinancialDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EligibilityServiceImpl implements EligibilityService {

    private final EligibilityResultRepository eligibilityResultRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final LoanApplicationService loanApplicationService;

    @Value("${app.eligibility.min-credit-score:750}")
    private int minCreditScore;

    @Value("${app.eligibility.partial-credit-score:650}")
    private int partialCreditScore;

    @Value("${app.eligibility.max-dti:40.0}")
    private BigDecimal maxDti;

    @Value("${app.eligibility.partial-dti:45.0}")
    private BigDecimal partialDti;

    @Value("${app.eligibility.income-factor:10}")
    private int incomeFactor;

    @Value("${app.eligibility.require-financial-verification:false}")
    private boolean requireFinancialVerification;

    @Override
    @Transactional
    public EligibilityResult checkEligibility(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // Compliance check: Ensure application is in ELIGIBILITY_PENDING state
        if (application.getStatus() != ApplicationStatus.ELIGIBILITY_PENDING) {
            throw new IllegalArgumentException("Application is not in ELIGIBILITY_PENDING status. Current status: " + application.getStatus());
        }

        // Retrieve existing FinancialDetails
        FinancialDetails financialDetails = financialDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Financial details not found for application id: " + applicationId));

        // Assert verification status flags are true conditionally
        if (requireFinancialVerification) {
            if (!financialDetails.isIncomeVerified() || !financialDetails.isDebtVerified() || !financialDetails.isCreditScoreVerified()) {
                throw new IllegalArgumentException("Financial information has not been fully verified. " +
                        "Income, existing debt, and credit score must be verified before eligibility can be calculated.");
            }
        }

        BigDecimal income = financialDetails.getMonthlyIncome();
        BigDecimal debt = financialDetails.getExistingDebt();
        BigDecimal requestedAmount = financialDetails.getRequestedAmount();
        Integer creditScore = financialDetails.getCreditScore();

        // Safe validations:
        if (income.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Monthly income must be greater than zero");
        }
        if (debt.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Existing debt cannot be negative");
        }
        if (requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Requested loan amount must be greater than zero");
        }
        if (creditScore < 0) {
            throw new IllegalArgumentException("Credit score cannot be negative");
        }

        // 1. Calculate DTI = (existingDebt / monthlyIncome) * 100
        BigDecimal dtiRatio = debt.multiply(BigDecimal.valueOf(100)).divide(income, 2, RoundingMode.HALF_UP);

        // 2. Calculate Max Eligible Amount = monthlyIncome * incomeFactor
        BigDecimal maxEligibleAmount = income.multiply(BigDecimal.valueOf(incomeFactor));

        // 3. Evaluate Rules Engine
        boolean csEligible = creditScore >= minCreditScore;
        boolean csPartial = creditScore >= partialCreditScore;
        boolean dtiEligible = dtiRatio.compareTo(maxDti) <= 0;
        boolean dtiPartial = dtiRatio.compareTo(partialDti) <= 0;
        boolean amountEligible = requestedAmount.compareTo(maxEligibleAmount) <= 0;

        String result;
        StringBuilder reason = new StringBuilder();

        if (csEligible && dtiEligible && amountEligible) {
            result = "ELIGIBLE";
            reason.append("Meets required credit score (>= ").append(minCreditScore)
                  .append("), low DTI ratio (<= ").append(maxDti)
                  .append("%), and requested amount (<= ₹").append(maxEligibleAmount).append(").");
        } else if (csPartial && dtiPartial && amountEligible) {
            result = "PARTIALLY_ELIGIBLE";
            reason.append("Credit score (").append(creditScore)
                  .append(") or DTI ratio (").append(dtiRatio)
                  .append("%) qualifies for partial eligibility with requested amount (<= ₹").append(maxEligibleAmount).append(").");
        } else {
            result = "NOT_ELIGIBLE";
            if (creditScore < partialCreditScore) {
                reason.append("Credit score ").append(creditScore)
                      .append(" is below the minimum required score of ").append(partialCreditScore).append(". ");
            } else if (creditScore < minCreditScore) {
                reason.append("Credit score ").append(creditScore)
                      .append(" is below the minimum required score of ").append(minCreditScore).append(". ");
            }

            if (dtiRatio.compareTo(partialDti) > 0) {
                reason.append("Debt-to-Income ratio ").append(dtiRatio)
                      .append("% exceeds the maximum allowed partial DTI of ").append(partialDti).append("%. ");
            } else if (dtiRatio.compareTo(maxDti) > 0) {
                reason.append("Debt-to-Income ratio ").append(dtiRatio)
                      .append("% exceeds the maximum allowed DTI of ").append(maxDti).append("%. ");
            }

            if (requestedAmount.compareTo(maxEligibleAmount) > 0) {
                reason.append("Requested amount ₹").append(requestedAmount)
                      .append(" exceeds the maximum eligible amount of ₹").append(maxEligibleAmount).append(".");
            }
        }

        // Save Eligibility Result
        EligibilityResult eligibilityResult = eligibilityResultRepository.findByApplication(application)
                .orElse(EligibilityResult.builder().application(application).build());

        eligibilityResult.setCreditScore(creditScore);
        eligibilityResult.setDebtToIncomeRatio(dtiRatio);
        eligibilityResult.setMaxEligibleAmount(maxEligibleAmount);
        eligibilityResult.setResult(result);
        eligibilityResult.setReason(reason.toString().trim());

        EligibilityResult saved = eligibilityResultRepository.save(eligibilityResult);

        // State Transition: ELIGIBILITY_PENDING -> ELIGIBLE / PARTIALLY_ELIGIBLE / NOT_ELIGIBLE
        ApplicationStatus newStatus = ApplicationStatus.valueOf(result);
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.ELIGIBILITY_PENDING, newStatus);

        log.info("Eligibility evaluated for app id {}: result={}, maxEligible={}", applicationId, result, maxEligibleAmount);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public EligibilityResult getEligibilityResult(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return eligibilityResultRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Eligibility result not found for application id: " + applicationId));
    }
}
