package com.parksmart.controller;

import com.parksmart.model.User;
import com.parksmart.repository.UserRepository;
import com.parksmart.dto.LoginRequest;
import com.parksmart.dto.RegisterRequest;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final String adminEmail;

    public AuthController(
            @Value("${admin.email}") String adminEmail
    ) {
        this.adminEmail = adminEmail;
    }

    /*
     * ================================
     * GOOGLE LOGIN (SIMULATED / TEMP)
     * ================================
     */
    @PostMapping("/google/login")
    public ResponseEntity<?> googleLogin(
            @RequestParam String email,
            @RequestParam String name,
            HttpSession session
    ) {

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);

                    // Set role based on configured admin email
                    if (email.equalsIgnoreCase(adminEmail)) {
                        newUser.setRole("ADMIN");
                    } else {
                        newUser.setRole("USER");
                    }

                    return userRepository.save(newUser);
                });

        // Update role for existing users
        if (email.equalsIgnoreCase(adminEmail)) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        userRepository.save(user);

        // Store user in session
        session.setAttribute("USER", user);

        return ResponseEntity.ok(user);
    }


    /*
     * ================================
     * REGISTER
     * ================================
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request,
            HttpSession session
    ) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email is already registered");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Check whether registered user is admin
        if (request.getEmail().equalsIgnoreCase(adminEmail)) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        userRepository.save(user);

        session.setAttribute("USER", user);

        return ResponseEntity.ok(user);
    }


    /*
     * ================================
     * LOGIN
     * ================================
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request,
            HttpSession session
    ) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null
                || user.getPassword() == null
                || !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword()
                )) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        // Ensure correct role
        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }

        userRepository.save(user);

        session.setAttribute("USER", user);

        return ResponseEntity.ok(user);
    }


    /*
     * ================================
     * GET CURRENT USER
     * ================================
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {

        User user = (User) session.getAttribute("USER");

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .build();
        }

        return ResponseEntity.ok(user);
    }
    @PostMapping("/google/mode")
public ResponseEntity<?> setGoogleMode(
        @RequestParam String mode,
        HttpSession session
) {
    if (!mode.equals("login") && !mode.equals("register")) {
        return ResponseEntity.badRequest().body("Invalid Google mode");
    }

    session.setAttribute("GOOGLE_MODE", mode);

    return ResponseEntity.ok().build();
}


    /*
     * ================================
     * LOGOUT
     * ================================
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok().build();
    }
}