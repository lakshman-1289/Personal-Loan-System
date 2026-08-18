package com.ezfinanz.verification.service;

import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.customer.repository.UserRepository;
import com.ezfinanz.loan.service.LoanApplicationService;
import com.ezfinanz.verification.entity.VerificationToken;
import com.ezfinanz.verification.enums.VerificationTokenType;
import com.ezfinanz.verification.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationServiceImpl implements VerificationService {

    private final VerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final LoanApplicationService loanApplicationService;
    
    private final Random random = new SecureRandom();

    private String generateOtp() {
        return String.format("%06d", random.nextInt(1000000));
    }

    @Override
    @Transactional
    public void sendEmailOtp(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Delete any existing email token
        tokenRepository.deleteByUserAndTokenType(user, VerificationTokenType.EMAIL);

        String otp = generateOtp();
        VerificationToken token = VerificationToken.builder()
                .user(user)
                .token(otp)
                .tokenType(VerificationTokenType.EMAIL)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();

        tokenRepository.save(token);
        emailService.sendOtp(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void verifyEmailOtp(String token, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        VerificationToken verificationToken = tokenRepository.findByUserAndTokenAndTokenType(user, token, VerificationTokenType.EMAIL)
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP code"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("OTP code has expired");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        log.info("Email verified successfully for user: {}", userEmail);

        // Advance active loan application status
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.EMAIL_VERIFICATION, ApplicationStatus.PHONE_VERIFICATION);
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.DRAFT, ApplicationStatus.PHONE_VERIFICATION);
    }

    @Override
    @Transactional
    public void sendPhoneOtp(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        // Delete any existing phone token
        tokenRepository.deleteByUserAndTokenType(user, VerificationTokenType.PHONE);

        String otp = generateOtp();
        VerificationToken token = VerificationToken.builder()
                .user(user)
                .token(otp)
                .tokenType(VerificationTokenType.PHONE)
                .expiryDate(LocalDateTime.now().plusMinutes(10))
                .build();

        tokenRepository.save(token);
        smsService.sendSms(user.getPhone(), "Your EZFINANZ phone verification OTP code is " + otp);
    }

    @Override
    @Transactional
    public void verifyPhoneOtp(String token, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        VerificationToken verificationToken = tokenRepository.findByUserAndTokenAndTokenType(user, token, VerificationTokenType.PHONE)
                .orElseThrow(() -> new IllegalArgumentException("Invalid OTP code"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("OTP code has expired");
        }

        user.setPhoneVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        log.info("Phone verified successfully for user: {}", userEmail);

        // Advance active loan application status
        loanApplicationService.updateApplicationStatus(user, ApplicationStatus.PHONE_VERIFICATION, ApplicationStatus.KYC_PENDING);
    }
}
