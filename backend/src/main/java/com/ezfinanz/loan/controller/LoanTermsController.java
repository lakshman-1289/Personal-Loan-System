package com.ezfinanz.loan.controller;

import com.ezfinanz.loan.dto.LoanTermsOptionResponse;
import com.ezfinanz.loan.dto.SelectTermsRequest;
import com.ezfinanz.loan.entity.LoanTerms;
import com.ezfinanz.loan.service.LoanTermsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class LoanTermsController {

    private final LoanTermsService loanTermsService;

    @GetMapping("/{appId}/terms-options")
    public ResponseEntity<List<LoanTermsOptionResponse>> getTermsOptions(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(loanTermsService.getTermsOptions(appId, principal.getName()));
    }

    @PostMapping("/{appId}/select-terms")
    public ResponseEntity<LoanTerms> selectTerms(
            @PathVariable Long appId,
            @Valid @RequestBody SelectTermsRequest request,
            Principal principal) {
        return ResponseEntity.ok(loanTermsService.selectTerms(appId, request, principal.getName()));
    }

    @GetMapping("/{appId}/terms")
    public ResponseEntity<LoanTerms> getSelectedTerms(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(loanTermsService.getSelectedTerms(appId, principal.getName()));
    }
}
