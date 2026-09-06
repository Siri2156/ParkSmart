package com.parksmart.controller.user;

import com.parksmart.model.Location;
import com.parksmart.model.Slot;
import com.parksmart.repository.LocationRepository;
import com.parksmart.repository.SlotRepository;
import com.parksmart.model.enums.SlotStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/locations")
public class UserLocationController {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private SlotRepository slotRepository;

    @GetMapping
public List<Location> getActiveLocations() {
    return locationRepository.findByActiveTrue();
}

    @GetMapping("/{id}")
    public Location getLocationById(@PathVariable Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
    }
}
