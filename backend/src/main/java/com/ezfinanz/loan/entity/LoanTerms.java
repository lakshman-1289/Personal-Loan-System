package com.ezfinanz.loan.entity;

import com.ezfinanz.common.entities.LoanApplication;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "loan_terms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanTerms {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LoanApplication application;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal principal;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal emi;

    @Column(name = "processing_fee", nullable = false, precision = 18, scale = 2)
    private BigDecimal processingFee;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal gst;

    @Column(name = "net_disbursed_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal netDisbursedAmount;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal irr;
}
