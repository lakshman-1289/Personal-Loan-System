package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.dto.BankDetailsRequest;
import com.ezfinanz.loan.entity.BankDetails;
import com.ezfinanz.loan.enums.AccountType;
import com.ezfinanz.loan.repository.BankDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BankDetailsServiceTest {

    @Mock
    private BankDetailsRepository bankDetailsRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private BankDetailsServiceImpl bankDetailsService;

    private User mockUser;
    private User mockAdmin;
    private LoanApplication mockApplication;
    private BankDetailsRequest validRequest;

    @BeforeEach
    void setUp() {
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
                .status(ApplicationStatus.BANK_PENDING)
                .build();

        validRequest = new BankDetailsRequest("123456789012", "HDFC0001234", AccountType.SAVINGS, "Downtown Branch");
    }

    @Test
    void submitBankDetails_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(bankDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(bankDetailsRepository.save(any(BankDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BankDetails result = bankDetailsService.submitBankDetails(1L, validRequest, "user@example.com");

        assertNotNull(result);
        assertEquals("123456789012", result.getAccountNumber());
        assertEquals("HDFC0001234", result.getIfscCode());
        assertEquals(AccountType.SAVINGS, result.getAccountType());
        assertEquals("HDFC Bank", result.getBankName()); // resolves from prefix
        assertEquals("Downtown Branch", result.getBranchName());

        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.BANK_PENDING, ApplicationStatus.DECLARATION_PENDING);
    }

    @Test
    void submitBankDetails_WrongStatus_ThrowsException() {
        mockApplication.setStatus(ApplicationStatus.DRAFT);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> bankDetailsService.submitBankDetails(1L, validRequest, "user@example.com"));
        verify(bankDetailsRepository, never()).save(any());
    }

    @Test
    void submitBankDetails_AccessDenied_ThrowsException() {
        User otherUser = User.builder().id(99L).email("other@example.com").build();
        mockApplication.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> bankDetailsService.submitBankDetails(1L, validRequest, "user@example.com"));
    }

    @Test
    void getBankDetails_AdminGet_Success() {
        BankDetails mockDetails = BankDetails.builder().id(1L).application(mockApplication).bankName("HDFC Bank").build();
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(bankDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockDetails));

        BankDetails result = bankDetailsService.getBankDetails(1L, "admin@example.com");

        assertNotNull(result);
        assertEquals("HDFC Bank", result.getBankName());
    }
}
