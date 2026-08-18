package com.ezfinanz.auth.service;

import com.ezfinanz.auth.dto.AuthResponse;
import com.ezfinanz.auth.dto.LoginRequest;
import com.ezfinanz.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
