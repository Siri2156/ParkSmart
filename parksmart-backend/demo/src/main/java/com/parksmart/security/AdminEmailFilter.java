package com.parksmart.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.parksmart.model.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class AdminEmailFilter extends OncePerRequestFilter {

    private final String adminEmail;

    public AdminEmailFilter(
            @Value("${admin.email}") String adminEmail
    ) {
        this.adminEmail = adminEmail;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/admin")) {

            HttpSession session = request.getSession(false);

            User user = session != null
                    ? (User) session.getAttribute("USER")
                    : null;

            if (user == null || !adminEmail.equalsIgnoreCase(user.getEmail())) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}