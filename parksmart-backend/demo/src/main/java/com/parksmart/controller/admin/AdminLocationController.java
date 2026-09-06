package com.parksmart.controller.admin;

import com.parksmart.dto.LocationRequest;
import com.parksmart.model.Location;
import com.parksmart.service.AdminLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/locations")
@RequiredArgsConstructor
public class AdminLocationController {

    private final AdminLocationService adminLocationService;

        /* ================= GET ALL LOCATIONS ================= */
    @GetMapping
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(adminLocationService.getAllLocations());
    }

    /* ================= CREATE LOCATION ================= */
    @PostMapping
public ResponseEntity<Location> createLocation(
        @RequestBody LocationRequest req
) {
    Location location = adminLocationService.createLocation(req);
    return ResponseEntity.ok(location);
}
@DeleteMapping("/{locationId}")
public ResponseEntity<Void> deleteLocation(@PathVariable Long locationId) {
    adminLocationService.deleteLocation(locationId);
    return ResponseEntity.noContent().build();
}

    /* ================= UPDATE LOCATION ================= */
    @PutMapping("/{locationId}")
    public ResponseEntity<Location> updateLocation(
            @PathVariable Long locationId,
            @RequestBody LocationRequest req
    ) {
        Location updated = adminLocationService.updateLocation(locationId, req);
        return ResponseEntity.ok(updated);
    }

}
