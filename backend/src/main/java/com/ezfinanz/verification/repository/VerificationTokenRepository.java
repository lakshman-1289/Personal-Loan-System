package com.ezfinanz.verification.repository;

import com.ezfinanz.common.entities.User;
import com.ezfinanz.verification.entity.VerificationToken;
import com.ezfinanz.verification.enums.VerificationTokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByUserAndTokenAndTokenType(User user, String token, VerificationTokenType tokenType);
    void deleteByUserAndTokenType(User user, VerificationTokenType tokenType);
}
