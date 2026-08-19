package com.ezfinanz.selfie.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelfieResponse {
    private String selfieUrl;
    private BigDecimal matchScore;
    private boolean livenessPassed;
    private String status;
    private LocalDateTime verifiedAt;
}
