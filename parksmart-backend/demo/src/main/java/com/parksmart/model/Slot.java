package com.parksmart.model;

import com.parksmart.model.enums.SlotStatus;
import com.parksmart.model.enums.SlotType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonGetter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "slots")
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String slotNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotStatus status = SlotStatus.AVAILABLE;
    
    private Integer floorNumber;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "slot_type")
    private SlotType slotType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    @JsonIgnore
    private Location location;

    // explicitly map the raw FK so we can always serialize locationId without a null in output
    @Column(name = "location_id", insertable = false, updatable = false)
    private Long locationId;

    @JsonGetter("locationId")
    public Long getLocationId() {
        if (this.locationId != null) {
            return this.locationId;
        }
        if (this.location != null && this.location.getId() != null) {
            return this.location.getId();
        }
        // avoid null output; use 0L as fallback identifier when location data is not available
        return 0L;
    }

}
