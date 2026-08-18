package com.ezfinanz.auth.controller;

import com.ezfinanz.auth.dto.AuthResponse;
import com.ezfinanz.auth.dto.LoginRequest;
import com.ezfinanz.auth.dto.RegisterRequest;
import com.ezfinanz.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest("user@example.com", "password", "9999999999");
        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("user@example.com")
                .role("CUSTOMER")
                .userId(1L)
                .build();

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void register_ValidationFailure() throws Exception {
        RegisterRequest request = new RegisterRequest("invalid-email", "", "123");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists())
                .andExpect(jsonPath("$.password").exists())
                .andExpect(jsonPath("$.phone").exists());
    }

    @Test
    void login_Success() throws Exception {
        LoginRequest request = new LoginRequest("user@example.com", "password");
        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .email("user@example.com")
                .role("CUSTOMER")
                .userId(1L)
                .build();

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }
}
