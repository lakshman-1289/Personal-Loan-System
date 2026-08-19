package com.ezfinanz.loan.service;

import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.dto.FinancialRequest;
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
                .orElse(FinancialDetails.builder().application(application).build());

        details.setMonthlyIncome(request.getMonthlyIncome());
        details.setAnnualIncome(request.getAnnualIncome());
        details.setRequestedAmount(request.getRequestedAmount());
        details.setCreditScore(request.getCreditScore());
        details.setExistingDebt(request.getExistingDebt());
        details.setEmployer(request.getEmployer());
        details.setDesignation(request.getDesignation());

        FinancialDetails saved = financialDetailsRepository.save(details);
        log.info("Financial details submitted successfully for application id: {}", applicationId);

        // Reset application status to ELIGIBILITY_PENDING to allow recheck
        if (application.getStatus() == ApplicationStatus.KYC_COMPLETED || 
            application.getStatus() == ApplicationStatus.ELIGIBILITY_PENDING || 
            application.getStatus() == ApplicationStatus.NOT_ELIGIBLE) {
            application.setStatus(ApplicationStatus.ELIGIBILITY_PENDING);
            loanApplicationRepository.save(application);
            log.info("Transitioned application {} status to ELIGIBILITY_PENDING for evaluation.", application.getId());
        }

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
}
