package com.ezfinanz.eligibility.controller;

import com.ezfinanz.eligibility.dto.EligibilityCheckRequest;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import com.ezfinanz.eligibility.service.EligibilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/eligibility")
@RequiredArgsConstructor
public class EligibilityController {

    private final EligibilityService eligibilityService;

    @PostMapping("/{appId}/check")
    public ResponseEntity<EligibilityResult> checkEligibility(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(eligibilityService.checkEligibility(appId, principal.getName()));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<EligibilityResult> getEligibilityResult(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(eligibilityService.getEligibilityResult(appId, principal.getName()));
    }
}
