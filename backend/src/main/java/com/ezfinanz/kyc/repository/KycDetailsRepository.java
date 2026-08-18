package com.ezfinanz.kyc.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.kyc.entity.KycDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KycDetailsRepository extends JpaRepository<KycDetails, Long> {
    Optional<KycDetails> findByApplication(LoanApplication application);
    Optional<KycDetails> findByApplicationId(Long applicationId);
}
