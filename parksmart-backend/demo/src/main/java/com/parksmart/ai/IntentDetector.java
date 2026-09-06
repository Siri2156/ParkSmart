package com.parksmart.ai;

import com.parksmart.model.enums.AssistantIntent;
import org.springframework.stereotype.Component;

@Component
public class IntentDetector {

    public AssistantIntent detect(String text) {

        String query = text.toLowerCase();

        // Greeting

        if(query.matches(".*\\b(hi|hello|hey)\\b.*")){

            return AssistantIntent.GREETING;

        }

        // Book nearest

        if(query.contains("book") &&
           (query.contains("nearest") ||
            query.contains("nearby"))){

            return AssistantIntent.BOOK_NEAREST;

        }

        // Book favourite

        if(query.contains("book my usual") ||
           query.contains("book my favourite") ||
           query.contains("book favorite")){

            return AssistantIntent.BOOK_USUAL;

        }

// Select slot
if (
        query.contains("select slot") ||
        query.contains("select a slot") ||
        query.contains("choose slot") ||
        query.contains("choose a slot") ||
        query.contains("pick slot") ||
        query.contains("reserve slot") ||
        query.contains("book slot") ||
        query.contains("book a slot") ||
        query.equals("slot") ||

        // NEW: Detect slot numbers like A1, B3, C12, etc.
        query.matches(".*\\b[a-zA-Z]\\d+\\b.*")
) {
    return AssistantIntent.SELECT_SLOT;
}
        // Select a parking location
if (
    query.contains("choose") ||
    query.contains("select") ||
    query.contains("open") ||
    query.contains("go to") ||
    (query.startsWith("book ") && !query.contains("slot"))
) {
    return AssistantIntent.SELECT_LOCATION;
}

        // Parking Search

        if(query.contains("parking") ||
           query.contains("park") ||
           query.contains("slot")){

            return AssistantIntent.SEARCH_PARKING;

        }

        // Navigation

        if(query.contains("navigate") ||
           query.contains("direction") ||
           query.contains("take me")){

            return AssistantIntent.NAVIGATE;

        }

        // Bookings

        if(query.contains("booking") ||
           query.contains("my bookings")){

            return AssistantIntent.SHOW_BOOKINGS;

        }

        // Cancel

        if(query.contains("cancel")){

            return AssistantIntent.CANCEL_BOOKING;

        }

        // Price

        if(query.contains("price") ||
           query.contains("cost") ||
           query.contains("rate")){

            return AssistantIntent.PARKING_PRICE;

        }

        // Help

        if(query.contains("help")){

            return AssistantIntent.HELP;

        }

        return AssistantIntent.GENERAL;
    }

}