package com.ezfinanz.selfie.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.common.service.StorageService;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.repository.KycDetailsRepository;
import com.ezfinanz.selfie.entity.SelfieDetails;
import com.ezfinanz.selfie.repository.SelfieDetailsRepository;
import com.ezfinanz.loan.repository.LoanApplicationRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SelfieServiceTest {

    @Mock
    private SelfieDetailsRepository selfieDetailsRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private KycDetailsRepository kycDetailsRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private LoanApplicationService loanApplicationService;

    @Spy
    private MockFaceVerificationService faceVerificationService;

    @InjectMocks
    private SelfieServiceImpl selfieService;

    private User mockUser;
    private User mockAdmin;
    private LoanApplication mockApplication;
    private KycDetails mockKyc;

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
                .status(ApplicationStatus.SELFIE_PENDING)
                .build();

        mockKyc = KycDetails.builder()
                .id(1L)
                .application(mockApplication)
                .documentUrl("uploads/id-doc.jpg")
                .build();
    }

    @Test
    void uploadSelfie_Success_UnderReview() {
        MockMultipartFile validFile = new MockMultipartFile("selfie", "selfie.jpg", "image/jpeg", "image-content".getBytes());

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(storageService.store(validFile)).thenReturn("uploads/selfie.jpg");
        when(kycDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockKyc));
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(selfieDetailsRepository.save(any(SelfieDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SelfieDetails result = selfieService.uploadSelfie(1L, validFile, "user@example.com");

        assertNotNull(result);
        assertEquals("uploads/selfie.jpg", result.getSelfieUrl());
        assertEquals(0, result.getMatchScore().compareTo(BigDecimal.valueOf(95.00)));
        assertTrue(result.isLivenessPassed());
        assertEquals("APPROVED", result.getStatus());

        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.SELFIE_PENDING, ApplicationStatus.SELFIE_UNDER_REVIEW);
    }

    @Test
    void uploadSelfie_Failure_UnderReview() {
        MockMultipartFile failingFile = new MockMultipartFile("selfie", "fail.jpg", "image/jpeg", "image-content".getBytes());

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(storageService.store(failingFile)).thenReturn("uploads/fail.jpg");
        when(kycDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockKyc));
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(selfieDetailsRepository.save(any(SelfieDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SelfieDetails result = selfieService.uploadSelfie(1L, failingFile, "user@example.com");

        assertNotNull(result);
        assertEquals("uploads/fail.jpg", result.getSelfieUrl());
        assertEquals(0, result.getMatchScore().compareTo(BigDecimal.valueOf(45.00)));
        assertFalse(result.isLivenessPassed());
        assertEquals("REJECTED", result.getStatus());

        verify(loanApplicationService, times(1)).updateApplicationStatus(mockUser, ApplicationStatus.SELFIE_PENDING, ApplicationStatus.SELFIE_UNDER_REVIEW);
    }

    @Test
    void uploadSelfie_CaseInsensitiveFailures() {
        MockMultipartFile failingFileUpper = new MockMultipartFile("selfie", "FAIL.png", "image/png", "image-content".getBytes());
        MockMultipartFile failingFileMixed = new MockMultipartFile("selfie", "test-fAiL-selfie.jpeg", "image/jpeg", "image-content".getBytes());

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(kycDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockKyc));
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.empty());
        when(selfieDetailsRepository.save(any(SelfieDetails.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Test mixed-case
        SelfieDetails resultMixed = selfieService.uploadSelfie(1L, failingFileMixed, "user@example.com");
        assertEquals(0, resultMixed.getMatchScore().compareTo(BigDecimal.valueOf(45.00)));

        // Test upper-case
        SelfieDetails resultUpper = selfieService.uploadSelfie(1L, failingFileUpper, "user@example.com");
        assertEquals(0, resultUpper.getMatchScore().compareTo(BigDecimal.valueOf(45.00)));
    }

    @Test
    void uploadSelfie_WrongStatus_ThrowsException() {
        MockMultipartFile validFile = new MockMultipartFile("selfie", "selfie.jpg", "image/jpeg", "image-content".getBytes());
        mockApplication.setStatus(ApplicationStatus.APPROVED);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> selfieService.uploadSelfie(1L, validFile, "user@example.com"));
        verify(selfieDetailsRepository, never()).save(any());
    }

    @Test
    void uploadSelfie_AccessDenied_ThrowsException() {
        MockMultipartFile validFile = new MockMultipartFile("selfie", "selfie.jpg", "image/jpeg", "image-content".getBytes());
        User otherUser = User.builder().id(99L).email("other@example.com").build();
        mockApplication.setUser(otherUser);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> selfieService.uploadSelfie(1L, validFile, "user@example.com"));
    }

    @Test
    void uploadSelfie_MissingFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile("selfie", "selfie.jpg", "image/jpeg", new byte[0]);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));

        assertThrows(IllegalArgumentException.class, () -> selfieService.uploadSelfie(1L, emptyFile, "user@example.com"));
    }

    @Test
    void getSelfieDetails_AdminGet_Success() {
        SelfieDetails mockDetails = SelfieDetails.builder().id(1L).application(mockApplication).status("APPROVED").build();
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(mockAdmin));
        when(loanApplicationRepository.findById(1L)).thenReturn(Optional.of(mockApplication));
        when(selfieDetailsRepository.findByApplication(mockApplication)).thenReturn(Optional.of(mockDetails));

        SelfieDetails result = selfieService.getSelfieDetails(1L, "admin@example.com");

        assertNotNull(result);
        assertEquals("APPROVED", result.getStatus());
    }
}
