package com.parksmart.service;

import com.parksmart.dto.BookingRequest;
import com.parksmart.dto.BookingResponse;
import com.parksmart.model.Booking;
import com.parksmart.model.Location;
import com.parksmart.model.Slot;
import com.parksmart.model.enums.SlotStatus;
import com.parksmart.model.enums.BookingStatus;
import com.parksmart.repository.BookingRepository;
import com.parksmart.repository.LocationRepository;
import com.parksmart.repository.SlotRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import java.time.ZoneId;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepo;
    private final LocationRepository locationRepo;
    private final SlotRepository slotRepo;

    /* =========================================================
       CREATE BOOKING (Called by frontend when user clicks Pay)
       ========================================================= */
    @Transactional
public BookingResponse create(BookingRequest req) {

    Location location = locationRepo.findById(req.getLocationId())
            .orElseThrow(() -> new RuntimeException("Location not found"));

    Slot slot = slotRepo.findById(req.getSlotId())
            .orElseThrow(() -> new RuntimeException("Slot not found"));

    if (slot.getStatus() != SlotStatus.AVAILABLE) {
        throw new RuntimeException("Slot not available");
    }

    Integer requestedDuration = req.getDurationHours();
    if (requestedDuration == null || requestedDuration <= 0) {
        throw new RuntimeException("Invalid duration hours");
    }

    LocalDateTime start = req.getStartTime();
    LocalDateTime end = req.getEndTime();

    double amount = requestedDuration * location.getHourlyRate();

    /* ===== RESERVE SLOT ===== */
    slot.setStatus(SlotStatus.RESERVED);
    slotRepo.save(slot);

    /* ===== CREATE BOOKING ===== */
    Booking booking = new Booking();
    booking.setUserName(req.getUserName());
    booking.setVehicleNumber(req.getVehicleNumber());
    booking.setStartTime(start);
    booking.setEndTime(end);
    booking.setDurationHours(requestedDuration); 
    booking.setAmount(amount);
    booking.setStatus(BookingStatus.CONFIRMED);
    booking.setLocation(location);
    booking.setLocationName(location.getName());
    booking.setSlot(slot);
    booking.setSlotNumber(slot.getSlotNumber());

    bookingRepo.save(booking);
    /* ===== GENERATE QR CODE & PAYMENT ID ===== */
String qr = "PKSMT-" + booking.getId();
String paymentId = "PAY-" + System.currentTimeMillis();
booking.setQrCode(qr);
booking.setPaymentId(paymentId);
bookingRepo.save(booking);

    return mapToResponse(booking);
}

    /* =========================================================
       GET BOOKING BY ID (Needed for Booking Confirmation Page)
       ========================================================= */
    public BookingResponse getById(Long bookingId) {

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return mapToResponse(booking);
    }


    /* =========================================================
       MAP ENTITY → DTO
       ========================================================= */
    private BookingResponse mapToResponse(Booking booking) {

    BookingResponse res = new BookingResponse();

    res.setId(booking.getId());
    res.setUserName(booking.getUserName());
    res.setVehicleNumber(booking.getVehicleNumber());
    res.setSlotNumber(booking.getSlotNumber());
    res.setFloorNumber(String.valueOf(booking.getSlot().getFloorNumber()));
    res.setStartTime(booking.getStartTime());
    res.setEndTime(booking.getEndTime());
    res.setDurationHours(booking.getDurationHours());
    res.setAmount(booking.getAmount());
    res.setStatus(booking.getStatus().name());
    res.setQrCode(booking.getQrCode());
    res.setLocationName(booking.getLocationName());
    res.setBookingDate(booking.getStartTime());
    res.setPaymentId(booking.getPaymentId());
    res.setLatitude(
        booking.getLocation().getLatitude());

res.setLongitude(
        booking.getLocation().getLongitude());

res.setLocationName(
        booking.getLocation().getName());

    return res;
}
public List<BookingResponse> getAllBookingsForAdmin() {
    return bookingRepo.findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();
}

public BookingResponse getBookingById(Long id) {
    Booking booking = bookingRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    return mapToResponse(booking);
}
/* =========================================================
   AUTO-COMPLETE EXPIRED BOOKINGS
   Runs every minute
   ========================================================= */
@Scheduled(fixedRate = 60000)
@Transactional
public void updateExpiredBookings() {

    LocalDateTime now = LocalDateTime.now(
            ZoneId.of("Asia/Kolkata")
    );

    List<Booking> bookings = bookingRepo.findAll();

    for (Booking booking : bookings) {

        if (booking.getStatus() == BookingStatus.CONFIRMED
                && booking.getEndTime() != null
                && !booking.getEndTime().isAfter(now)) {

            booking.setStatus(BookingStatus.COMPLETED);

            // Free the parking slot
            Slot slot = booking.getSlot();

            if (slot != null) {
                slot.setStatus(SlotStatus.AVAILABLE);
                slotRepo.save(slot);
            }

            bookingRepo.save(booking);
        }
    }
}
/* =========================================================
   CANCEL BOOKING
   ========================================================= */
@Transactional
public BookingResponse cancelBooking(Long bookingId) {

    Booking booking = bookingRepo.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

    // Don't allow cancellation of already completed/cancelled bookings
    if (booking.getStatus() == BookingStatus.COMPLETED) {
        throw new RuntimeException("Completed booking cannot be cancelled");
    }

    if (booking.getStatus() == BookingStatus.CANCELLED) {
        throw new RuntimeException("Booking is already cancelled");
    }

    // Change booking status
    booking.setStatus(BookingStatus.CANCELLED);

    // Release the parking slot
    Slot slot = booking.getSlot();

    if (slot != null) {
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepo.save(slot);
    }

    bookingRepo.save(booking);

    return mapToResponse(booking);
}
}
