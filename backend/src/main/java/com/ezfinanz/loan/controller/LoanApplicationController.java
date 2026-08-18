package com.ezfinanz.loan.controller;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.loan.service.LoanApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class LoanApplicationController {

    private final LoanApplicationService loanApplicationService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createApplication(Principal principal) {
        LoanApplication application = loanApplicationService.createApplication(principal.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("applicationId", application.getId());
        response.put("status", application.getStatus().name());
        return ResponseEntity.ok(response);
    }
}
