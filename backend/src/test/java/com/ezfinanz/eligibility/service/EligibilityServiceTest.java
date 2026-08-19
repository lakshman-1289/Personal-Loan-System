package com.ezfinanz.eligibility.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import com.ezfinanz.eligibility.repository.EligibilityResultRepository;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.repository.FinancialDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EligibilityServiceTest {

    @Mock
    private EligibilityResultRepository eligibilityResultRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FinancialDetailsRepository financialDetailsRepository;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private EligibilityServiceImpl eligibilityService;

    private User mockUser;
    private User mockAdmin;
    private LoanApplication mockApplication;
    private FinancialDetails mockFinancials;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(eligibilityService, "minCreditScore", 750);
        ReflectionTestUtils.setField(eligibilityService, "partialCreditScore", 650);
        ReflectionTestUtils.setField(eligibilityService, "maxDti", BigDecimal.valueOf(40.0));
        ReflectionTestUtils.setField(eligibilityService, "partialDti", BigDecimal.valueOf(45.0));
        ReflectionTestUtils.setField(eligibilityService, "incomeFactor", 10);
        ReflectionTestUtils.setField(eligibilityService, "requireFinancialVerification", false);

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
                .status(ApplicationStatus.ELIGIBILITY_PENDING)
                .build();

        mockFinancials = FinancialDetails.builder()
                .id(1L)
                .application(mockApplication)
                .monthlyIncome(BigDecimal.valueOf(50000))
                .annualIncome(BigDecimal.valueOf(600000))
                .requestedAmount(BigDecimal.valueOf(200000))
                .creditScore(800)
                .existingDebt(BigDecimal.valueOf(5000))
                .incomeVerified(true)
                .debtVerified(true)
                .creditScoreVerified(true)
                .build();
    }

    @Test
    void checkEligibility_OutcomeEligible_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("ELIGIBLE", result.getResult());
        assertEquals(0, result.getDebtToIncomeRatio().compareTo(BigDecimal.valueOf(10.00))); // 5000 / 50000 * 100 = 10%
        assertEquals(0, result.getMaxEligibleAmount().compareTo(BigDecimal.valueOf(500000))); // 50000 * 10
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.ELIGIBILITY_PENDING, ApplicationStatus.ELIGIBLE);
    }

    @Test
    void checkEligibility_OutcomePartiallyEligible_Success() {
        mockFinancials.setCreditScore(700);
        mockFinancials.setExistingDebt(BigDecimal.valueOf(21500)); // DTI = 21500 / 50000 * 100 = 43%

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("PARTIALLY_ELIGIBLE", result.getResult());
        assertEquals(0, result.getDebtToIncomeRatio().compareTo(BigDecimal.valueOf(43.00)));
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.ELIGIBILITY_PENDING, ApplicationStatus.PARTIALLY_ELIGIBLE);
    }

    @Test
    void checkEligibility_OutcomeNotEligible_LowCreditScore() {
        mockFinancials.setCreditScore(600); // Low score

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("NOT_ELIGIBLE", result.getResult());
        assertTrue(result.getReason().contains("Credit score 600 is below the minimum required score of 650"));
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.ELIGIBILITY_PENDING, ApplicationStatus.NOT_ELIGIBLE);
    }

    @Test
    void checkEligibility_OutcomeNotEligible_HighDti() {
        mockFinancials.setExistingDebt(BigDecimal.valueOf(25000)); // DTI = 25000 / 50000 * 100 = 50% (> 45%)

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("NOT_ELIGIBLE", result.getResult());
        assertTrue(result.getReason().contains("exceeds the maximum allowed partial DTI"));
    }

    @Test
    void checkEligibility_OutcomeNotEligible_RequestedAmountTooHigh() {
        mockFinancials.setRequestedAmount(BigDecimal.valueOf(800000)); // Max eligible is 500000

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("NOT_ELIGIBLE", result.getResult());
        assertTrue(result.getReason().contains("exceeds the maximum eligible amount of"));
    }

    @Test
    void checkEligibility_MissingFinancialDetails_ThrowsException() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> eligibilityService.checkEligibility(1L, "user@example.com"));
    }

    @Test
    void checkEligibility_UnverifiedFinancialDetails_ThrowsException() {
        ReflectionTestUtils.setField(eligibilityService, "requireFinancialVerification", true);
        mockFinancials.setIncomeVerified(false);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));

        assertThrows(IllegalArgumentException.class, () -> eligibilityService.checkEligibility(1L, "user@example.com"));
    }

    @Test
    void checkEligibility_ZeroIncome_ThrowsException() {
        mockFinancials.setMonthlyIncome(BigDecimal.ZERO);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));

        assertThrows(IllegalArgumentException.class, () -> eligibilityService.checkEligibility(1L, "user@example.com"));
    }

    @Test
    void checkEligibility_NegativeDebt_ThrowsException() {
        mockFinancials.setExistingDebt(BigDecimal.valueOf(-1));

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));

        assertThrows(IllegalArgumentException.class, () -> eligibilityService.checkEligibility(1L, "user@example.com"));
    }

    @Test
    void checkEligibility_UnauthorizedUser_ThrowsException() {
        User otherUser = User.builder().id(99L).email("other@example.com").build();
        mockApplication.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> eligibilityService.checkEligibility(1L, "user@example.com"));
    }

    @Test
    void getEligibilityResult_AdminGet_Success() {
        EligibilityResult mockResult = EligibilityResult.builder().id(1L).application(mockApplication).result("ELIGIBLE").build();
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockResult));

        EligibilityResult result = eligibilityService.getEligibilityResult(1L, "admin@example.com");

        assertNotNull(result);
        assertEquals("ELIGIBLE", result.getResult());
    }

    @Test
    void getEligibilityResult_CustomerGet_Success() {
        EligibilityResult mockResult = EligibilityResult.builder().id(1L).application(mockApplication).result("ELIGIBLE").build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockResult));

        EligibilityResult result = eligibilityService.getEligibilityResult(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("ELIGIBLE", result.getResult());
    }

    @Test
    void checkEligibility_ModeAMvpBypass_Success() {
        ReflectionTestUtils.setField(eligibilityService, "requireFinancialVerification", false);
        mockFinancials.setIncomeVerified(false);
        mockFinancials.setDebtVerified(false);
        mockFinancials.setCreditScoreVerified(false);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("ELIGIBLE", result.getResult());
    }

    @Test
    void checkEligibility_ModeBVerificationRequired_Rejection() {
        ReflectionTestUtils.setField(eligibilityService, "requireFinancialVerification", true);
        mockFinancials.setIncomeVerified(false);
        mockFinancials.setDebtVerified(false);
        mockFinancials.setCreditScoreVerified(false);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));

        assertThrows(IllegalArgumentException.class, () -> eligibilityService.checkEligibility(1L, "user@example.com"));
    }

    @Test
    void checkEligibility_ModeCVerificationRequiredAndComplete_Success() {
        ReflectionTestUtils.setField(eligibilityService, "requireFinancialVerification", true);
        mockFinancials.setIncomeVerified(true);
        mockFinancials.setDebtVerified(true);
        mockFinancials.setCreditScoreVerified(true);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(financialDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockFinancials));
        when(eligibilityResultRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(eligibilityResultRepository.save(any(EligibilityResult.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EligibilityResult result = eligibilityService.checkEligibility(1L, "user@example.com");

        assertNotNull(result);
        assertEquals("ELIGIBLE", result.getResult());
    }
}
