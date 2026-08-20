package com.ezfinanz.loan.service;

import com.ezfinanz.common.entities.LoanApplication;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.ApplicationStatus;

import java.util.Optional;

public interface LoanApplicationService {
    LoanApplication createApplication(String userEmail);
    Optional<LoanApplication> getActiveApplication(User user);
    void updateApplicationStatus(User user, ApplicationStatus expectedStatus, ApplicationStatus newStatus);
    Optional<LoanApplication> getLatestApplication(String email);
}
