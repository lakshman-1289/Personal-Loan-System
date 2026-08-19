package com.ezfinanz.selfie.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.common.service.StorageService;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.repository.KycDetailsRepository;
import com.ezfinanz.selfie.dto.FaceVerificationResult;
import com.ezfinanz.selfie.entity.SelfieDetails;
import com.ezfinanz.selfie.repository.SelfieDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SelfieServiceImpl implements SelfieService {

    private final SelfieDetailsRepository selfieDetailsRepository;
    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final KycDetailsRepository kycDetailsRepository;
    private final StorageService storageService;
    private final FaceVerificationService faceVerificationService;
    private final LoanApplicationService loanApplicationService;

    @Override
    @Transactional
    public SelfieDetails uploadSelfie(Long applicationId, MultipartFile file, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check
        if (!application.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Access denied: You do not own this application");
        }

        // State validation
        if (application.getStatus() != ApplicationStatus.SELFIE_PENDING) {
            throw new IllegalArgumentException("Application is not in SELFIE_PENDING status. Current status: " + application.getStatus());
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Selfie file is missing or empty");
        }

        // Content type validation
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG and PNG images are allowed.");
        }

        // Store selfie photo using the existing StorageService
        String selfieUrl = storageService.store(file);

        // Retrieve KYC document URL reference
        String kycDocumentUrl = kycDetailsRepository.findByApplication(application)
                .map(KycDetails::getDocumentUrl)
                .orElse(null);

        // Perform face verification via the abstracted FaceVerificationService
        FaceVerificationResult verificationResult = faceVerificationService.verify(file, kycDocumentUrl);

        SelfieDetails details = selfieDetailsRepository.findByApplication(application)
                .orElse(SelfieDetails.builder().application(application).build());

        details.setSelfieUrl(selfieUrl);
        details.setMatchScore(verificationResult.matchScore());
        details.setLivenessPassed(verificationResult.livenessPassed());
        details.setStatus(verificationResult.status());
        details.setVerifiedAt(LocalDateTime.now());

        SelfieDetails saved = selfieDetailsRepository.save(details);

        // Transition states:
        if ("APPROVED".equals(verificationResult.status())) {
            loanApplicationService.updateApplicationStatus(user, ApplicationStatus.SELFIE_PENDING, ApplicationStatus.SELFIE_APPROVED);
            loanApplicationService.updateApplicationStatus(user, ApplicationStatus.SELFIE_APPROVED, ApplicationStatus.APPROVED);
            log.info("Selfie approved and loan application approved for id: {}", applicationId);
        } else {
            loanApplicationService.updateApplicationStatus(user, ApplicationStatus.SELFIE_PENDING, ApplicationStatus.SELFIE_REJECTED);
            loanApplicationService.updateApplicationStatus(user, ApplicationStatus.SELFIE_REJECTED, ApplicationStatus.REJECTED);
            log.warn("Selfie matching score too low ({}) for application id: {}. Loan application rejected.", verificationResult.matchScore(), applicationId);
        }

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public SelfieDetails getSelfieDetails(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        // Security check: Only owner or admin
        if (!application.getUser().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: You do not have permission to view this application");
        }

        return selfieDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Selfie details not found for application id: " + applicationId));
    }
}
