package com.parksmart.repository;

import com.parksmart.model.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import com.parksmart.model.enums.SlotStatus;

import java.util.List;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByLocationIdAndStatus(Long locationId, SlotStatus status);
    List<Slot> findByLocationId(Long locationId);
    List<Slot> deleteByLocationId(Long locationId);
}
