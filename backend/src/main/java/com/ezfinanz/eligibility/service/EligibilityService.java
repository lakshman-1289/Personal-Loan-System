package com.ezfinanz.eligibility.service;

import com.ezfinanz.eligibility.dto.EligibilityCheckRequest;
import com.ezfinanz.eligibility.entity.EligibilityResult;

public interface EligibilityService {
    EligibilityResult checkEligibility(Long applicationId, String userEmail);
    EligibilityResult getEligibilityResult(Long applicationId, String userEmail);
}
