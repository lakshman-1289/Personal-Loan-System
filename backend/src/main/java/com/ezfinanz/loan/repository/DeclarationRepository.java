package com.ezfinanz.loan.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.loan.entity.Declaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeclarationRepository extends JpaRepository<Declaration, Long> {
    Optional<Declaration> findByApplication(LoanApplication application);
    Optional<Declaration> findByApplicationId(Long applicationId);
}
