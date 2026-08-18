package com.ezfinanz.kyc.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import com.ezfinanz.kyc.dto.KycRequest;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.repository.KycDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycServiceImpl implements KycService {

    private final KycDetailsRepository kycDetailsRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final KycProvider kycProvider;
    private final LoanApplicationService loanApplicationService;

    @Override
    @Transactional
    public KycDetails submitKyc(Long applicationId, KycRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only the application owner can submit KYC
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // Compliance check: Email and Phone must be verified first
        if (!user.isEmailVerified() || !user.isPhoneVerified()) {
            throw new IllegalArgumentException("Email and phone number must be verified before submitting KYC");
        }

        // Verify ID with mock KYC provider
        boolean idVerified = kycProvider.verifyIdentity(request.getIdNumber(), request.getIdType());
        if (!idVerified) {
            throw new IllegalArgumentException("KYC Identity verification failed");
        }

        // Check if KycDetails already exists, then update it. Else create new.
        KycDetails kycDetails = kycDetailsRepository.findByApplication(application)
                .orElse(KycDetails.builder().application(application).build());

        kycDetails.setFullName(request.getFullName());
        kycDetails.setDateOfBirth(request.getDateOfBirth());
        kycDetails.setGender(request.getGender());
        kycDetails.setAddress(request.getAddress());
        kycDetails.setIdType(request.getIdType());
        kycDetails.setIdNumber(request.getIdNumber());
        kycDetails.setDocumentUrl(request.getDocumentUrl());

        KycDetails saved = kycDetailsRepository.save(kycDetails);
        log.info("KYC details submitted successfully for application id: {}", applicationId);

        // Transition: KYC_PENDING -> KYC_COMPLETED -> ELIGIBILITY_PENDING
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.KYC_PENDING, ApplicationStatus.KYC_COMPLETED);
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.KYC_COMPLETED, ApplicationStatus.ELIGIBILITY_PENDING);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public KycDetails getKycDetails(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only owner or admin can retrieve KYC details
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return kycDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("KYC details not found for application id: " + applicationId));
    }
}
