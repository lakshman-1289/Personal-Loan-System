package com.ezfinanz.loan.dto;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import com.ezfinanz.kyc.entity.KycDetails;
import com.ezfinanz.loan.entity.BankDetails;
import com.ezfinanz.loan.entity.Declaration;
import com.ezfinanz.loan.entity.FinancialDetails;
import com.ezfinanz.loan.entity.LoanTerms;
import com.ezfinanz.selfie.entity.SelfieDetails;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminApplicationDetails {
    private LoanApplication application;
    private String email;
    private boolean emailVerified;
    private boolean phoneVerified;
    private KycDetails kycDetails;
    private FinancialDetails financialDetails;
    private EligibilityResult eligibilityResult;
    private LoanTerms loanTerms;
    private BankDetails bankDetails;
    private Declaration declaration;
    private SelfieDetails selfieDetails;
}
