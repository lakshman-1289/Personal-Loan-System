package com.ezfinanz.loan.service;

import com.ezfinanz.loan.dto.DeclarationRequest;
import com.ezfinanz.loan.entity.Declaration;

public interface DeclarationService {
    Declaration submitDeclaration(Long applicationId, DeclarationRequest request, String ipAddress, String userEmail);
    Declaration getDeclaration(Long applicationId, String userEmail);
}
