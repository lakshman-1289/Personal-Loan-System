package com.ezfinanz.loan.service;

import com.ezfinanz.loan.dto.FinancialRequest;
import com.ezfinanz.loan.entity.FinancialDetails;

public interface FinancialDetailsService {
    FinancialDetails submitFinancials(Long applicationId, FinancialRequest request, String userEmail);
    FinancialDetails getFinancialDetails(Long applicationId, String userEmail);
}
