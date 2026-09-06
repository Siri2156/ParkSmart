package com.parksmart.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.parksmart.model.enums.BookingStatus;
import com.parksmart.model.enums.PaymentStatus;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userName;
    private String slotNumber;

    private String vehicleNumber;
    private String locationName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer durationHours;

    private String qrCode;

    private Double amount;

    private String paymentId;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    // RELATION WITH LOCATION
    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    // RELATION WITH SLOT
    @ManyToOne
    @JoinColumn(name = "slot_id")
    private Slot slot;

    // ========================
    // DEFAULT CONSTRUCTOR
    // ========================
    public Booking() {
    }

    // ========================
    // GETTERS & SETTERS
    // ========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public PaymentStatus getPaymentStatus() {
    return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
    this.paymentStatus = paymentStatus;
    }

    public Location getLocation() {
        return location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public Slot getSlot() {
        return slot;
    }

    public void setSlot(Slot slot) {
        this.slot = slot;
    }

    public Integer getDurationHours() {
    return durationHours;
}

public void setDurationHours(Integer durationHours) {
    this.durationHours = durationHours;
}

public String getQrCode() {
    return qrCode;
}

public void setQrCode(String qrCode) {
    this.qrCode = qrCode;
}

public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

}
