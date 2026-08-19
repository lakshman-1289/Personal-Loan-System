package com.ezfinanz.loan.repository;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByUser(User user);
    Optional<LoanApplication> findFirstByUserOrderByCreatedAtDesc(User user);
    org.springframework.data.domain.Page<LoanApplication> findByStatus(com.ezfinanz.common.enums.ApplicationStatus status, org.springframework.data.domain.Pageable pageable);
}
