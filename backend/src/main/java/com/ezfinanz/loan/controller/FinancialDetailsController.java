package com.ezfinanz.loan.controller;

import com.ezfinanz.loan.dto.FinancialRequest;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.service.FinancialDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/financials")
@RequiredArgsConstructor
public class FinancialDetailsController {

    private final FinancialDetailsService financialDetailsService;

    @PostMapping("/{appId}")
    public ResponseEntity<FinancialDetails> submitFinancials(
            @PathVariable Long appId,
            @Valid @RequestBody FinancialRequest request,
            Principal principal) {
        return ResponseEntity.ok(financialDetailsService.submitFinancials(appId, request, principal.getName()));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<FinancialDetails> getFinancialDetails(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(financialDetailsService.getFinancialDetails(appId, principal.getName()));
    }
}
