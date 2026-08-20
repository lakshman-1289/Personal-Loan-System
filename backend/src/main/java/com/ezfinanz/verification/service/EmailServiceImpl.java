package com.ezfinanz.verification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOtp(String email, String otp) {
        log.info("Preparing Thymeleaf-formatted OTP email for recipient: {}", email);
        System.out.printf("[Email OTP] Verification code to %s: %s%n", email, otp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            // Binds variables to Thymeleaf context
            Context context = new Context();
            context.setVariable("email", email);
            context.setVariable("otp", otp);

            // Parses the html template
            String htmlContent = templateEngine.process("otp-email", context);

            // Sets mail properties
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("EZFINANZ Verification Code - " + otp);
            helper.setText(htmlContent, true);

            // Dispatches mail
            mailSender.send(message);
            log.info("Thymeleaf-formatted OTP email sent successfully to {}", email);

        } catch (MessagingException e) {
            log.error("Failed to construct or send mime email to {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Email delivery failed: " + e.getMessage(), e);
        }
    }
}
