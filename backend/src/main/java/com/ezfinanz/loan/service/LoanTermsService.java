package com.ezfinanz.loan.service;

import com.ezfinanz.loan.dto.LoanTermsOptionResponse;
import com.ezfinanz.loan.dto.SelectTermsRequest;
import com.ezfinanz.loan.entity.LoanTerms;

import java.util.List;

public interface LoanTermsService {
    List<LoanTermsOptionResponse> getTermsOptions(Long applicationId, String userEmail);
    LoanTerms selectTerms(Long applicationId, SelectTermsRequest request, String userEmail);
    LoanTerms getSelectedTerms(Long applicationId, String userEmail);
}
