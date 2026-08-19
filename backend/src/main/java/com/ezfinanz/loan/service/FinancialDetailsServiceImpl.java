package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.dto.FinancialRequest;
import com.ezfinanz.loan.dto.FinancialVerificationRequest;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.repository.FinancialDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialDetailsServiceImpl implements FinancialDetailsService {

    private final FinancialDetailsRepository financialDetailsRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public FinancialDetails submitFinancials(Long applicationId, FinancialRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only owner can submit financial details
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // Check if details already exist, update them. Else create.
        FinancialDetails details = financialDetailsRepository.findByApplication(application)
                .orElse(null);

        if (details == null) {
            details = FinancialDetails.builder().application(application).build();
            details.setIncomeVerified(false);
            details.setDebtVerified(false);
            details.setCreditScoreVerified(false);
        } else {
            // Reset verification state only if the specific values change
            if (details.getMonthlyIncome().compareTo(request.getMonthlyIncome()) != 0) {
                details.setIncomeVerified(false);
            }
            if (details.getExistingDebt().compareTo(request.getExistingDebt()) != 0) {
                details.setDebtVerified(false);
            }
            if (!details.getCreditScore().equals(request.getCreditScore())) {
                details.setCreditScoreVerified(false);
            }
        }

        details.setMonthlyIncome(request.getMonthlyIncome());
        details.setAnnualIncome(request.getAnnualIncome());
        details.setRequestedAmount(request.getRequestedAmount());
        details.setCreditScore(request.getCreditScore());
        details.setExistingDebt(request.getExistingDebt());
        details.setEmployer(request.getEmployer());
        details.setDesignation(request.getDesignation());

        FinancialDetails saved = financialDetailsRepository.save(details);
        log.info("Financial details submitted successfully for application id: {}", applicationId);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialDetails getFinancialDetails(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only owner or admin can retrieve financial details
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return financialDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Financial details not found for application id: " + applicationId));
    }

    @Override
    @Transactional
    public FinancialDetails verifyFinancialDetails(Long applicationId, FinancialVerificationRequest verificationRequest, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminEmail));

        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: Only admins can verify financial details");
        }

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        FinancialDetails details = financialDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Financial details not found for application id: " + applicationId));

        details.setIncomeVerified(verificationRequest.isIncomeVerified());
        details.setDebtVerified(verificationRequest.isDebtVerified());
        details.setCreditScoreVerified(verificationRequest.isCreditScoreVerified());

        FinancialDetails saved = financialDetailsRepository.save(details);
        log.info("Admin verified financial details for application id: {}", applicationId);
        return saved;
    }
}
