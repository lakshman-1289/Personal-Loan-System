package com.ezfinanz.selfie.service;

import com.ezfinanz.selfie.dto.FaceVerificationResult;
import org.springframework.web.multipart.MultipartFile;

public interface FaceVerificationService {
    FaceVerificationResult verify(MultipartFile selfie, String kycDocumentUrl);
}
