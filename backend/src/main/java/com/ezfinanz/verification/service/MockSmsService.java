package com.ezfinanz.verification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MockSmsService implements SmsService {

    @Override
    public void sendSms(String phone, String message) {
        log.info("[MockSms] SMS to {}: {}", phone, message);
        System.out.printf("[MockSms] SMS to %s: %s%n", phone, message);
    }
}
