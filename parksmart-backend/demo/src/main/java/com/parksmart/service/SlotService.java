package com.parksmart.service;

import com.parksmart.model.Location;
import com.parksmart.model.Slot;
import com.parksmart.model.enums.SlotStatus;
import com.parksmart.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;

    /* ================= GET SLOTS BY LOCATION ================= */

    public List<Slot> getByLocation(Long locationId) {
        return slotRepository.findByLocationId(locationId);
    }

    /* ================= UPDATE SLOT STATUS ================= */

    public void updateSlotStatus(Long slotId, SlotStatus status) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        slot.setStatus(status);
        slotRepository.save(slot);
    }

    /* ================= AVAILABLE SLOTS ================= */

    public List<Slot> getAvailableSlotsByLocation(Long locationId) {
        return slotRepository.findByLocationIdAndStatus(
                locationId,
                SlotStatus.AVAILABLE
        );
    }

    /* ================= CREATE SLOT (MANUAL) ================= */

    public Slot save(Slot slot) {
        if (slot.getStatus() == null) {
            slot.setStatus(SlotStatus.AVAILABLE);
        }
        return slotRepository.save(slot);
    }

    /* ================= AUTO CREATE SLOTS ================= */

    public void createSlotsForLocation(
            Location location,
            int floors,
            int slotsPerFloor
    ) {

        List<Slot> slots = new ArrayList<>();

        for (int floor = 0; floor < floors; floor++) {
            for (int i = 1; i <= slotsPerFloor; i++) {

                Slot slot = new Slot();
                slot.setLocation(location);
                slot.setFloorNumber(floor);
                slot.setSlotNumber((char) ('A' + floor) + String.valueOf(i));
                slot.setStatus(SlotStatus.AVAILABLE);

                slots.add(slot);
            }
        }

        slotRepository.saveAll(slots);
    }
}
