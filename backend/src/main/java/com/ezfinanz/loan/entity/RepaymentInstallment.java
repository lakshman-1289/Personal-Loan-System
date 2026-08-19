package com.ezfinanz.loan.entity;

import com.ezfinanz.common.entities.LoanApplication;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "repayment_installments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepaymentInstallment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private LoanApplication application;

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal emi;

    @Column(name = "principal_component", nullable = false, precision = 18, scale = 2)
    private BigDecimal principalComponent;

    @Column(name = "interest_component", nullable = false, precision = 18, scale = 2)
    private BigDecimal interestComponent;

    @Column(name = "outstanding_balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal outstandingBalance;

    @Column(nullable = false, length = 20)
    private String status; // PENDING, PAID
}
