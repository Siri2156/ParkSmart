package com.parksmart.controller;

import com.parksmart.dto.AssistantResponse;
import com.parksmart.dto.AssistantRequest;
import com.parksmart.service.AssistantService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assistant")
public class AiController {

    private final AssistantService assistantService;

    public AiController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

@PostMapping("/ask")
public AssistantResponse askAssistant(
    @RequestBody AssistantRequest request
) {
    String message = request.getMessage();
    System.out.println("USER : " + message);

    AssistantResponse response =
            assistantService.processMessage(
                    request.getMessage(),
                    request.getLatitude(),
                    request.getLongitude()
            );

    System.out.println("AI : " + response.getMessage());

    return response;
}

}