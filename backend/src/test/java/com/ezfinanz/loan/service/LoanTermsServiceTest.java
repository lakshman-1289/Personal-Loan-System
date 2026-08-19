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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanTermsServiceTest {

    @Mock
    private LoanTermsRepository loanTermsRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EligibilityResultRepository eligibilityResultRepository;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private LoanTermsServiceImpl loanTermsService;

    private User mockUser;
    private User mockAdmin;
    private LoanApplication mockApplication;
    private EligibilityResult mockEligibility;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(loanTermsService, "processingFeePct", BigDecimal.valueOf(2.0));
        ReflectionTestUtils.setField(loanTermsService, "gstPct", BigDecimal.valueOf(18.0));
        ReflectionTestUtils.setField(loanTermsService, "defaultInterestRate", BigDecimal.valueOf(12.0));

        mockUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .role(Role.CUSTOMER)
                .build();

        mockAdmin = User.builder()
                .id(2L)
                .email("admin@example.com")
                .role(Role.ADMIN)
                .build();

        mockApplication = LoanApplication.builder()
                .id(1L)
                .user(mockUser)
                .status(ApplicationStatus.ELIGIBLE)
                .build();

        mockEligibility = EligibilityResult.builder()
                .id(1L)
                .application(mockApplication)
                .creditScore(800)
                .debtToIncomeRatio(BigDecimal.valueOf(10.00))
                .maxEligibleAmount(BigDecimal.valueOf(500000))
                .result("ELIGIBLE")
                .build();
    }

    @Test
    void getTermsOptions_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockEligibility));

        List<LoanTermsOptionResponse> options = loanTermsService.getTermsOptions(1L, "user@example.com");

        assertNotNull(options);
        assertEquals(3, options.size());

        // Check first option (12 months)
        LoanTermsOptionResponse opt12 = options.get(0);
        assertEquals(12, opt12.getTenureMonths());
        assertEquals(0, opt12.getPrincipal().compareTo(BigDecimal.valueOf(500000)));
        // EMI = 500000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) = 500000 * 0.01 * 1.1268 / 0.1268 = 44424.39
        assertEquals(0, opt12.getEmi().compareTo(BigDecimal.valueOf(44424.39)));
        // Processing Fee = 500000 * 2% = 10000
        assertEquals(0, opt12.getProcessingFee().compareTo(BigDecimal.valueOf(10000.00)));
        // GST = 10000 * 18% = 1800
        assertEquals(0, opt12.getGst().compareTo(BigDecimal.valueOf(1800.00)));
        // Net Disbursed = 500000 - 10000 - 1800 = 488200
        assertEquals(0, opt12.getNetDisbursedAmount().compareTo(BigDecimal.valueOf(488200.00)));
        // IRR must be greater than nominal interest rate (12%) since fees reduce net disbursement
        assertTrue(opt12.getIrr().compareTo(BigDecimal.valueOf(12.0)) > 0);

        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.ELIGIBLE, ApplicationStatus.TERMS_PENDING);
    }

    @Test
    void selectTerms_Success() {
        mockApplication.setStatus(ApplicationStatus.TERMS_PENDING);
        SelectTermsRequest request = new SelectTermsRequest(24, BigDecimal.valueOf(200000));

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockEligibility));
        when(loanTermsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(loanTermsRepository.save(any(LoanTerms.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LoanTerms result = loanTermsService.selectTerms(1L, request, "user@example.com");

        assertNotNull(result);
        assertEquals(24, result.getTenureMonths());
        assertEquals(0, result.getPrincipal().compareTo(BigDecimal.valueOf(200000)));
        // EMI = 200000 * 0.01 * (1.01)^24 / ((1.01)^24 - 1) = 9414.69
        assertEquals(0, result.getEmi().compareTo(BigDecimal.valueOf(9414.69)));
        // Processing Fee = 200000 * 2% = 4000
        assertEquals(0, result.getProcessingFee().compareTo(BigDecimal.valueOf(4000.00)));
        // GST = 4000 * 18% = 720
        assertEquals(0, result.getGst().compareTo(BigDecimal.valueOf(720.00)));
        // Net Disbursed = 200000 - 4000 - 720 = 195280
        assertEquals(0, result.getNetDisbursedAmount().compareTo(BigDecimal.valueOf(195280.00)));

        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.TERMS_PENDING, ApplicationStatus.BANK_PENDING);
    }

    @Test
    void selectTerms_AmountExceedsEligible_ThrowsException() {
        mockApplication.setStatus(ApplicationStatus.TERMS_PENDING);
        SelectTermsRequest request = new SelectTermsRequest(24, BigDecimal.valueOf(600000)); // Exceeds 500000

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockEligibility));

        assertThrows(IllegalArgumentException.class, () -> loanTermsService.selectTerms(1L, request, "user@example.com"));
        verify(loanTermsRepository, never()).save(any());
    }
}
