package com.ezfinanz.kyc.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Gender;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.kyc.dto.KycRequest;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.repository.KycDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KycServiceTest {

    @Mock
    private KycDetailsRepository kycDetailsRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KycProvider kycProvider;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private KycServiceImpl kycService;

    private User mockUser;
    private LoanApplication mockApplication;
    private KycRequest kycRequest;
    private KycDetails mockKycDetails;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .emailVerified(true)
                .phoneVerified(true)
                .build();

        mockApplication = LoanApplication.builder()
                .id(1L)
                .user(mockUser)
                .status(ApplicationStatus.KYC_PENDING)
                .build();

        kycRequest = new KycRequest("John Doe", LocalDate.of(1990, 1, 1), Gender.MALE, "123 Main St", "PAN", "ABCDE1234F", "/uploads/document.jpg");

        mockKycDetails = KycDetails.builder()
                .id(1L)
                .application(mockApplication)
                .fullName("John Doe")
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .gender(Gender.MALE)
                .address("123 Main St")
                .idType("PAN")
                .idNumber("ABCDE1234F")
                .build();
    }

    @Test
    void submitKyc_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(kycProvider.verifyIdentity("ABCDE1234F", "PAN")).thenReturn(true);
        when(kycDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(kycDetailsRepository.save(any(KycDetails.class))).thenReturn(mockKycDetails);

        KycDetails result = kycService.submitKyc(1L, kycRequest, "user@example.com");

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        verify(kycDetailsRepository, times(1)).save(any(KycDetails.class));
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.KYC_PENDING, ApplicationStatus.KYC_COMPLETED);
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.KYC_COMPLETED, ApplicationStatus.ELIGIBILITY_PENDING);
    }

    @Test
    void submitKyc_EmailPhoneNotVerified_ThrowsException() {
        mockUser.setEmailVerified(false);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> kycService.submitKyc(1L, kycRequest, "user@example.com"));
        verify(kycDetailsRepository, never()).save(any());
    }

    @Test
    void submitKyc_AccessDenied_ThrowsException() {
        User anotherUser = User.builder().id(99L).email("other@example.com").build();
        mockApplication.setUser(anotherUser);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> kycService.submitKyc(1L, kycRequest, "user@example.com"));
        verify(kycDetailsRepository, never()).save(any());
    }
}
