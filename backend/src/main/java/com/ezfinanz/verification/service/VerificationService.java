package com.ezfinanz.verification.service;

public interface VerificationService {
    void sendEmailOtp(String userEmail);
    void verifyEmailOtp(String token, String userEmail);
    void sendPhoneOtp(String userEmail);
    void verifyPhoneOtp(String token, String userEmail);
}
