package com.ezfinanz.eligibility.entity;

import com.ezfinanz.common.entities.LoanApplication;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "eligibility_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EligibilityResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LoanApplication application;

    @Column(name = "credit_score", nullable = false)
    private Integer creditScore;

    @Column(name = "debt_to_income_ratio", nullable = false, precision = 5, scale = 2)
    private BigDecimal debtToIncomeRatio;

    @Column(name = "max_eligible_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal maxEligibleAmount;

    @Column(nullable = false, length = 30)
    private String result;

    @Column(length = 255)
    private String reason;
}
