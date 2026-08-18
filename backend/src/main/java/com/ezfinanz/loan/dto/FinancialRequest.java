package com.ezfinanz.loan.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialRequest {

    @NotNull(message = "Monthly income is required")
    private BigDecimal monthlyIncome;

    @NotNull(message = "Annual income is required")
    private BigDecimal annualIncome;

    @NotNull(message = "Requested loan amount is required")
    private BigDecimal requestedAmount;

    @NotNull(message = "Credit score is required")
    @Min(value = 300, message = "Credit score must be at least 300")
    @Max(value = 850, message = "Credit score cannot exceed 850")
    private Integer creditScore;

    @NotNull(message = "Existing debt is required")
    private BigDecimal existingDebt;

    @NotBlank(message = "Employer name is required")
    private String employer;

    @NotBlank(message = "Designation is required")
    private String designation;
}
