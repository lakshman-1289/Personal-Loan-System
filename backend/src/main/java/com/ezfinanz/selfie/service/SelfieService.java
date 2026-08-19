package com.ezfinanz.selfie.service;

import com.ezfinanz.selfie.entity.SelfieDetails;
import org.springframework.web.multipart.MultipartFile;

public interface SelfieService {
    SelfieDetails uploadSelfie(Long applicationId, MultipartFile file, String userEmail);
    SelfieDetails getSelfieDetails(Long applicationId, String userEmail);
}
