package com.parksmart.service;

import com.parksmart.dto.AssistantResponse;
import com.parksmart.model.Location;
import com.parksmart.model.Slot;
import com.parksmart.model.enums.AssistantAction;
import com.parksmart.model.enums.AssistantIntent;
import com.parksmart.model.enums.SlotStatus;
import com.parksmart.repository.BookingRepository;
import com.parksmart.ai.IntentDetector;
import com.parksmart.repository.LocationRepository;
import com.parksmart.repository.SlotRepository;
import org.springframework.stereotype.Service;
import com.parksmart.session.AssistantSession;
import com.parksmart.session.ConversationStep;

import java.util.Comparator;
import java.util.List;

@Service
public class AssistantService {

    private final IntentDetector intentDetector;

    private final GeminiService geminiService;

    private final LocationRepository locationRepository;

    private final SlotRepository slotRepository;

    private final BookingRepository bookingRepository;
    private final AssistantSession session =
        new AssistantSession();
    

    public AssistantService(
            IntentDetector intentDetector,
            GeminiService geminiService,
            LocationRepository locationRepository,
            SlotRepository slotRepository,
            BookingRepository bookingRepository
    ) {

        this.intentDetector = intentDetector;
        this.geminiService = geminiService;
        this.locationRepository = locationRepository;
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;

    }

private double calculateDistance(

        double lat1,
        double lon1,

        double lat2,
        double lon2

){

    double R = 6371;

    double dLat = Math.toRadians(lat2-lat1);

    double dLon = Math.toRadians(lon2-lon1);

    double a =
            Math.sin(dLat/2)*Math.sin(dLat/2)+
            Math.cos(Math.toRadians(lat1))*
            Math.cos(Math.toRadians(lat2))*
            Math.sin(dLon/2)*
            Math.sin(dLon/2);

    double c =
            2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));

    return R* c;

}

public AssistantResponse processMessage(String message,
    Double latitude,
    Double longitude
){
        String text = message.toLowerCase().trim();

    if (session.getConversationStep() ==
        ConversationStep.WAITING_LOCATION) {

    if (
            text.equals("yes") ||
            text.equals("confirm") ||
            text.equals("book it") ||
            text.equals("open it") ||
            text.equals("okay")
    ) {

        AssistantResponse response = new AssistantResponse();

        response.setAction(
                AssistantAction.OPEN_LOCATION.name());

        response.setLocationId(
        session.getSelectedLocationId());

        response.setMessage("Opening parking location.");

        // IMPORTANT
        session.setConversationStep(ConversationStep.WAITING_SLOT);

        return response;
    }

    if (
            text.equals("no") ||
            text.equals("cancel")
    ) {

        session.reset();

        AssistantResponse response = new AssistantResponse();

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage("Okay, cancelled.");

        return response;
    }
}
if (session.getConversationStep() ==
        ConversationStep.WAITING_BOOKING_CONFIRMATION) {

    if (text.equals("yes") ||
        text.equals("confirm") ||
        text.equals("book") ||
        text.equals("proceed")) {

        AssistantResponse response = new AssistantResponse();

        response.setAction(
    AssistantAction.OPEN_BOOKING_FORM.name()
);

        response.setLocationId(
                session.getSelectedLocationId());

        response.setSlotId(
                session.getSelectedSlotId());

        response.setMessage(
        "Proceeding to booking. Please say 'Pay and Confirm'.");

session.setConversationStep(
        ConversationStep.WAITING_PAYMENT);

return response;
    }

    if (text.equals("no") ||
        text.equals("cancel")) {

        AssistantResponse response =
                new AssistantResponse();

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "Booking cancelled.");

        session.reset();

        return response;
    }
}

    if (session.getConversationStep() == ConversationStep.WAITING_PAYMENT) {

    if (

        text.contains("pay") ||

        text.contains("confirm payment") ||

        text.contains("pay and confirm")

    ) {

        AssistantResponse response =
                new AssistantResponse();

        response.setAction(
                AssistantAction.PAY.name());

        response.setMessage(
                "Processing payment.");
                
        session.setConversationStep(
                ConversationStep.WAITING_NAVIGATION);
        return response;

    }

}
if (session.getConversationStep() ==
        ConversationStep.WAITING_NAVIGATION) {

    if (text.equals("yes")
            || text.contains("navigate")
            || text.contains("start navigation")) {

        return navigate();
    }

    if (text.equals("no")
            || text.contains("cancel")) {

        AssistantResponse response =
                new AssistantResponse();

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "Okay. Navigation cancelled.");

        session.reset();

        return response;
    }
}

    AssistantIntent intent =
            intentDetector.detect(message);

    switch(intent){

        case GREETING:
            return greeting();

        case SEARCH_PARKING:
            return searchParking(message,latitude,longitude);

        case BOOK_NEAREST:
            return bookNearest(latitude, longitude);

        case BOOK_USUAL:
            return bookFavourite(message);

        case SHOW_BOOKINGS:
            return showBookings();

        case NAVIGATE:
            return navigate();

        case PARKING_PRICE:
            return parkingPrice();
        
        case SELECT_LOCATION:
            return selectLocation(message);

        case SELECT_SLOT:
            return selectSlot(message);

        default:
            return askGemini(message);

    }

}

