package com.ezfinanz.loan.controller;

import com.ezfinanz.loan.dto.BankDetailsRequest;
import com.ezfinanz.loan.entity.BankDetails;
import com.ezfinanz.loan.service.BankDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/banking")
@RequiredArgsConstructor
public class BankDetailsController {

    private final BankDetailsService bankDetailsService;

    @PostMapping("/{appId}")
    public ResponseEntity<BankDetails> submitBankDetails(
            @PathVariable Long appId,
            @Valid @RequestBody BankDetailsRequest request,
            Principal principal) {
        return ResponseEntity.ok(bankDetailsService.submitBankDetails(appId, request, principal.getName()));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<BankDetails> getBankDetails(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(bankDetailsService.getBankDetails(appId, principal.getName()));
    }
}
