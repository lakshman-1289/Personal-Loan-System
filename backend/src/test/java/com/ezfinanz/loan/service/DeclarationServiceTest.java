package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.dto.DeclarationRequest;
import com.ezfinanz.loan.entity.Declaration;
import com.ezfinanz.loan.repository.DeclarationRepository;
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
class DeclarationServiceTest {

    @Mock
    private DeclarationRepository declarationRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoanApplicationService loanApplicationService;

    @InjectMocks
    private DeclarationServiceImpl declarationService;

    private User mockUser;
    private User mockAdmin;
    private LoanApplication mockApplication;
    private DeclarationRequest validRequest;

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
                .status(ApplicationStatus.DECLARATION_PENDING)
                .build();

        validRequest = new DeclarationRequest(true, true, true);
    }

    @Test
    void submitDeclaration_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(declarationRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(declarationRepository.save(any(Declaration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Declaration result = declarationService.submitDeclaration(1L, validRequest, "192.168.1.1", "user@example.com");

        assertNotNull(result);
        assertTrue(result.isAcceptedPrivacyPolicy());
        assertTrue(result.isAcceptedTermsAndConditions());
        assertTrue(result.isAcceptedCreditBureauConsent());
        assertEquals("192.168.1.1", result.getIpAddress());
        assertNotNull(result.getConsentTimestamp());

        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.DECLARATION_PENDING, ApplicationStatus.SELFIE_PENDING);
    }

    @Test
    void submitDeclaration_WrongStatus_ThrowsException() {
        mockApplication.setStatus(ApplicationStatus.DRAFT);
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> declarationService.submitDeclaration(1L, validRequest, "192.168.1.1", "user@example.com"));
        verify(declarationRepository, never()).save(any());
    }

    @Test
    void submitDeclaration_AccessDenied_ThrowsException() {
        User otherUser = User.builder().id(99L).email("other@example.com").build();
        mockApplication.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> declarationService.submitDeclaration(1L, validRequest, "192.168.1.1", "user@example.com"));
    }

    @Test
    void getDeclaration_AdminGet_Success() {
        Declaration mockDeclaration = Declaration.builder().id(1L).application(mockApplication).acceptedPrivacyPolicy(true).build();
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(declarationRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockDeclaration));

        Declaration result = declarationService.getDeclaration(1L, "admin@example.com");

        assertNotNull(result);
        assertTrue(result.isAcceptedPrivacyPolicy());
    }
}
