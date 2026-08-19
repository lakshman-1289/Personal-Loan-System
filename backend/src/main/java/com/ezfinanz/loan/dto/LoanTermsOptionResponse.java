package com.ezfinanz.loan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTermsOptionResponse {
    private Integer tenureMonths;
    private BigDecimal principal;
    private BigDecimal interestRate;
    private BigDecimal emi;
    private BigDecimal processingFee;
    private BigDecimal gst;
    private BigDecimal netDisbursedAmount;
    private BigDecimal irr;
}
