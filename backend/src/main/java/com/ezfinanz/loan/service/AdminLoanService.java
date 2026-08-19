package com.ezfinanz.loan.service;

import com.ezfinanz.common.enums.ApplicationStatus;
import com.ezfinanz.loan.dto.AdminApplicationDetails;
import com.ezfinanz.loan.dto.AdminApplicationSummary;
import com.ezfinanz.selfie.dto.SelfieReviewRequest;
import com.ezfinanz.selfie.entity.SelfieDetails;
import com.ezfinanz.common.entities.LoanApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminLoanService {
    Page<AdminApplicationSummary> getAllApplications(Pageable pageable, ApplicationStatus status);
    AdminApplicationDetails getApplicationDetails(Long applicationId);
    SelfieDetails reviewSelfie(Long applicationId, SelfieReviewRequest review, String adminEmail);
    LoanApplication disburseLoan(Long applicationId, String adminEmail);
}
