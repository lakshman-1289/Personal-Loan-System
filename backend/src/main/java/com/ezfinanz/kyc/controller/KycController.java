package com.ezfinanz.kyc.controller;

import com.ezfinanz.common.service.StorageService;
import com.ezfinanz.kyc.dto.KycRequest;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.kyc.service.KycService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;
    private final StorageService storageService;

    @PostMapping("/{appId}")
    public ResponseEntity<KycDetails> submitKyc(
            @PathVariable Long appId,
            @Valid @RequestBody KycRequest request,
            Principal principal) {
        return ResponseEntity.ok(kycService.submitKyc(appId, request, principal.getName()));
    }

    @PutMapping("/{appId}")
    public ResponseEntity<KycDetails> updateKyc(
            @PathVariable Long appId,
            @Valid @RequestBody KycRequest request,
            Principal principal) {
        return ResponseEntity.ok(kycService.submitKyc(appId, request, principal.getName()));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<KycDetails> getKycDetails(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(kycService.getKycDetails(appId, principal.getName()));
    }

    @PostMapping("/{appId}/upload")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @PathVariable Long appId,
            @RequestParam("document") MultipartFile document) {
        String documentUrl = storageService.store(document);
        Map<String, String> response = new HashMap<>();
        response.put("documentUrl", documentUrl);
        return ResponseEntity.ok(response);
    }
}
