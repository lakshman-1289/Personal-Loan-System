package com.ezfinanz.verification.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsServiceImpl implements SmsService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.api-key}")
    private String apiKey;

    @Value("${twilio.api-secret}")
    private String apiSecret;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        log.info("Initializing Twilio client with Account SID: {}", accountSid);
        try {
            // Initialize Twilio using API Key & Secret for enhanced security
            Twilio.init(apiKey, apiSecret, accountSid);
            log.info("Twilio client initialized successfully.");
        } catch (Exception e) {
            log.error("Failed to initialize Twilio client: {}", e.getMessage(), e);
        }
    }

    @Override
    public void sendSms(String phone, String messageContent) {
        String normalizedPhone = normalizePhoneNumber(phone);
        log.info("Sending Twilio SMS to normalized number: {}", normalizedPhone);
        System.out.printf("[SMS OTP] Code to %s: %s%n", normalizedPhone, messageContent);

        try {
            Message message = Message.creator(
                    new PhoneNumber(normalizedPhone),
                    new PhoneNumber(fromNumber),
                    messageContent
            ).create();

            log.info("Twilio SMS dispatched successfully. SID: {}, Status: {}", message.getSid(), message.getStatus());

        } catch (Exception e) {
            log.warn("Twilio SMS dispatch failed: {}. Falling back to console log print.", e.getMessage());
            System.out.printf("[Twilio Fallback] SMS code to %s: %s%n", normalizedPhone, messageContent);
            // Do not throw exception so the local test flow can proceed using the logged OTP
        }
    }

    /**
     * Normalizes target phone number to E.164 standard required by Twilio.
     */
    private String normalizePhoneNumber(String phone) {
        if (phone == null) {
            throw new IllegalArgumentException("Phone number cannot be null");
        }
        
        String cleanPhone = phone.replaceAll("[^0-9+]", "");
        
        if (cleanPhone.startsWith("+")) {
            return cleanPhone;
        }
        
        // Default to Indian country code +91 if length is exactly 10 digits
        if (cleanPhone.length() == 10) {
            return "+91" + cleanPhone;
        }
        
        // Default prefix fallback
        return "+" + cleanPhone;
    }
}
