package com.ezfinanz.loan.controller;

import com.ezfinanz.loan.dto.DeclarationRequest;
import com.ezfinanz.loan.entity.Declaration;
import com.ezfinanz.loan.service.DeclarationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/declarations")
@RequiredArgsConstructor
public class DeclarationController {

    private final DeclarationService declarationService;

    @PostMapping("/{appId}")
    public ResponseEntity<Declaration> submitDeclaration(
            @PathVariable Long appId,
            @Valid @RequestBody DeclarationRequest request,
            HttpServletRequest httpServletRequest,
            Principal principal) {
        String ipAddress = httpServletRequest.getRemoteAddr();
        return ResponseEntity.ok(declarationService.submitDeclaration(appId, request, ipAddress, principal.getName()));
    }

    @GetMapping("/{appId}")
    public ResponseEntity<Declaration> getDeclaration(
            @PathVariable Long appId,
            Principal principal) {
        return ResponseEntity.ok(declarationService.getDeclaration(appId, principal.getName()));
    }
}
