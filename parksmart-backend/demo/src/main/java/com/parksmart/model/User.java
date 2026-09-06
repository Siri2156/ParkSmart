package com.parksmart.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String email;
    
    private String name;

    private String password;
    
    private String role; // "user" or "admin"
    
    private String googleId;
    
    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime createdAt;
    
    @Column(columnDefinition = "TIMESTAMP NULL")
    private java.time.LocalDateTime lastLogin;
    
    public User(String email, String name, String role, String googleId) {
        this.email = email;
        this.name = name;
        this.role = role;
        this.googleId = googleId;
        this.createdAt = java.time.LocalDateTime.now();
    }

    public java.time.LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(java.time.LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
}