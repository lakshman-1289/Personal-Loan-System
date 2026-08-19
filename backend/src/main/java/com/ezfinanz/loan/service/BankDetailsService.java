package com.ezfinanz.loan.service;

import com.ezfinanz.loan.dto.BankDetailsRequest;
import com.ezfinanz.loan.entity.BankDetails;

public interface BankDetailsService {
    BankDetails submitBankDetails(Long applicationId, BankDetailsRequest request, String userEmail);
    BankDetails getBankDetails(Long applicationId, String userEmail);
}
