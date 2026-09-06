package com.parksmart.controller.admin;

import com.parksmart.model.User;
import com.parksmart.model.Booking;
import com.parksmart.repository.UserRepository;
import com.parksmart.repository.BookingRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    /*
     * ==============================
     * GET ALL USERS
     * ==============================
     */
    @GetMapping("/users")
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Populate lastLogin from createdAt when lastLogin is missing.
        // Use reflection to avoid compile errors if getters/setters are not
        // available in the local IDE compilation state.
        try {
            java.lang.reflect.Field lastLoginField = com.parksmart.model.User.class.getDeclaredField("lastLogin");
            java.lang.reflect.Field createdField = com.parksmart.model.User.class.getDeclaredField("createdAt");
            lastLoginField.setAccessible(true);
            createdField.setAccessible(true);
            for (User u : users) {
                try {
                    Object last = lastLoginField.get(u);
                    if (last == null) {
                        Object created = createdField.get(u);
                        if (created != null) {
                            lastLoginField.set(u, created);
                        }
                    }
                } catch (Exception ignore) {
                }
            }
        } catch (NoSuchFieldException ignore) {
            // If fields don't exist, skip population — client will handle missing values
        }

        return users;
    }

    /*
     * ==============================
     * GET ALL BOOKINGS
     * ==============================
     */
    @GetMapping("/users/{userName}/bookings")
    public List<Booking> getAllBookings(@PathVariable("userName") String userName) {
        return bookingRepository.findByUserName(userName);
    }
}