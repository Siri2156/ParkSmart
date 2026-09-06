package com.parksmart.session;

public class AssistantSession {

    private Long selectedLocationId;

    private Long selectedSlotId;

    private ConversationStep conversationStep =
            ConversationStep.IDLE;

    public Long getSelectedLocationId() {
        return selectedLocationId;
    }

    public void setSelectedLocationId(Long selectedLocationId) {
        this.selectedLocationId = selectedLocationId;
    }

    public Long getSelectedSlotId() {
        return selectedSlotId;
    }

    public void setSelectedSlotId(Long selectedSlotId) {
        this.selectedSlotId = selectedSlotId;
    }

    public ConversationStep getConversationStep() {
        return conversationStep;
    }

    public void setConversationStep(
            ConversationStep conversationStep) {
        this.conversationStep = conversationStep;
    }

    public void reset() {
        selectedLocationId = null;
        selectedSlotId = null;
        conversationStep = ConversationStep.IDLE;
    }
}