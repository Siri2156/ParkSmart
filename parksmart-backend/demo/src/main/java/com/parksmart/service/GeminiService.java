package com.parksmart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.parksmart.model.Location;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper mapper = new ObjectMapper();

    public String askGemini(String userMessage, List<Location> locations) {

        try {

            StringBuilder parkingData = new StringBuilder();

            parkingData.append("""
These are the ONLY parking locations available in ParkSmart.
Never invent locations.

""");

            for (Location loc : locations) {

                parkingData.append("""
Location:
Name: %s
Area: %s
City: %s
Address: %s
Latitude: %s
Longitude: %s
Hourly Rate: %.2f

""".formatted(
                        loc.getName(),
                        loc.getArea(),
                        loc.getCity(),
                        loc.getAddress(),
                        loc.getLatitude(),
                        loc.getLongitude(),
                        loc.getHourlyRate()
                ));
            }

            String prompt = """
You are Jarvis, the AI Parking Assistant for ParkSmart.

Rules:

1. NEVER invent parking locations.

2. ONLY recommend locations from the list below.

3. If the user asks for nearby parking,
choose the closest location from the supplied list.

4. If no parking matches,
say:
"No parking location is available."

5. Keep replies short.

6. Never mention locations that are not in the supplied list.

-------------------------
AVAILABLE LOCATIONS
-------------------------

%s

-------------------------
USER QUESTION
-------------------------

%s
""".formatted(parkingData, userMessage);

            String endpoint =
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                            + apiKey;

            URL url = new URL(endpoint);

            HttpURLConnection conn =
                    (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");
            conn.setRequestProperty(
                    "Content-Type",
                    "application/json"
            );

            conn.setDoOutput(true);

            String requestBody = """
{
  "contents":[
    {
      "parts":[
        {
          "text":"%s"
        }
      ]
    }
  ]
}
""".formatted(
                    prompt
                            .replace("\\", "\\\\")
                            .replace("\"", "\\\"")
                            .replace("\n", "\\n")
            );

            OutputStream os = conn.getOutputStream();
            os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            os.flush();
            os.close();

            InputStream is;

            if (conn.getResponseCode() >= 200 &&
                    conn.getResponseCode() < 300) {

                is = conn.getInputStream();

            } else {

                is = conn.getErrorStream();
            }

            String response =
                    new String(is.readAllBytes(), StandardCharsets.UTF_8);

            JsonNode root = mapper.readTree(response);

            return root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {

            e.printStackTrace();

            return "Sorry, I couldn't process your request.";
        }

    }

}