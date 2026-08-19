package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import com.ezfinanz.eligibility.repository.EligibilityResultRepository;
import com.ezfinanz.loan.dto.LoanTermsOptionResponse;
import com.ezfinanz.loan.dto.SelectTermsRequest;
import com.ezfinanz.loan.entity.LoanTerms;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.repository.LoanTermsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanTermsServiceImpl implements LoanTermsService {

    private final LoanTermsRepository loanTermsRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final EligibilityResultRepository eligibilityResultRepository;
    private final LoanApplicationService loanApplicationService;

    @Value("${app.terms.processing-fee-pct:2.0}")
    private BigDecimal processingFeePct;

    @Value("${app.terms.gst-pct:18.0}")
    private BigDecimal gstPct;

    @Value("${app.terms.default-annual-interest-rate:12.0}")
    private BigDecimal defaultInterestRate;

    @Override
    @Transactional
    public List<LoanTermsOptionResponse> getTermsOptions(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // State validation
        if (application.getStatus() != ApplicationStatus.ELIGIBLE && application.getStatus() != ApplicationStatus.PARTIALLY_ELIGIBLE) {
            throw new IllegalArgumentException("Application is not in ELIGIBLE or PARTIALLY_ELIGIBLE status. Current status: " + application.getStatus());
        }

        EligibilityResult eligibility = eligibilityResultRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Eligibility check results not found."));

        // Transition status to TERMS_PENDING
        loanApplicationService.updateApplicationStatus(user, application.getStatus(), ApplicationStatus.TERMS_PENDING);

        BigDecimal principal = eligibility.getMaxEligibleAmount();
        int[] proposedTenures = {12, 24, 36};
        List<LoanTermsOptionResponse> options = new ArrayList<>();

        for (int tenure : proposedTenures) {
            options.add(calculateLoanTermsOption(principal, defaultInterestRate, tenure));
        }

        return options;
    }

    @Override
    @Transactional
    public LoanTerms selectTerms(Long applicationId, SelectTermsRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // State validation
        if (application.getStatus() != ApplicationStatus.TERMS_PENDING) {
            throw new IllegalArgumentException("Application is not in TERMS_PENDING status. Current status: " + application.getStatus());
        }

        EligibilityResult eligibility = eligibilityResultRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Eligibility check results not found."));

        // Bound check: Ensure selected amount does not exceed max eligible amount
        if (request.getRequestedAmount().compareTo(eligibility.getMaxEligibleAmount()) > 0) {
            throw new IllegalArgumentException("Requested amount exceeds maximum eligible amount of ₹" + eligibility.getMaxEligibleAmount());
        }

        LoanTermsOptionResponse termsCalc = calculateLoanTermsOption(request.getRequestedAmount(), defaultInterestRate, request.getTenureMonths());

        LoanTerms terms = loanTermsRepository.findByApplication(application)
                .orElse(LoanTerms.builder().application(application).build());

        terms.setPrincipal(request.getRequestedAmount());
        terms.setInterestRate(defaultInterestRate);
        terms.setTenureMonths(request.getTenureMonths());
        terms.setEmi(termsCalc.getEmi());
        terms.setProcessingFee(termsCalc.getProcessingFee());
        terms.setGst(termsCalc.getGst());
        terms.setNetDisbursedAmount(termsCalc.getNetDisbursedAmount());
        terms.setIrr(termsCalc.getIrr());

        LoanTerms saved = loanTermsRepository.save(terms);

        // Transition status to BANK_PENDING (Terms are now selected, awaiting banking details)
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.TERMS_PENDING, ApplicationStatus.BANK_PENDING);

        log.info("Selected terms for app id {}: tenure={}, amount={}", applicationId, request.getTenureMonths(), request.getRequestedAmount());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public LoanTerms getSelectedTerms(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return loanTermsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Loan terms not found for application id: " + applicationId));
    }

    private LoanTermsOptionResponse calculateLoanTermsOption(BigDecimal principal, BigDecimal annualRate, int tenure) {
        double P = principal.doubleValue();
        double rate = annualRate.doubleValue();
        double r = rate / 12 / 100;

        double emiVal;
        if (r == 0) {
            emiVal = P / tenure;
        } else {
            emiVal = (P * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
        }

        BigDecimal emi = BigDecimal.valueOf(emiVal).setScale(2, RoundingMode.HALF_UP);

        BigDecimal processingFee = principal.multiply(processingFeePct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal gst = processingFee.multiply(gstPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netDisbursedAmount = principal.subtract(processingFee).subtract(gst);

        // IRR Numerical Calculation using Bisection root finding
        double target = netDisbursedAmount.doubleValue();
        double pmt = emi.doubleValue();

        double low = 0.0;
        double high = 1.0;
        double tolerance = 1e-7;
        double mid = 0.0;

        for (int i = 0; i < 100; i++) {
            mid = (low + high) / 2.0;
            double pv = 0.0;
            for (int t = 1; t <= tenure; t++) {
                pv += pmt / Math.pow(1 + mid, t);
            }
            if (Math.abs(pv - target) < tolerance) {
                break;
            }
            if (pv > target) {
                low = mid;
            } else {
                high = mid;
            }
        }

        double annualizedIrr = (Math.pow(1 + mid, 12) - 1) * 100;
        BigDecimal irr = BigDecimal.valueOf(annualizedIrr).setScale(2, RoundingMode.HALF_UP);

        return LoanTermsOptionResponse.builder()
                .tenureMonths(tenure)
                .principal(principal)
                .interestRate(annualRate)
                .emi(emi)
                .processingFee(processingFee)
                .gst(gst)
                .netDisbursedAmount(netDisbursedAmount)
                .irr(irr)
                .build();
    }
}
