package com.ezfinanz.loan.dto;

import com.ezfinanz.common.enums.ApplicationStatus;
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
public class AdminApplicationSummary {
    private Long applicationId;
    private String applicantName;
    private BigDecimal requestedAmount;
    private Integer tenureMonths;
    private ApplicationStatus status;
    private LocalDateTime submittedAt;
}
