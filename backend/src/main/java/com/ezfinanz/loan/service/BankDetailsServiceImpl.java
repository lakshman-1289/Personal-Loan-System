package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.dto.BankDetailsRequest;
import com.ezfinanz.loan.entity.BankDetails;
import com.ezfinanz.loan.repository.BankDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BankDetailsServiceImpl implements BankDetailsService {

    private final BankDetailsRepository bankDetailsRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final LoanApplicationService loanApplicationService;

    @Override
    @Transactional
    public BankDetails submitBankDetails(Long applicationId, BankDetailsRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // State validation
        if (application.getStatus() != ApplicationStatus.BANK_PENDING) {
            throw new IllegalArgumentException("Application is not in BANK_PENDING status. Current status: " + application.getStatus());
        }

        // Mock bank name resolution based on IFSC prefix
        String bankName = resolveBankName(request.getIfscCode());

        BankDetails details = bankDetailsRepository.findByApplication(application)
                .orElse(BankDetails.builder().application(application).build());

        details.setAccountNumber(request.getAccountNumber());
        details.setIfscCode(request.getIfscCode());
        details.setAccountType(request.getAccountType());
        details.setBankName(bankName);
        details.setBranchName(request.getBranchName());

        BankDetails saved = bankDetailsRepository.save(details);

        // Transition status to DECLARATION_PENDING
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.BANK_PENDING, ApplicationStatus.DECLARATION_PENDING);

        log.info("Bank details submitted successfully for application id: {}", applicationId);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public BankDetails getBankDetails(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only owner or admin
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return bankDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Bank details not found for application id: " + applicationId));
    }

    private String resolveBankName(String ifscCode) {
        if (ifscCode == null || ifscCode.length() < 4) {
            return "State Bank of India";
        }
        String prefix = ifscCode.substring(0, 4).toUpperCase();
        return switch (prefix) {
            case "HDFC" -> "HDFC Bank";
            case "ICIC" -> "ICICI Bank";
            case "SBIN" -> "State Bank of India";
            case "KKBK" -> "Kotak Mahindra Bank";
            default -> "State Bank of India";
        };
    }
}
