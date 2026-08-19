package com.ezfinanz.selfie.service;

import com.ezfinanz.selfie.dto.FaceVerificationResult;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Service
public class MockFaceVerificationService implements FaceVerificationService {

    @Override
    public FaceVerificationResult verify(MultipartFile selfie, String kycDocumentUrl) {
        if (selfie == null || selfie.isEmpty()) {
            throw new IllegalArgumentException("Selfie file is missing or empty");
        }

        String originalFilename = selfie.getOriginalFilename();
        if (originalFilename != null && originalFilename.toLowerCase().contains("fail")) {
            return new FaceVerificationResult(
                    BigDecimal.valueOf(45.00),
                    false,
                    "REJECTED"
            );
        }

        return new FaceVerificationResult(
                BigDecimal.valueOf(95.00),
                true,
                "APPROVED"
        );
    }
}
