package com.parksmart.repository;

import com.parksmart.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByActiveTrue();
    boolean existsByNameAndAddress(String name, String address);
}
