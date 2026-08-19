package com.ezfinanz.loan.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.loan.entity.RepaymentInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepaymentInstallmentRepository extends JpaRepository<RepaymentInstallment, Long> {
    List<RepaymentInstallment> findByApplication(LoanApplication application);
    List<RepaymentInstallment> findByApplicationId(Long applicationId);
}
