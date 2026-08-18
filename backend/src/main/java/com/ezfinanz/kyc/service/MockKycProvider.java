package com.ezfinanz.kyc.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MockKycProvider implements KycProvider {

    @Override
    public boolean verifyIdentity(String idNumber, String idType) {
        log.info("[MockKyc] Verifying identity with ID Number: {}, Type: {}", idNumber, idType);
        return true; // Mock identity validation always passes
    }
}
