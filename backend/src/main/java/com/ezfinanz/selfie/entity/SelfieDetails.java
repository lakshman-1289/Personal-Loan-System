package com.ezfinanz.selfie.entity;

import com.ezfinanz.common.entities.LoanApplication;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "selfie_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SelfieDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private LoanApplication application;

    @Column(name = "selfie_url", nullable = false)
    private String selfieUrl;

    @Column(name = "match_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal matchScore;

    @Column(name = "liveness_passed", nullable = false)
    private boolean livenessPassed;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "verified_at", nullable = false)
    private LocalDateTime verifiedAt;
}
