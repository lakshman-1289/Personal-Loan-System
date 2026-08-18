package com.ezfinanz.verification.controller;

import com.ezfinanz.verification.dto.OtpVerificationRequest;
import com.ezfinanz.verification.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/verification")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping("/email/send")
    public ResponseEntity<Map<String, String>> sendEmailOtp(Principal principal) {
        verificationService.sendEmailOtp(principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verification OTP sent successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/email/verify")
    public ResponseEntity<Map<String, String>> verifyEmailOtp(
            Principal principal,
            @Valid @RequestBody OtpVerificationRequest request) {
        verificationService.verifyEmailOtp(request.getToken(), principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/phone/send")
    public ResponseEntity<Map<String, String>> sendPhoneOtp(Principal principal) {
        verificationService.sendPhoneOtp(principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Phone verification OTP sent successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/phone/verify")
    public ResponseEntity<Map<String, String>> verifyPhoneOtp(
            Principal principal,
            @Valid @RequestBody OtpVerificationRequest request) {
        verificationService.verifyPhoneOtp(request.getToken(), principal.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Phone verified successfully");
        return ResponseEntity.ok(response);
    }
}
