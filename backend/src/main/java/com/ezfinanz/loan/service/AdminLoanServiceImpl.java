package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import com.ezfinanz.eligibility.repository.EligibilityResultRepository;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.repository.KycDetailsRepository;
import com.ezfinanz.loan.dto.AdminApplicationDetails;
import com.ezfinanz.loan.dto.AdminApplicationSummary;
import com.ezfinanz.loan.entity.*;
import com.ezfinanz.loan.repository.*;
import com.ezfinanz.selfie.dto.SelfieReviewRequest;
import com.ezfinanz.selfie.entity.SelfieDetails;
import com.ezfinanz.selfie.repository.SelfieDetailsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminLoanServiceImpl implements AdminLoanService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final UserRepository userRepository;
    private final KycDetailsRepository kycDetailsRepository;
    private final FinancialDetailsRepository financialDetailsRepository;
    private final EligibilityResultRepository eligibilityResultRepository;
    private final LoanTermsRepository loanTermsRepository;
    private final BankDetailsRepository bankDetailsRepository;
    private final DeclarationRepository declarationRepository;
    private final SelfieDetailsRepository selfieDetailsRepository;
    private final RepaymentInstallmentRepository repaymentInstallmentRepository;
    private final LoanApplicationService loanApplicationService;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminApplicationSummary> getAllApplications(Pageable pageable, ApplicationStatus status) {
        Page<LoanApplication> applications;
        if (status != null) {
            applications = loanApplicationRepository.findByStatus(status, pageable);
        } else {
            applications = loanApplicationRepository.findAll(pageable);
        }

        return applications.map(app -> {
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
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AdminApplicationDetails getApplicationDetails(Long applicationId) {
        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        User user = application.getUser();

        KycDetails kycDetails = kycDetailsRepository.findByApplication(application).orElse(null);
        FinancialDetails financialDetails = financialDetailsRepository.findByApplication(application).orElse(null);
        EligibilityResult eligibilityResult = eligibilityResultRepository.findByApplication(application).orElse(null);
        LoanTerms loanTerms = loanTermsRepository.findByApplication(application).orElse(null);
        BankDetails bankDetails = bankDetailsRepository.findByApplication(application).orElse(null);
        Declaration declaration = declarationRepository.findByApplication(application).orElse(null);
        SelfieDetails selfieDetails = selfieDetailsRepository.findByApplication(application).orElse(null);

        return AdminApplicationDetails.builder()
                .application(application)
                .email(user.getEmail())
                .emailVerified(user.isEmailVerified())
                .phoneVerified(user.isPhoneVerified())
                .kycDetails(kycDetails)
                .financialDetails(financialDetails)
                .eligibilityResult(eligibilityResult)
                .loanTerms(loanTerms)
                .bankDetails(bankDetails)
                .declaration(declaration)
                .selfieDetails(selfieDetails)
                .build();
    }

    @Override
    @Transactional
    public SelfieDetails reviewSelfie(Long applicationId, SelfieReviewRequest review, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminEmail));

        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: Only admins can review selfies");
        }

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        if (application.getStatus() != ApplicationStatus.SELFIE_UNDER_REVIEW) {
            throw new IllegalArgumentException("Application is not in SELFIE_UNDER_REVIEW status. Current status: " + application.getStatus());
        }

        SelfieDetails details = selfieDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Selfie details not found for application id: " + applicationId));

        details.setStatus(review.getStatus());
        SelfieDetails saved = selfieDetailsRepository.save(details);

        if ("APPROVED".equals(review.getStatus())) {
            loanApplicationService.updateApplicationStatus(admin, ApplicationStatus.SELFIE_UNDER_REVIEW, ApplicationStatus.SELFIE_APPROVED);
            loanApplicationService.updateApplicationStatus(admin, ApplicationStatus.SELFIE_APPROVED, ApplicationStatus.APPROVED);
            log.info("Admin approved selfie for application id: {}", applicationId);
        } else {
            loanApplicationService.updateApplicationStatus(admin, ApplicationStatus.SELFIE_UNDER_REVIEW, ApplicationStatus.SELFIE_REJECTED);
            loanApplicationService.updateApplicationStatus(admin, ApplicationStatus.SELFIE_REJECTED, ApplicationStatus.REJECTED);
            log.warn("Admin rejected selfie for application id: {}. Reason: {}", applicationId, review.getReason());
        }

        return saved;
    }

    @Override
    @Transactional
    public LoanApplication disburseLoan(Long applicationId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found: " + adminEmail));

        if (admin.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Access denied: Only admins can disburse loans");
        }

        LoanApplication application = loanApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Loan application not found: " + applicationId));

        if (application.getStatus() != ApplicationStatus.APPROVED) {
            throw new IllegalArgumentException("Application is not in APPROVED status. Current status: " + application.getStatus());
        }

        LoanTerms terms = loanTermsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Loan terms not found for application id: " + applicationId));

        // Mock bank details lookup to ensure banking coordinates are captured
        bankDetailsRepository.findByApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("Bank details not found for application id: " + applicationId));

        // Transition: APPROVED -> DISBURSEMENT_PENDING -> DISBURSED
        loanApplicationService.updateApplicationStatus(admin, ApplicationStatus.APPROVED, ApplicationStatus.DISBURSEMENT_PENDING);
        loanApplicationService.updateApplicationStatus(admin, ApplicationStatus.DISBURSEMENT_PENDING, ApplicationStatus.DISBURSED);

        // Generate Repayment/Amortization Schedule
        generateRepaymentSchedule(application, terms);

        log.info("Admin successfully disbursed loan for application id: {}", applicationId);
        return application;
    }

    private void generateRepaymentSchedule(LoanApplication application, LoanTerms terms) {
        BigDecimal principal = terms.getPrincipal();
        BigDecimal emi = terms.getEmi();
        int tenure = terms.getTenureMonths();
        BigDecimal annualRate = terms.getInterestRate();
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12).multiply(BigDecimal.valueOf(100)), 10, RoundingMode.HALF_UP);

        BigDecimal outstandingBalance = principal;
        LocalDate startDate = LocalDate.now();
        List<RepaymentInstallment> installments = new ArrayList<>();

        for (int t = 1; t <= tenure; t++) {
            BigDecimal interest = outstandingBalance.multiply(monthlyRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalPaid;

            if (t == tenure) {
                // Adjust final payment to avoid rounding errors
                principalPaid = outstandingBalance;
                emi = outstandingBalance.add(interest).setScale(2, RoundingMode.HALF_UP);
                outstandingBalance = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            } else {
                principalPaid = emi.subtract(interest).setScale(2, RoundingMode.HALF_UP);
                outstandingBalance = outstandingBalance.subtract(principalPaid).setScale(2, RoundingMode.HALF_UP);
            }

            LocalDate dueDate = startDate.plusMonths(t);

            RepaymentInstallment installment = RepaymentInstallment.builder()
                    .application(application)
                    .installmentNumber(t)
                    .dueDate(dueDate)
                    .emi(emi)
                    .principalComponent(principalPaid)
                    .interestComponent(interest)
                    .outstandingBalance(outstandingBalance)
                    .status("PENDING")
                    .build();

            installments.add(installment);
        }

        repaymentInstallmentRepository.saveAll(installments);
        log.info("Generated {} repayment schedule installments for loan application id: {}", tenure, application.getId());
    }
}
