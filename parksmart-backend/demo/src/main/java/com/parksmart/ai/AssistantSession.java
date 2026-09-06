package com.parksmart.ai;

public class AssistantSession {

    private Long locationId;

    private Long slotId;

    private boolean waitingForLocation;

    private boolean waitingForSlot;

    private boolean waitingForBookingConfirmation;

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public boolean isWaitingForLocation() {
        return waitingForLocation;
    }

    public void setWaitingForLocation(boolean waitingForLocation) {
        this.waitingForLocation = waitingForLocation;
    }

    public boolean isWaitingForSlot() {
        return waitingForSlot;
    }

    public void setWaitingForSlot(boolean waitingForSlot) {
        this.waitingForSlot = waitingForSlot;
    }

    public boolean isWaitingForBookingConfirmation() {
        return waitingForBookingConfirmation;
    }

    public void setWaitingForBookingConfirmation(boolean waitingForBookingConfirmation) {
        this.waitingForBookingConfirmation = waitingForBookingConfirmation;
    }
}