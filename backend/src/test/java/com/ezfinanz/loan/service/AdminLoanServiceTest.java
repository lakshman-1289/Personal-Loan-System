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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminLoanServiceTest {

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KycDetailsRepository kycDetailsRepository;

    @Mock
    private FinancialDetailsRepository financialDetailsRepository;

    @Mock
    private EligibilityResultRepository eligibilityResultRepository;

    @Mock
    private LoanTermsRepository loanTermsRepository;

    @Mock
    private BankDetailsRepository bankDetailsRepository;

    @Mock
    private DeclarationRepository declarationRepository;

    @Mock
    private SelfieDetailsRepository selfieDetailsRepository;

    @Mock
    private RepaymentInstallmentRepository repaymentInstallmentRepository;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private AdminLoanServiceImpl adminLoanService;

    private User mockAdmin;
    private User mockUser;
    private LoanApplication mockApplication;
    private SelfieDetails mockSelfie;
    private LoanTerms mockTerms;
    private BankDetails mockBank;

    @BeforeEach
    void setUp() {
        mockAdmin = User.builder()
                .id(2L)
                .email("admin@example.com")
                .role(Role.ADMIN)
                .build();

        mockUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .role(Role.CUSTOMER)
                .build();

        mockApplication = LoanApplication.builder()
                .id(1L)
                .user(mockUser)
                .status(ApplicationStatus.SELFIE_UNDER_REVIEW)
                .build();

        mockSelfie = SelfieDetails.builder()
                .id(1L)
                .application(mockApplication)
                .selfieUrl("uploads/selfie.jpg")
                .matchScore(BigDecimal.valueOf(95.00))
                .status("APPROVED")
                .build();

        mockTerms = LoanTerms.builder()
                .id(1L)
                .application(mockApplication)
                .principal(BigDecimal.valueOf(200000))
                .interestRate(BigDecimal.valueOf(12.00))
                .tenureMonths(12)
                .emi(BigDecimal.valueOf(17769.75)) // standard EMI for 200,000 at 12% for 12 months
                .build();

        mockBank = BankDetails.builder()
                .id(1L)
                .application(mockApplication)
                .accountNumber("123456789012")
                .build();
    }

    @Test
    void getAllApplications_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        when(loanApplicationRepository.findAll(pageable)).thenReturn(new PageImpl<>(Collections.singletonList(mockApplication)));
        when(kycDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(loanTermsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockTerms));

        Page<AdminApplicationSummary> result = adminLoanService.getAllApplications(pageable, null);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        AdminApplicationSummary summary = result.getContent().get(0);
        assertEquals(1L, summary.getApplicationId());
        assertEquals("user@example.com", summary.getApplicantName());
        assertEquals(0, summary.getRequestedAmount().compareTo(BigDecimal.valueOf(200000)));
    }

    @Test
    void getApplicationDetails_Success() {
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(kycDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(loanTermsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockTerms));
        when(bankDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockBank));
        when(declarationRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockSelfie));

        AdminApplicationDetails details = adminLoanService.getApplicationDetails(1L);

        assertNotNull(details);
        assertEquals(mockApplication, details.getApplication());
        assertEquals(mockTerms, details.getLoanTerms());
        assertEquals(mockBank, details.getBankDetails());
        assertEquals(mockSelfie, details.getSelfieDetails());
    }

    @Test
    void reviewSelfie_Approve_Success() {
        SelfieReviewRequest request = new SelfieReviewRequest("APPROVED", "Looks good");

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockSelfie));
        when(selfieDetailsRepository.save(any(SelfieDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SelfieDetails result = adminLoanService.reviewSelfie(1L, request, "admin@example.com");

        assertNotNull(result);
        assertEquals("APPROVED", result.getStatus());
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.SELFIE_UNDER_REVIEW, ApplicationStatus.SELFIE_APPROVED);
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.SELFIE_APPROVED, ApplicationStatus.APPROVED);
    }

    @Test
    void reviewSelfie_Reject_Success() {
        SelfieReviewRequest request = new SelfieReviewRequest("REJECTED", "Face blur");

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockSelfie));
        when(selfieDetailsRepository.save(any(SelfieDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SelfieDetails result = adminLoanService.reviewSelfie(1L, request, "admin@example.com");

        assertNotNull(result);
        assertEquals("REJECTED", result.getStatus());
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.SELFIE_UNDER_REVIEW, ApplicationStatus.SELFIE_REJECTED);
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.SELFIE_REJECTED, ApplicationStatus.REJECTED);
    }

    @Test
    void disburseLoan_Success() {
        mockApplication.setStatus(ApplicationStatus.APPROVED);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(loanTermsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockTerms));
        when(bankDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockBank));

        LoanApplication result = adminLoanService.disburseLoan(1L, "admin@example.com");

        assertNotNull(result);
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.APPROVED, ApplicationStatus.DISBURSEMENT_PENDING);
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.DISBURSEMENT_PENDING, ApplicationStatus.DISBURSED);
        verify(repaymentInstallmentRepository, times(1)).saveAll(anyList());
    }

    @Test
    void disburseLoan_WrongStatus_ThrowsException() {
        mockApplication.setStatus(ApplicationStatus.DRAFT);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> adminLoanService.disburseLoan(1L, "admin@example.com"));
        verify(repaymentInstallmentRepository, never()).saveAll(any());
    }
}
