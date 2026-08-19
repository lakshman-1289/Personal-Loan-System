package com.ezfinanz.loan.dto;

import com.ezfinanz.loan.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BankDetailsRequest {

    @NotNull(message = "Account number is required")
    @Pattern(regexp = "^\\d{9,18}$", message = "Account number must be numeric and between 9 and 18 digits")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "IFSC code must be standard 11 characters (e.g. HDFC0001234)")
    private String ifscCode;

    @NotNull(message = "Account type is required")
    private AccountType accountType;

    @NotBlank(message = "Branch name is required")
    private String branchName;
}
