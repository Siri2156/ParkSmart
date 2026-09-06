package com.parksmart.service;

import com.parksmart.model.Booking;
import com.parksmart.model.Slot;
import com.parksmart.model.enums.BookingStatus;
import com.parksmart.model.enums.SlotStatus;
import com.parksmart.repository.BookingRepository;
import com.parksmart.repository.SlotRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private final BookingRepository bookingRepo;
    private final SlotRepository slotRepo;

    /* =========================================================
       AUTO ACTIVATE BOOKING
       CONFIRMED → ACTIVE when startTime begins
       ========================================================= */
    @Scheduled(fixedRate = 60000) // Runs every 1 minute
    public void activateBookings() {

        LocalDateTime now = LocalDateTime.now();

        List<Booking> bookings =
                bookingRepo.findByStatusAndStartTimeBefore(
                        BookingStatus.CONFIRMED,
                        now
                );

        for (Booking booking : bookings) {

            booking.setStatus(BookingStatus.ACTIVE);

            bookingRepo.save(booking);
        }
    }


    /* =========================================================
       AUTO COMPLETE BOOKING
       ACTIVE → COMPLETED when endTime is over
       ========================================================= */
    @Scheduled(fixedRate = 60000) // Runs every 1 minute
    public void completeBookings() {

        LocalDateTime now = LocalDateTime.now();

        List<Booking> bookings =
                bookingRepo.findByStatusAndEndTimeBefore(
                        BookingStatus.ACTIVE,
                        now
                );

        for (Booking booking : bookings) {

            booking.setStatus(BookingStatus.COMPLETED);

            Slot slot = booking.getSlot();
            slot.setStatus(SlotStatus.AVAILABLE);

            slotRepo.save(slot);
            bookingRepo.save(booking);
        }
    }
}