package com.ezfinanz.auth.config;

import com.ezfinanz.auth.util.JwtTokenProvider;
import com.ezfinanz.common.entities.User;
import com.ezfinanz.common.enums.Role;
import com.ezfinanz.customer.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            log.error("Email not found in OAuth2 provider response");
            response.sendRedirect("http://localhost:3000/login?error=email_not_found");
            return;
        }

        log.info("OAuth2 login successful for email: {}", email);

        // Find or register user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Registering new OAuth2 user: {}", email);
            
            // Generate a unique 10-digit dummy phone number to satisfy unique constraint
            String dummyPhone = "99" + String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits()) % 100000000L);
            
            // Check in case it collides (rare)
            while (userRepository.existsByPhone(dummyPhone)) {
                dummyPhone = "99" + String.format("%08d", Math.abs(UUID.randomUUID().getMostSignificantBits()) % 100000000L);
            }

            User newUser = User.builder()
                    .email(email)
                    .phone(dummyPhone)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(Role.CUSTOMER)
                    .emailVerified(true)
                    .phoneVerified(false)
                    .build();
            return userRepository.save(newUser);
        });

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user);

        // Redirect to frontend landing page with token
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/login/oauth2/success")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
