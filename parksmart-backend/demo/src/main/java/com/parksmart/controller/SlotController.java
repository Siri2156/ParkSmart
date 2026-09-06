package com.parksmart.controller;

import com.parksmart.model.Slot;
import com.parksmart.repository.SlotRepository;
import com.parksmart.service.SlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;
    private final SlotRepository slotRepository;

    /* ================= GET ALL SLOTS ================= */
    @GetMapping("/slots")
    public ResponseEntity<List<Slot>> getAllSlots() {
        return ResponseEntity.ok(slotRepository.findAll());
    }

    /* ================= GET SLOTS BY LOCATION ================= */

    // 🔥 THIS is what LocationDetails.jsx calls
    @GetMapping("/locations/{locationId}/slots")
    public ResponseEntity<List<Slot>> getSlotsByLocation(
            @PathVariable Long locationId
    ) {
        return ResponseEntity.ok(
                slotService.getByLocation(locationId)
        );
    }

    /* ================= GET AVAILABLE SLOTS ================= */

    @GetMapping("/locations/{locationId}/available")
    public ResponseEntity<List<Slot>> getAvailableSlots(
            @PathVariable Long locationId
    ) {
        return ResponseEntity.ok(
                slotService.getAvailableSlotsByLocation(locationId)
        );
    }

    /* ================= UPDATE SLOT STATUS ================= */

    @PatchMapping("/slots/{slotId}/status")
    public ResponseEntity<Void> updateSlotStatus(
            @PathVariable Long slotId,
            @RequestParam("status") String status
    ) {
        slotService.updateSlotStatus(
                slotId,
                Enum.valueOf(
                        com.parksmart.model.enums.SlotStatus.class,
                        status
                )
        );
        return ResponseEntity.ok().build();
    }
}
