package com.ezfinanz.loan.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.loan.entity.LoanTerms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoanTermsRepository extends JpaRepository<LoanTerms, Long> {
    Optional<LoanTerms> findByApplication(LoanApplication application);
    Optional<LoanTerms> findByApplicationId(Long applicationId);
}
