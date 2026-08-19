package com.ezfinanz.selfie.controller;

import com.ezfinanz.selfie.dto.SelfieResponse;
import com.ezfinanz.selfie.entity.SelfieDetails;
import com.ezfinanz.selfie.service.SelfieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/selfie")
@RequiredArgsConstructor
public class SelfieController {

    private final SelfieService selfieService;

    @PostMapping("/{appId}/upload")
    public ResponseEntity<SelfieResponse> uploadSelfie(
            @PathVariable Long appId,
            @RequestParam("selfie") MultipartFile selfie,
            Principal principal) {
        SelfieDetails details = selfieService.uploadSelfie(appId, selfie, principal.getName());
        return ResponseEntity.ok(mapToResponse(details));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<SelfieResponse> getSelfieDetails(
            @PathVariable Long appId,
            Principal principal) {
        SelfieDetails details = selfieService.getSelfieDetails(appId, principal.getName());
        return ResponseEntity.ok(mapToResponse(details));
    }

    private SelfieResponse mapToResponse(SelfieDetails details) {
        return SelfieResponse.builder()
                .selfieUrl(details.getSelfieUrl())
                .matchScore(details.getMatchScore())
                .livenessPassed(details.isLivenessPassed())
                .status(details.getStatus())
                .verifiedAt(details.getVerifiedAt())
                .build();
    }
}
