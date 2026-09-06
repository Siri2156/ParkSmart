package com.parksmart.service;

import com.parksmart.dto.LocationRequest;
import com.parksmart.model.Location;
import com.parksmart.model.Slot;
import com.parksmart.model.enums.SlotStatus;
import com.parksmart.repository.LocationRepository;
import com.parksmart.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminLocationService {

    private final LocationRepository locationRepo;
    private final SlotRepository slotRepo;

    /* ================= CREATE LOCATION ================= */

    @Transactional
    public Location createLocation(LocationRequest req) {

        if (locationRepo.existsByNameAndAddress(req.getName(), req.getAddress())) {
            throw new RuntimeException("Location already exists");
        }

        Location location = new Location();
        location.setName(req.getName());
        location.setAddress(req.getAddress());
        location.setCity(req.getCity());
        location.setArea(req.getArea());
        location.setPincode(req.getPincode());
        location.setLatitude(req.getLatitude());
        location.setLongitude(req.getLongitude());
        location.setTotalSlots(req.getTotal_slots());
        location.setHourlyRate(req.getHourly_rate());
        location.setImageUrl(req.getImage_url());
        location.setFacilities(req.getFacilities());
        location.setActive(true);

        // 1️⃣ Save location
        Location savedLocation = locationRepo.save(location);

        // 2️⃣ Auto-create slots
        autoCreateSlots(savedLocation);

        return savedLocation;
    }

    /* ================= AUTO SLOT CREATION ================= */

    private void autoCreateSlots(Location location) {

        int totalSlots = location.getTotalSlots();

        // frontend does NOT know floors → backend decides
        int floors = 3; // ground + 2 floors
        int slotsPerFloor = location.getTotalSlots() / floors;

        char rowChar = 'A';

        for (int floor = 0; floor < floors; floor++) {

            for (int i = 1; i <= slotsPerFloor; i++) {
                Slot slot = new Slot();
                slot.setSlotNumber(rowChar + String.valueOf(i)); // A1, A2, B1
                slot.setFloorNumber(floor);
                slot.setStatus(SlotStatus.AVAILABLE);
                slot.setLocation(location);

                slotRepo.save(slot);
            }
            rowChar++;
        }
    }

    /* ================= DELETE LOCATION ================= */

    @Transactional
    public void deleteLocation(Long locationId) {
        slotRepo.deleteByLocationId(locationId);
        locationRepo.deleteById(locationId);
    }

    /* ================= GET ALL LOCATIONS ================= */

    public List<Location> getAllLocations() {
        return locationRepo.findAll();
    }

    /* ================= UPDATE LOCATION ================= */
    @Transactional
    public Location updateLocation(Long locationId, LocationRequest req) {
        Location location = locationRepo.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        if (req.getName() != null) location.setName(req.getName());
        if (req.getAddress() != null) location.setAddress(req.getAddress());
        if (req.getCity() != null) location.setCity(req.getCity());
        if (req.getArea() != null) location.setArea(req.getArea());
        if (req.getPincode() != null) location.setPincode(req.getPincode());
        if (req.getLatitude() != null) location.setLatitude(req.getLatitude());
        if (req.getLongitude() != null) location.setLongitude(req.getLongitude());
        if (req.getTotal_slots() != null) location.setTotalSlots(req.getTotal_slots());
        if (req.getHourly_rate() != null) location.setHourlyRate(req.getHourly_rate());
        if (req.getImage_url() != null) location.setImageUrl(req.getImage_url());
        if (req.getFacilities() != null) location.setFacilities(req.getFacilities());
        if (req.getIs_active() != null) location.setActive(req.getIs_active());

        // Note: adjusting slot records when totalSlots changes is intentionally
        // omitted here to avoid accidental data loss. If needed, implement slot
        // add/remove logic separately.

        return locationRepo.save(location);
    }
}
