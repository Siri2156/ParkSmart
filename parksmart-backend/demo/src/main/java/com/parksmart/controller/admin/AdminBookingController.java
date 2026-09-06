package com.parksmart.controller.admin;

import com.parksmart.dto.BookingResponse;
import com.parksmart.model.Booking;
import com.parksmart.model.enums.SlotStatus;
import com.parksmart.repository.BookingRepository;
import com.parksmart.repository.SlotRepository;
import com.parksmart.model.Slot;
import com.parksmart.model.enums.BookingStatus;
import com.parksmart.service.BookingService;
import lombok.RequiredArgsConstructor;
import com.parksmart.model.enums.PaymentStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
public class AdminBookingController {

    private final BookingService bookingService;
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SlotRepository slotRepository;

    // ✅ Get ALL bookings (Admin only)
    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookingsForAdmin());
    }

    // ✅ Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PatchMapping("/{id}/cancel")
public ResponseEntity<?> cancelBooking(@PathVariable Long id) {

    Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    // 1️⃣ Change booking status
    booking.setStatus(BookingStatus.CANCELLED);

    // 2️⃣ Release slot
    Slot slot = booking.getSlot();
    slot.setStatus(SlotStatus.AVAILABLE);

    slotRepository.save(slot);
    bookingRepository.save(booking);

    return ResponseEntity.ok("Booking cancelled successfully");
}

@PatchMapping("/{id}/complete")
public ResponseEntity<?> completeBooking(@PathVariable Long id) {

    Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    // Update booking status
    booking.setStatus(BookingStatus.COMPLETED);

    // Free the slot
    Slot slot = booking.getSlot();
    slot.setStatus(SlotStatus.AVAILABLE);

    slotRepository.save(slot);
    bookingRepository.save(booking);

    return ResponseEntity.ok("Booking marked as completed");
}

@PatchMapping("/{id}/activate")
public ResponseEntity<?> activateBooking(@PathVariable Long id) {

    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Booking not found"));

    booking.setStatus(BookingStatus.ACTIVE);

    bookingRepository.save(booking);

    return ResponseEntity.ok("Booking activated");
}

/**
     * UPDATE PAYMENT STATUS ONLY
     */
    @PatchMapping("/{id}/payment")
    public Booking updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status
    ) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setPaymentStatus(status);

        return bookingRepository.save(booking);
    }
}