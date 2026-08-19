package com.ezfinanz.loan.entity;

import com.ezfinanz.common.entities.LoanApplication;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "financial_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LoanApplication application;

    @Column(name = "monthly_income", nullable = false, precision = 18, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(name = "annual_income", nullable = false, precision = 18, scale = 2)
    private BigDecimal annualIncome;

    @Column(name = "requested_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal requestedAmount;

    @Column(name = "credit_score", nullable = false)
    private Integer creditScore;

    @Column(name = "existing_debt", nullable = false, precision = 18, scale = 2)
    private BigDecimal existingDebt;

    @Column(nullable = false, length = 100)
    private String employer;

    @Column(nullable = false, length = 100)
    private String designation;

    @Column(name = "income_verified", nullable = false)
    @Builder.Default
    private boolean incomeVerified = false;

    @Column(name = "debt_verified", nullable = false)
    @Builder.Default
    private boolean debtVerified = false;

    @Column(name = "credit_score_verified", nullable = false)
    @Builder.Default
    private boolean creditScoreVerified = false;
}