private AssistantResponse greeting(){

    AssistantResponse response =
            new AssistantResponse();

    response.setAction(
            AssistantAction.GENERAL.name());

    response.setMessage(
            "Hello! I'm Jarvis. How can I help you today?"
    );

    return response;

}

private AssistantResponse askGemini(String message){

    AssistantResponse response =
            new AssistantResponse();

    List<Location> locations =
            locationRepository.findByActiveTrue();

    response.setMessage(

            geminiService.askGemini(
                    message,
                    locations
            )

    );

    response.setAction(
            AssistantAction.GENERAL.name());

    return response;

}

private int availableSlots(Long locationId){

    List<Slot> slots =
            slotRepository.findByLocationId(locationId);

    int available = 0;

    for(Slot slot : slots){

        if(slot.getStatus()== SlotStatus.AVAILABLE){

            available++;

        }

    }

    return available;

}


private AssistantResponse searchParking(String message, Double latitude, Double longitude){

    AssistantResponse response =
            new AssistantResponse();

    List<Location> locations =
            locationRepository.findByActiveTrue();

    if (latitude == null || longitude == null) {

    response.setAction(
            AssistantAction.GENERAL.name());

    response.setMessage(
            "Unable to determine your location. Please enable location services."
    );

    return response;
}

    if(locations.isEmpty()){

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "No parking locations found."
        );

        return response;

    }

    Location nearest = null;

double shortest = Double.MAX_VALUE;

for(Location location : locations){

    if(location.getLatitude()==null ||
       location.getLongitude()==null){

        continue;

    }

    double distance =
            calculateDistance(

                    latitude,

                    longitude,

                    location.getLatitude(),

                    location.getLongitude()

            );

    if(distance < shortest){

        shortest = distance;

        nearest = location;

    }

}

    if(nearest==null){

        response.setMessage(
                "No parking available.");

        return response;

    }

    int free =
            availableSlots(nearest.getId());

session.setSelectedLocationId(nearest.getId());

session.setConversationStep(
        ConversationStep.WAITING_LOCATION);

response.setWaitingConfirmation(true);

response.setAction(
        AssistantAction.SEARCH_PARKING.name());

    response.setLocationId(
            nearest.getId());

    response.setLocationName(
            nearest.getName());

    response.setLatitude(
            nearest.getLatitude());

    response.setLongitude(
            nearest.getLongitude());

    response.setAvailableSlots(
            free);

    response.setMessage(
        "I found the nearest parking at "
        + nearest.getName()
        + ". It has "
        + free
        + " available slots. Would you like me to open this parking?"
);
    return response;
}

private AssistantResponse bookNearest(Double latitude,
                                      Double longitude) {

    AssistantResponse response = new AssistantResponse();

    if (latitude == null || longitude == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "Unable to determine your location.");

        return response;
    }

    List<Location> locations =
            locationRepository.findByActiveTrue();

    Location nearest = null;

    double shortest = Double.MAX_VALUE;

    for (Location location : locations) {

        if (location.getLatitude() == null ||
            location.getLongitude() == null) {

            continue;
        }

        int available =
                availableSlots(location.getId());

        if (available == 0) {

            continue;
        }

        double distance =
                calculateDistance(
                        latitude,
                        longitude,
                        location.getLatitude(),
                        location.getLongitude());

        if (distance < shortest) {

            shortest = distance;

            nearest = location;
        }
    }

    if (nearest == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "No nearby parking with available slots.");

        return response;
    }

    Slot slot =
            slotRepository
                    .findByLocationId(nearest.getId())
                    .stream()
                    .filter(s ->
                            s.getStatus() ==
                                    SlotStatus.AVAILABLE)
                    .findFirst()
                    .orElse(null);

    if (slot == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "No available slot found.");

        return response;
    }

    response.setAction(
            AssistantAction.BOOK_USUAL.name());

    response.setLocationId(
            nearest.getId());

    response.setLocationName(
            nearest.getName());

    response.setLatitude(
            nearest.getLatitude());

    response.setLongitude(
            nearest.getLongitude());

    response.setSlotId(
            slot.getId());

    response.setAvailableSlots(
            availableSlots(nearest.getId()));

    response.setMessage(
            "I found the nearest parking at "
                    + nearest.getName()
                    + ". Opening parking page.");

    return response;
}

private AssistantResponse bookFavourite(String message) {

    AssistantResponse response = new AssistantResponse();

    List<Location> locations =
            locationRepository.findByActiveTrue();

    if (locations.isEmpty()) {

        response.setMessage("No parking locations found.");

        response.setAction(
                AssistantAction.GENERAL.name());

        return response;
    }

    Location favourite = locations.get(0);
    session.setSelectedLocationId(favourite.getId());

session.setConversationStep(
        ConversationStep.WAITING_SLOT);

response.setAction(
        AssistantAction.OPEN_LOCATION.name());

response.setLocationId(favourite.getId());

response.setLocationName(favourite.getName());

response.setLatitude(favourite.getLatitude());

response.setLongitude(favourite.getLongitude());

response.setAvailableSlots(
        availableSlots(favourite.getId()));

response.setMessage(
        "Opening "
        + favourite.getName()
        + ". Please select a parking slot.");

return response;
}

