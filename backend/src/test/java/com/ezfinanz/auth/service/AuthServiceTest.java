package com.ezfinanz.auth.service;

import com.ezfinanz.auth.dto.AuthResponse;
import com.ezfinanz.auth.dto.LoginRequest;
import com.ezfinanz.auth.dto.RegisterRequest;
import com.ezfinanz.auth.util.JwtTokenProvider;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("test@example.com", "password123", "9876543210");
        loginRequest = new LoginRequest("test@example.com", "password123");
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .phone("9876543210")
                .password("hashed_password")
                .role(Role.CUSTOMER)
                .build();
    }

    @Test
    void register_Success() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed_password");
        when(userRepository.save(any())).thenReturn(mockUser);
        when(jwtTokenProvider.generateToken(any())).thenReturn("mocked_token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mocked_token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
        verify(userRepository, times(1)).save(any());
    }

    @Test
    void register_EmailAlreadyExists_ThrowsException() {
        when(userRepository.existsByEmail(any())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_PhoneAlreadyExists_ThrowsException() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtTokenProvider.generateToken(any())).thenReturn("mocked_token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mocked_token", response.getToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
    }

    @Test
    void login_InvalidEmail_ThrowsException() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_InvalidPassword_ThrowsException() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.login(loginRequest));
    }
}
