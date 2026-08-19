package com.ezfinanz.eligibility.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EligibilityCheckRequest {

    @NotNull(message = "Credit score is required")
    @Min(value = 300, message = "Credit score must be at least 300")
    @Max(value = 850, message = "Credit score cannot exceed 850")
    private Integer creditScore;

    @NotNull(message = "Monthly income is required")
    @Min(value = 1, message = "Monthly income must be greater than zero")
    private BigDecimal income;

    @NotNull(message = "Existing debt is required")
    @Min(value = 0, message = "Existing debt cannot be negative")
    private BigDecimal debt;

    @NotNull(message = "Requested amount is required")
    @Min(value = 1, message = "Requested amount must be greater than zero")
    private BigDecimal requestedAmount;
}
