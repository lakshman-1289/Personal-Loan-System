package com.ezfinanz.loan.controller;

import com.ezfinanz.loan.dto.FinancialVerificationRequest;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.service.FinancialDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/financial-details")
@RequiredArgsConstructor
public class FinancialDetailsAdminController {

    private final FinancialDetailsService financialDetailsService;

    @PutMapping("/{appId}/verify")
    public ResponseEntity<FinancialDetails> verifyFinancialDetails(
            @PathVariable Long appId,
            @RequestBody FinancialVerificationRequest request,
            Principal principal) {
        return ResponseEntity.ok(financialDetailsService.verifyFinancialDetails(appId, request, principal.getName()));
    }
}
