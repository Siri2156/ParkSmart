package com.parksmart.security;

import com.parksmart.model.User;
import com.parksmart.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final String adminEmail;
    private final String frontendUrl;

    public OAuthSuccessHandler(
            UserRepository userRepository,
            @Value("${admin.email}") String adminEmail,
            @Value("${frontend.url}") String frontendUrl
    ) {
        this.userRepository = userRepository;
        this.adminEmail = adminEmail;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        // Get Google user information
        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // Safety check
        if (email == null || email.isBlank()) {
            response.sendRedirect(
                    frontendUrl + "/login?googleError=invalid"
            );
            return;
        }

        /*
         * CASE 1:
         * Check whether the Google email belongs to the admin.
         *
         * The admin does not need to be a normal registered user.
         * If the Google email matches admin.email,
         * allow direct admin login.
         */
        if (email.equalsIgnoreCase(adminEmail)) {

            User adminUser = userRepository
                    .findByEmail(email)
                    .orElseGet(() -> {

                        User newAdmin = new User();

                        newAdmin.setEmail(email);
                        newAdmin.setName(
                                name != null ? name : "Admin"
                        );
                        newAdmin.setRole("ADMIN");

                        return userRepository.save(newAdmin);
                    });

            // Make sure the account has ADMIN role
            adminUser.setRole("ADMIN");
            userRepository.save(adminUser);

            // Create application session
            HttpSession session = request.getSession(true);
            session.setAttribute("USER", adminUser);

            // Directly go to admin dashboard
            response.sendRedirect(frontendUrl + "/admin");
            return;
        }

        /*
         * CASE 2:
         * Normal Google user.
         *
         * Only allow login if the email already exists
         * in our database.
         */
        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        /*
         * CASE 3:
         * Google email is NOT registered.
         *
         * Do NOT create a database user.
         * Send the user back to Login with an error flag.
         */
        if (user == null) {

            response.sendRedirect(
                    frontendUrl + "/login?googleError=not_registered"
            );

            return;
        }

        /*
         * Existing registered user.
         *
         * Preserve their existing role.
         */
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
            userRepository.save(user);
        }

        // Create application session
        HttpSession session = request.getSession(true);
        session.setAttribute("USER", user);

        /*
         * Redirect based on role.
         */
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {

            response.sendRedirect(
                    frontendUrl + "/admin"
            );

        } else {

            response.sendRedirect(
                    frontendUrl + "/user-dashboard"
            );
        }
    }
}