package com.ezfinanz.verification.service;

public interface SmsService {
    void sendSms(String phone, String message);
}
