package com.ezfinanz.auth.config;

import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@ezfinanz.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.phone:9999999999}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .email(adminEmail)
                    .phone(adminPhone)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .emailVerified(true)
                    .phoneVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("Successfully seeded admin user: {}", adminEmail);
        } else {
            log.info("Admin user already exists in the database.");
        }
    }
}
