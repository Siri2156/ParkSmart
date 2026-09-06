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

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        String role = email.equalsIgnoreCase(adminEmail)
                ? "ADMIN"
                : "USER";

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail(email);
                    u.setName(name);
                    u.setRole(role);
                    return userRepository.save(u);
                });

        HttpSession session = request.getSession(true);
        session.setAttribute("USER", user);

        response.sendRedirect(frontendUrl + "/login");
    }
}