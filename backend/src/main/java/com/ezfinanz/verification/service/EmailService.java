package com.ezfinanz.verification.service;

public interface EmailService {
    void sendOtp(String email, String otp);
}
