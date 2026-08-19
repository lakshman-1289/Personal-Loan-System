package com.ezfinanz.selfie.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.selfie.entity.SelfieDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SelfieDetailsRepository extends JpaRepository<SelfieDetails, Long> {
    Optional<SelfieDetails> findByApplication(LoanApplication application);
    Optional<SelfieDetails> findByApplicationId(Long applicationId);
}
