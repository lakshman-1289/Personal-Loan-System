package com.ezfinanz.eligibility.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.eligibility.entity.EligibilityResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EligibilityResultRepository extends JpaRepository<EligibilityResult, Long> {
    Optional<EligibilityResult> findByApplication(LoanApplication application);
    Optional<EligibilityResult> findByApplicationId(Long applicationId);
}
