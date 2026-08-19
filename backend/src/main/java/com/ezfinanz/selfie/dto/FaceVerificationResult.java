package com.ezfinanz.selfie.dto;

import java.math.BigDecimal;

public record FaceVerificationResult(
        BigDecimal matchScore,
        boolean livenessPassed,
        String status
) {
}
