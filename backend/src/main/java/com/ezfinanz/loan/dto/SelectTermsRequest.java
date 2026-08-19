package com.ezfinanz.loan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SelectTermsRequest {

    @NotNull(message = "Tenure is required")
    @Min(value = 1, message = "Tenure must be at least 1 month")
    private Integer tenureMonths;

    @NotNull(message = "Requested loan amount is required")
    @DecimalMin(value = "1.00", message = "Requested loan amount must be positive")
    private BigDecimal requestedAmount;
}
