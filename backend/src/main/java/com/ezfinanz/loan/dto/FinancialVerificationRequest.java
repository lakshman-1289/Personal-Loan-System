package com.ezfinanz.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialVerificationRequest {
    private boolean incomeVerified;
    private boolean debtVerified;
    private boolean creditScoreVerified;
}
