package com.parksmart.controller;

import com.parksmart.dto.BookingRequest;
import com.parksmart.dto.BookingResponse;
import com.parksmart.service.BookingService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService service;

    // 🟢 create booking used by frontend when paying
    @PostMapping("/create")
    public BookingResponse createBooking(@RequestBody BookingRequest request) {
        return service.create(request);
    }

    // ✅ return single booking by id
    @GetMapping("/{bookingId}")
    public BookingResponse getBooking(@PathVariable Long bookingId){
        return service.getById(bookingId);
    }

    // ✅ expose all bookings so user dashboard can fetch /api/bookings
    //    the frontend will filter by current user email/name.
    @GetMapping
    public List<BookingResponse> listBookings() {
        return service.getAllBookingsForAdmin();
    }
    @PutMapping("/{id}/cancel")
public ResponseEntity<BookingResponse> cancelBooking(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            service.cancelBooking(id)
    );
}
}
