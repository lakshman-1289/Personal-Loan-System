package com.ezfinanz.verification.service;

import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import com.ezfinanz.verification.entity.VerificationToken;
import com.ezfinanz.verification.enums.VerificationTokenType;
import com.ezfinanz.verification.repository.VerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VerificationServiceTest {

    @Mock
    private VerificationTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private VerificationServiceImpl verificationService;

    private User mockUser;
    private VerificationToken mockEmailToken;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .phone("9876543210")
                .emailVerified(false)
                .phoneVerified(false)
                .build();

        mockEmailToken = VerificationToken.builder()
                .id(1L)
                .user(mockUser)
                .token("123456")
                .tokenType(VerificationTokenType.EMAIL)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();
    }

    @Test
    void sendEmailOtp_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        verificationService.sendEmailOtp("test@example.com");

        verify(tokenRepository, times(1)).deleteByUserAndTokenType(mockUser, VerificationTokenType.EMAIL);
        verify(tokenRepository, times(1)).save(any(VerificationToken.class));
        verify(emailService, times(1)).sendOtp(eq("test@example.com"), anyString());
    }

    @Test
    void verifyEmailOtp_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(tokenRepository.findByUserAndTokenAndTokenType(mockUser, "123456", VerificationTokenType.EMAIL))
                .thenReturn(Optional.of(mockEmailToken));

        verificationService.verifyEmailOtp("123456", "test@example.com");

        assertTrue(mockUser.isEmailVerified());
        verify(userRepository, times(1)).save(mockUser);
        verify(tokenRepository, times(1)).delete(mockEmailToken);
        
        // Assert transitions
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.EMAIL_VERIFICATION, ApplicationStatus.PHONE_VERIFICATION);
        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.DRAFT, ApplicationStatus.PHONE_VERIFICATION);
    }

    @Test
    void verifyEmailOtp_ExpiredToken_ThrowsException() {
        mockEmailToken.setExpiryDate(LocalDateTime.now().minusMinutes(1)); // expired
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(tokenRepository.findByUserAndTokenAndTokenType(mockUser, "123456", VerificationTokenType.EMAIL))
                .thenReturn(Optional.of(mockEmailToken));

        assertThrows(IllegalArgumentException.class, () -> verificationService.verifyEmailOtp("123456", "test@example.com"));

        assertFalse(mockUser.isEmailVerified());
        verify(tokenRepository, times(1)).delete(mockEmailToken);
        verify(userRepository, never()).save(any());
    }

    @Test
    void verifyEmailOtp_InvalidToken_ThrowsException() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));
        when(tokenRepository.findByUserAndTokenAndTokenType(mockUser, "wrong", VerificationTokenType.EMAIL))
                .thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> verificationService.verifyEmailOtp("wrong", "test@example.com"));
    }
}
