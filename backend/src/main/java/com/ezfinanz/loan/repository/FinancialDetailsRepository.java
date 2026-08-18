package com.ezfinanz.loan.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.loan.entity.FinancialDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FinancialDetailsRepository extends JpaRepository<FinancialDetails, Long> {
    Optional<FinancialDetails> findByApplication(LoanApplication application);
    Optional<FinancialDetails> findByApplicationId(Long applicationId);
}
