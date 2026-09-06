package com.parksmart.repository;

import com.parksmart.model.Booking;
import com.parksmart.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserName(String userName);
    List<Booking> findByStatusAndStartTimeBefore(
            BookingStatus status,
            LocalDateTime time
    );

    List<Booking> findByStatusAndEndTimeBefore(
            BookingStatus status,
            LocalDateTime time
    );
}