private AssistantResponse showBookings() {

    AssistantResponse response =
            new AssistantResponse();

    response.setAction(
            AssistantAction.SHOW_BOOKINGS.name());

    response.setMessage(
            "Opening your booking history.");

    return response;
}

private AssistantResponse navigate() {

    AssistantResponse response = new AssistantResponse();

    Long locationId = session.getSelectedLocationId();

    if (locationId == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "No parking location selected.");

        return response;
    }

    Location location =
            locationRepository.findById(locationId)
                    .orElse(null);

    if (location == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "Location not found.");

        return response;
    }

    response.setAction(
            AssistantAction.NAVIGATE.name());

    response.setLatitude(location.getLatitude());

    response.setLongitude(location.getLongitude());

    response.setLocationName(location.getName());

    response.setMessage(
            "Starting navigation.");

    return response;
}

private AssistantResponse parkingPrice() {

    AssistantResponse response =
            new AssistantResponse();

    List<Location> locations =
            locationRepository.findByActiveTrue();

    if (locations.isEmpty()) {

        response.setMessage(
                "No parking locations available.");

        response.setAction(
                AssistantAction.GENERAL.name());

        return response;
    }

    Location location = locations.get(0);

    response.setAction(
            AssistantAction.GENERAL.name());

    response.setMessage(
            "Parking costs ₹"
                    + location.getHourlyRate()
                    + " per hour.");

    return response;
}

private AssistantResponse selectLocation(String message) {

    AssistantResponse response = new AssistantResponse();

    List<Location> locations =
            locationRepository.findByActiveTrue();

    String query = message.toLowerCase()
        .replace("select", "")
        .replace("open", "")
        .replace("location", "")
        .replace("parking", "")
        .trim();

for (Location location : locations) {

    String locationName = location.getName()
            .toLowerCase()
            .replace("parking", "")
            .trim();

    if (query.contains(locationName) ||
        locationName.contains(query)) {

        session.setSelectedLocationId(location.getId());
        session.setConversationStep(ConversationStep.WAITING_SLOT);

        response.setAction(AssistantAction.OPEN_LOCATION.name());
        response.setLocationId(location.getId());
        response.setLocationName(location.getName());
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());

        response.setMessage("Opening " + location.getName());

        return response;
    }
}

    response.setAction(
            AssistantAction.GENERAL.name());

    response.setMessage(
            "I couldn't find that parking location.");

    return response;
}

private AssistantResponse selectSlot(String message) {
        System.out.println("Pending Location = " + session.getSelectedLocationId());
        AssistantResponse response = new AssistantResponse();
        if (session.getSelectedLocationId() == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "Please select a parking location first.");

        return response;
    }

List<Slot> slotList =
        slotRepository.findByLocationId(session.getSelectedLocationId());

System.out.println("Slots Found = " + slotList.size());

for (Slot s : slotList) {
    System.out.println(
            s.getSlotNumber() + " -> " + s.getStatus());
}
    String query = message.toLowerCase();
    String requestedSlot = null;

for (String word : query.split(" ")) {

    if (word.matches("[a-zA-Z]\\d+")) {

        requestedSlot = word.toUpperCase();

        break;
    }
}

Slot slot = null;

// If the user requested a specific slot (e.g. A4)
if (requestedSlot != null) {
        final String slotNumber = requestedSlot;

    slot = slotList.stream()
            .filter(s ->
                    s.getSlotNumber().equalsIgnoreCase(slotNumber))
            .findFirst()
            .orElse(null);

    if (slot == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "I couldn't find slot " + requestedSlot + ".");

        return response;
    }

    if (slot.getStatus() != SlotStatus.AVAILABLE) {

    Slot alternative = slotList.stream()
            .filter(s -> s.getStatus() == SlotStatus.AVAILABLE)
            .findFirst()
            .orElse(null);

    if (alternative == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "No available slots found.");

        return response;
    }

    slot = alternative;
}

} else {

    // User just said "Select a slot"
    slot = slotList.stream()
            .filter(s ->
                    s.getStatus() == SlotStatus.AVAILABLE)
            .findFirst()
            .orElse(null);
}

    if (slot == null) {

        response.setAction(
                AssistantAction.GENERAL.name());

        response.setMessage(
                "No available slot found.");

        return response;
    }
    response.setAction(
            AssistantAction.BOOK_SLOT.name());

    response.setLocationId(session.getSelectedLocationId());
    session.setSelectedSlotId(slot.getId());

    response.setSlotId(slot.getId());

    response.setSlotNumber(slot.getSlotNumber());
    session.setConversationStep(
        ConversationStep.WAITING_BOOKING_CONFIRMATION);

    response.setMessage(
            "I selected slot "
                    + slot.getSlotNumber()
                    + ". Would you like to proceed with the booking?");

    return response;
}
}