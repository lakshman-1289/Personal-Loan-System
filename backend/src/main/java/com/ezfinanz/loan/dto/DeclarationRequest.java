package com.ezfinanz.loan.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeclarationRequest {

    @NotNull(message = "Privacy policy acceptance is required")
    @AssertTrue(message = "You must accept the privacy policy to proceed")
    private Boolean acceptedPrivacyPolicy;

    @NotNull(message = "Terms and conditions acceptance is required")
    @AssertTrue(message = "You must accept the terms and conditions to proceed")
    private Boolean acceptedTermsAndConditions;

    @NotNull(message = "Credit bureau consent is required")
    @AssertTrue(message = "You must accept the credit bureau consent to proceed")
    private Boolean acceptedCreditBureauConsent;
}
