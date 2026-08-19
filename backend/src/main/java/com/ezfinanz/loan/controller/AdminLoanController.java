package com.ezfinanz.loan.controller;

import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.loan.dto.AdminApplicationDetails;
import com.ezfinanz.loan.dto.AdminApplicationSummary;
import com.ezfinanz.loan.service.AdminLoanService;
import com.ezfinanz.selfie.dto.SelfieReviewRequest;
import com.ezfinanz.selfie.entity.SelfieDetails;
import com.ezfinanz.common.entities.LoanApplication;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminLoanController {

    private final AdminLoanService adminLoanService;

    @GetMapping("/applications")
    public ResponseEntity<Page<AdminApplicationSummary>> getAllApplications(
            @RequestParam(required = false) ApplicationStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(adminLoanService.getAllApplications(pageable, status));
    }

    @GetMapping("/applications/{appId}")
    public ResponseEntity<AdminApplicationDetails> getApplicationDetails(
            @PathVariable Long appId) {
        return ResponseEntity.ok(adminLoanService.getApplicationDetails(appId));
    }

    @PostMapping("/applications/{appId}/review-selfie")
    public ResponseEntity<SelfieDetails> reviewSelfie(
            @PathVariable Long appId,
            @Valid @RequestBody SelfieReviewRequest request,
            Principal principal) {
        return ResponseEntity.ok(adminLoanService.reviewSelfie(appId, request, principal.getName()));
    }

    @PostMapping("/applications/{appId}/disburse")
    public ResponseEntity<LoanApplication> disburseLoan(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(adminLoanService.disburseLoan(appId, principal.getName()));
    }
}
