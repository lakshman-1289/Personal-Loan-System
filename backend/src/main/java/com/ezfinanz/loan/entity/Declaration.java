package com.ezfinanz.loan.entity;

import com.ezfinanz.common.entities.LoanApplication;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "declarations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Declaration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LoanApplication application;

    @Column(name = "accepted_privacy_policy", nullable = false)
    private boolean acceptedPrivacyPolicy;

    @Column(name = "accepted_terms_and_conditions", nullable = false)
    private boolean acceptedTermsAndConditions;

    @Column(name = "accepted_credit_bureau_consent", nullable = false)
    private boolean acceptedCreditBureauConsent;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "consent_timestamp", nullable = false)
    private LocalDateTime consentTimestamp;
}
