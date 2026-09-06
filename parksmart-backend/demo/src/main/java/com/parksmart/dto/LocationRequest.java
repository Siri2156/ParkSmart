package com.parksmart.dto;

import lombok.Data;

import java.util.List;

@Data
public class LocationRequest {

    private String name;
    private String address;
    private String city;
    private String area;
    private String pincode;

    private Double latitude;
    private Double longitude;

    // 👇 MUST MATCH frontend
    private Integer total_slots;
    private Double hourly_rate;
    private Integer total_floors;
    private Integer slots_per_floor;

    private List<String> facilities;
    private String image_url;
    private Boolean is_active;
}
