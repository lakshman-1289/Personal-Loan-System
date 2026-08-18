package com.ezfinanz.verification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MockEmailService implements EmailService {

    @Override
    public void sendOtp(String email, String otp) {
        log.info("[MockEmail] OTP to {} = {}", email, otp);
        System.out.printf("[MockEmail] OTP to %s = %s%n", email, otp);
    }
}
