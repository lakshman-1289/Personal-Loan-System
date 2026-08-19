package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.dto.DeclarationRequest;
import com.ezfinanz.loan.entity.Declaration;
import com.ezfinanz.loan.repository.DeclarationRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeclarationServiceImpl implements DeclarationService {

    private final DeclarationRepository declarationRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final LoanApplicationService loanApplicationService;

    @Override
    @Transactional
    public Declaration submitDeclaration(Long applicationId, DeclarationRequest request, String ipAddress, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // State validation
        if (application.getStatus() != ApplicationStatus.DECLARATION_PENDING) {
            throw new IllegalArgumentException("Application is not in DECLARATION_PENDING status. Current status: " + application.getStatus());
        }

        Declaration declaration = declarationRepository.findByApplication(application)
                .orElse(Declaration.builder().application(application).build());

        declaration.setAcceptedPrivacyPolicy(request.getAcceptedPrivacyPolicy());
        declaration.setAcceptedTermsAndConditions(request.getAcceptedTermsAndConditions());
        declaration.setAcceptedCreditBureauConsent(request.getAcceptedCreditBureauConsent());
        declaration.setIpAddress(ipAddress != null ? ipAddress : "0.0.0.0");
        declaration.setConsentTimestamp(LocalDateTime.now());

        Declaration saved = declarationRepository.save(declaration);

        // Transition status to SELFIE_PENDING
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.DECLARATION_PENDING, ApplicationStatus.SELFIE_PENDING);

        log.info("Declarations submitted successfully for application id: {}", applicationId);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Declaration getDeclaration(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only owner or admin
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return declarationRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Declaration not found for application id: " + applicationId));
    }
}
