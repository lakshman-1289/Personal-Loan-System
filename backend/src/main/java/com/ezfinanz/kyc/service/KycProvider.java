package com.ezfinanz.kyc.service;

public interface KycProvider {
    boolean verifyIdentity(String idNumber, String idType);
}
