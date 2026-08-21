package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.repository.KycDetailsRepository;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.entity.LoanTerms;
import com.ezfinanz.loan.repository.FinancialDetailsRepository;
import com.ezfinanz.loan.repository.LoanTermsRepository;
import com.ezfinanz.loan.dto.AdminApplicationSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoanApplicationServiceImpl implements LoanApplicationService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final KycDetailsRepository kycDetailsRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final LoanTermsRepository loanTermsRepository;

    @Override
    @Transactional
    public LoanApplication createApplication(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Check if there is already an active (non-terminal) application
        Optional<LoanApplication> activeOpt = getActiveApplication(user);
        if (activeOpt.isPresent()) {
            log.info("User {} already has an active loan application with status: {}", userEmail, activeOpt.get().getStatus());
            return activeOpt.get();
        }

        // Determine initial status based on user verification status
        ApplicationStatus initialStatus = ApplicationStatus.DRAFT;
        if (!user.isEmailVerified()) {
            initialStatus = ApplicationStatus.EMAIL_VERIFICATION;
        } else if (!user.isPhoneVerified()) {
            initialStatus = ApplicationStatus.PHONE_VERIFICATION;
        } else {
            initialStatus = ApplicationStatus.KYC_PENDING;
        }

        LoanApplication application = LoanApplication.builder()
                .user(user)
                .status(initialStatus)
                .build();

        log.info("Creating new loan application for user {} with initial status: {}", userEmail, initialStatus);
        return loanApplicationRepository.save(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LoanApplication> getActiveApplication(User user) {
        Optional<LoanApplication> latestOpt = loanApplicationRepository.findFirstByUserOrderByCreatedAtDesc(user);
        if (latestOpt.isPresent()) {
            LoanApplication app = latestOpt.get();
            if (isTerminalState(app.getStatus())) {
                return Optional.empty();
            }
            return Optional.of(app);
        }
        return Optional.empty();
    }

    @Override
    @Transactional
    public void updateApplicationStatus(User user, ApplicationStatus expectedStatus, ApplicationStatus newStatus) {
        Optional<LoanApplication> activeOpt = getActiveApplication(user);
        if (activeOpt.isPresent()) {
            LoanApplication app = activeOpt.get();
            if (app.getStatus() == expectedStatus) {
                log.info("Transitioning application {} from {} to {}", app.getId(), expectedStatus, newStatus);
                app.setStatus(newStatus);
                loanApplicationRepository.save(app);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LoanApplication> getLatestApplication(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
        return loanApplicationRepository.findFirstByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminApplicationSummary> getUserApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));

        List<LoanApplication> applications = loanApplicationRepository.findByUser(user);

        // Map and sort latest first
        return applications.stream()
                .map(app -> {
                    String applicantName = kycDetailsRepository.findByApplication(app)
                            .map(KycDetails::getFullName)
                            .orElse(app.getUser().getEmail());

                    BigDecimal requestedAmount = loanTermsRepository.findByApplication(app)
                            .map(LoanTerms::getPrincipal)
                            .orElseGet(() -> financialDetailsRepository.findByApplication(app)
                                    .map(FinancialDetails::getRequestedAmount)
                                    .orElse(BigDecimal.ZERO));

                    Integer tenureMonths = loanTermsRepository.findByApplication(app)
                            .map(LoanTerms::getTenureMonths)
                            .orElse(null);

                    LocalDateTime submittedAt = app.getSubmittedAt() != null ? app.getSubmittedAt() : app.getCreatedAt();

                    return AdminApplicationSummary.builder()
                            .applicationId(app.getId())
                            .applicantName(applicantName)
                            .requestedAmount(requestedAmount)
                            .tenureMonths(tenureMonths)
                            .status(app.getStatus())
                            .submittedAt(submittedAt)
                            .build();
                })
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .collect(Collectors.toList());
    }

    private boolean isTerminalState(ApplicationStatus status) {
        return status == ApplicationStatus.DISBURSED || 
               status == ApplicationStatus.REJECTED || 
               status == ApplicationStatus.SELFIE_REJECTED;
    }
}
