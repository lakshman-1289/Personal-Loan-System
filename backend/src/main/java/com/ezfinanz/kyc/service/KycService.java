package com.ezfinanz.kyc.service;

import com.ezfinanz.kyc.dto.KycRequest;
import com.ezfinanz.kyc.entity.KycDetails;

public interface KycService {
    KycDetails submitKyc(Long applicationId, KycRequest request, String userEmail);
    KycDetails getKycDetails(Long applicationId, String userEmail);
}
