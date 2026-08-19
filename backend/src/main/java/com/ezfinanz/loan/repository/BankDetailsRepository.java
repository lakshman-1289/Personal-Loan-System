package com.ezfinanz.loan.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.loan.entity.BankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BankDetailsRepository extends JpaRepository<BankDetails, Long> {
    Optional<BankDetails> findByApplication(LoanApplication application);
    Optional<BankDetails> findByApplicationId(Long applicationId);
}
