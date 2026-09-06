import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "@/api/apiConfig";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function VoiceAssistant({ user, bookings, locations, slots }) {
  const navigate = useNavigate();
  const [isAwake, setIsAwake] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [memory, setMemory] = useState({
    frequentLocation: null,
    lastAction: null,
    lastSearch: null,
  });
  const lastCommandRef = useRef("");
const lastCommandTimeRef = useRef(0);
const userLocationRef = useRef(null);
const isSpeakingRef = useRef(false);
const restartTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const shouldListenRef = useRef(false);
  const [assistantActive, setAssistantActive] = useState(false);
  const bookingRef = useRef(null);
const waitingForNavigationRef = useRef(false);
const bookingFormOpenRef = useRef(false);

  const { data: dbLocations = [] } = useQuery({
    queryKey: ["parkingLocations"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/locations`, {
        credentials: "include",
      });
      return res.ok ? res.json() : [];
    },
    initialData: [],
  });

  const appLocations = dbLocations.length ? dbLocations : locations;

  /* ------------------- SPEECH RECOGNITION ------------------- */
useEffect(() => {
  if (!("webkitSpeechRecognition" in window)) return;

  const recognition = new window.webkitSpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    try {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];

        if (!res[0]) continue;

        const text = res[0].transcript?.trim();

        if (!text) continue;

        // Ignore low confidence
        if (res[0].confidence && res[0].confidence < 0.65) {
          continue;
        }

        if (res.isFinal) {
          const now = Date.now();

          // Prevent duplicate execution
          if (
            lastCommandRef.current === text &&
            now - lastCommandTimeRef.current < 2000
          ) {
            return;
          }

          lastCommandRef.current = text;
          lastCommandTimeRef.current = now;

          setMessages((prev) => {
            const finalMsg = {
              role: "USER",
              content: text,
              live: false,
            };

            const last = prev[prev.length - 1];

            if (last?.live) {
              return [...prev.slice(0, -1), finalMsg];
            }

            return [...prev, finalMsg];
          });

          handleVoice(text.toLowerCase());
        } else {
          interimTranscript += text + " ";
        }
      }

      const transcript = interimTranscript.trim();

      if (transcript) {
        setMessages((prev) => {
          const liveMessage = {
            role: "USER",
            content: transcript,
            live: true,
          };

          const last = prev[prev.length - 1];

          if (last?.live) {
            return [...prev.slice(0, -1), liveMessage];
          }

          return [...prev, liveMessage];
        });
      }
    } catch (e) {
      console.error("Speech recognition error:", e);
    }
  };

  recognition.onend = () => {
    setIsListening(false);
    isListeningRef.current = false;

    if (
      shouldListenRef.current &&
      !isSpeakingRef.current
    ) {
      restartTimeoutRef.current = setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          isListeningRef.current = true;
        } catch (e) {
          console.warn("Recognition restart failed:", e);
        }
      }, 600);
    }
  };

recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);

    setIsListening(false);
    isListeningRef.current = false;

    // Let onend restart recognition.
};

  recognitionRef.current = recognition;

  return () => {
    shouldListenRef.current = false;

    clearTimeout(restartTimeoutRef.current);

    try {
      recognition.stop();
    } catch (e) {
      console.warn(e);
    }
  };
}, []);

const startListening = () => {
  if (
    !recognitionRef.current ||
    isListeningRef.current ||
    isSpeakingRef.current
  ) {
    return;
  }

  try {
    shouldListenRef.current = true;

    recognitionRef.current.start();

    setIsListening(true);

    isListeningRef.current = true;
  } catch (err) {
    console.warn(err);
  }
};

const stopListening = () => {
  shouldListenRef.current = false;

  if (!recognitionRef.current) return;

  try {
    recognitionRef.current.stop();
  } catch (err) {
    console.warn(err);
  }

  setIsListening(false);

  isListeningRef.current = false;
};

  /* ================================
     LOCATION UTILS
  ================================= */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

const findNearbyLocations = async () => {
  try {
    // Prefer location exposed by RealTimeMap (window.__USER_LOCATION)
    let userLat = null;
    let userLng = null;

    if (window.__USER_LOCATION && Array.isArray(window.__USER_LOCATION)) {
      [userLat, userLng] = window.__USER_LOCATION;
      userLocationRef.current = { coords: { latitude: userLat, longitude: userLng } };
    } else if (userLocationRef.current) {
      // userLocationRef may hold a Position or an array
      const cur = userLocationRef.current;
      if (Array.isArray(cur)) {
        [userLat, userLng] = cur;
      } else if (cur.coords) {
        userLat = cur.coords.latitude;
        userLng = cur.coords.longitude;
      }
    } else if (navigator.geolocation) {
      // fallback to browser geolocation (best-effort)
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          resolve,
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        )
      );

      if (pos && pos.coords) {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        userLocationRef.current = pos;
        try { window.__USER_LOCATION = [userLat, userLng]; } catch (e) {}
      }
    }

    if (userLat == null || userLng == null) {
      // no location available — return empty silently (don't ask user)
      console.debug('No user location available for nearby search');
      return [];
    }

    const validLocations = appLocations.filter(
      (loc) =>
        loc.latitude &&
        loc.longitude
    );

    let nearby = validLocations
      .map((loc) => ({
        ...loc,
        distance: getDistance(
          userLat,
          userLng,
          loc.latitude,
          loc.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    // Dynamic radius search
    let radius = 1;

    while (radius <= 10) {
      const results = nearby.filter((loc) => loc.distance <= radius);

      if (results.length) {
        return results.slice(0, 5);
      }

      radius += 2;
    }

    return [];
  } catch (err) {
    console.error(err);

    // Don't prompt the user for location here — fail silently
    return [];
  }
};

  /* ================================
     VOICE COMMAND ENGINE
  ================================= */
  const handleVoice = (text) => {
        // ===========================
    // Waiting for navigation?
    // ===========================

    if (waitingForNavigationRef.current) {

        if (
            text.includes("yes") ||
            text.includes("navigate") ||
            text.includes("start navigation")
        ) {

            const booking = bookingRef.current;

            waitingForNavigationRef.current = false;

            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}&travelmode=driving`,
                "_blank"
            );

            speak("Starting navigation.");

            return;
        }

        if (
            text.includes("no") ||
            text.includes("cancel")
        ) {

            waitingForNavigationRef.current = false;

            speak("Okay. Navigation cancelled.");

            return;
        }
    }
    if (
    bookingFormOpenRef.current &&
    (
        text.includes("pay") ||
        text.includes("confirm")
    )
) {

    window.dispatchEvent(
        new Event("voice-pay-confirm")
    );

    speak("Processing your payment.");

    return;
}
    sendMessageToBackend(text);
  };

  const navigateToBooking = (booking) => {
    if (!booking || !appLocations) return;
    const location = appLocations.find((loc) => loc.id === booking.locationId);
    if (!location) { speak("Location not found"); return; }
    speak(`Starting navigation to ${location.name}`);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
    window.open(url, "_blank");
    };

  /* ================================
     EFFECTS
  ================================= */
  useEffect(() => {
    if (!isOpen) return;
    findNearbyLocations().then((nearby) => {
      if (!nearby.length) return;
      setMessages((prev) => [...prev, { type: "nearby", locations: nearby }]);
      speak(`📍 Found ${nearby.length} parking spots near you`);
    });
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const welcomeMessage = `Welcome back ${user?.name || ""}. I'm Jarvis, your AI parking assistant. Nearby parking detection is active.`;
      speak(welcomeMessage);
      setMessages([{ role: "assistant", content: welcomeMessage }]);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!bookings || bookings.length === 0) return;
    const counts = {};
    bookings.forEach((b) => {
      counts[b.locationName] = (counts[b.locationName] || 0) + 1;
    });
    const frequent = Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
    setMemory((prev) => ({ ...prev, frequentLocation: frequent }));
  }, [bookings]);

  useEffect(() => {

  if (assistantActive) {
    startListening();
  } else {
    stopListening();
  }

}, [assistantActive]);

useEffect(() => {

    const handleBookingConfirmed = (event) => {

        const booking = event.detail;

        bookingRef.current = booking;

        waitingForNavigationRef.current = true;

        const message =
            `Your booking at ${booking.locationName} has been confirmed. Would you like me to start navigation?`;

        setMessages(prev => [
            ...prev,
            {
                role: "assistant",
                content: message
            }
        ]);

        speak(message);

    };

    window.addEventListener(
        "booking-confirmed",
        handleBookingConfirmed
    );

    return () =>
        window.removeEventListener(
            "booking-confirmed",
            handleBookingConfirmed
        );

}, []);
useEffect(() => {

    const open = () => {
        bookingFormOpenRef.current = true;
    };

    const close = () => {
        bookingFormOpenRef.current = false;
    };

    window.addEventListener("booking-form-open", open);
    window.addEventListener("booking-form-close", close);

    return () => {
        window.removeEventListener("booking-form-open", open);
        window.removeEventListener("booking-form-close", close);
    };

}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && bookings && locations) checkForProactiveSuggestions();
  }, [isOpen, bookings, locations]);

  const checkForProactiveSuggestions = () => {
    if (!memory.frequentLocation) return;
    if (Math.random() > 0.6) {
      const msg = `💡 You frequently use ${memory.frequentLocation}. Would you like me to open it for booking?`;
      setMessages((prev) => [...prev, { type: "suggestion", content: msg }]);
      speak(msg);
    }
  };

  /* ------------------- TEXT TO SPEECH ------------------- */
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const getVoice = () => {
  const voices = speechSynthesis.getVoices();

  return (
    voices.find(v =>
      v.name.includes("Google UK English Male")
    ) || voices[0]
  );
};
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getVoice();
    utterance.rate = 0.9;
    utterance.pitch = 0.85;
    utterance.onstart = () => {

  setIsSpeaking(true);

  isSpeakingRef.current = true;

  stopListening();
};

utterance.onend = () => {

  setIsSpeaking(false);

  isSpeakingRef.current = false;

  if (assistantActive) {
    startListening();
  }
};
    window.speechSynthesis.speak(utterance);
  };

  /* ------------------- SEND MESSAGE ------------------- */
const sendMessageToBackend = async (message) => {

  try {

    setIsLoading(true);

    setMessages(prev => [
      ...prev,
      {
        role: "USER",
        content: message
      }
    ]);

    const payload = {
      message,
      latitude: window.__USER_LOCATION?.[0],
      longitude: window.__USER_LOCATION?.[1]
    };

    const response = await fetch(
      `${BASE_URL}/assistant/ask`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error("Assistant API failed");
    }

    const assistant = await response.json();

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: assistant.message
      }
    ]);

    speak(assistant.message);

    handleAssistantAction(assistant);

  } catch (e) {

    console.error(e);

    toast.error("Assistant unavailable");

  } finally {

    setIsLoading(false);

  }

};

const handleAssistantAction = (assistant) => {

  switch (assistant.action) {

    case "SEARCH_PARKING":

        navigate("/search", {
            state: {
                selectedLocationId: assistant.locationId
            }
        });

        break;

    case "OPEN_LOCATION":

        navigate(`/location/${assistant.locationId}`);

        break;

    case "NAVIGATE":
        window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${assistant.latitude},${assistant.longitude}&travelmode=driving`,
        "_blank"
        );

      break;

    case "BOOK_SLOT":

      navigate(`/location/${assistant.locationId}?slot=${assistant.slotId}`);

      break;

    case "SHOW_BOOKINGS":

      navigate("/user-dashboard");

      break;

    case "GENERAL":

    default:

      break;

    case "OPEN_BOOKING_FORM":

    navigate(
        `/location/${assistant.locationId}?slot=${assistant.slotId}`
    );

    break;

    case "PAY":

    window.dispatchEvent(
        new CustomEvent("voice-pay-confirm")
    );

    break;

  }

};

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported in this browser");
      return;
    }
    if (isListeningRef.current) {
      stopListening();
      toast.info("Microphone stopped");
    } else {
      startListening();
      toast.info("Listening... Speak now");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { e.preventDefault(); sendMessage(); }
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;
    sendMessageToBackend(inputText);
    setInputText("");
  };

  /* ================================
     STATUS LABEL
  ================================= */
  const statusLabel = isListening
    ? "Listening..."
    : isSpeaking
    ? "Speaking..."
    : isLoading
    ? "Thinking..."
    : "Online";

  /* ================================
     WAVEFORM BARS (decorative)
  ================================= */
  const WaveformBars = React.memo(() => (
    <div className="flex items-center justify-center gap-[3px] h-8 px-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-indigo-400/60"
          animate={{
            height: isListening || isSpeaking
              ? [6, Math.random() * 22 + 6, 6]
              : [4, 6, 4],
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6 + Math.random() * 0.6,
            delay: i * 0.04,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  ));

  /* ================================
     UI
  ================================= */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .jarvis-scroll::-webkit-scrollbar { width: 4px; }
        .jarvis-scroll::-webkit-scrollbar-track { background: transparent; }
        .jarvis-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }
      `}</style>

      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* ================= CHAT WINDOW ================= */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mb-4"
              style={{
                width: 340,
                height: "72vh",
                maxHeight: 520,
                borderRadius: 20,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "linear-gradient(160deg, #3b2f8f 0%, #4338ca 40%, #312e81 100%)",
                boxShadow: "0 24px 60px rgba(67,56,202,0.45), 0 0 0 1px rgba(165,180,252,0.12)",
              }}
            >
              {/* ===== HEADER ===== */}
              <div
                style={{
                  padding: "16px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(0,0,0,0.12)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar circle */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "none",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src="/jarvis-logo1.png"
                      alt="Jarvis"
                      style={{ width: 36, height: 36, objectFit: "contain" }}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.innerHTML =
                          '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
                      }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.2,
                      }}
                    >
                      Jarvis
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <span
                        style={{
                          color: "#a5b4fc",
                          fontSize: 12,
                          fontWeight: 400,
                        }}
                      >
                        AI Parking Assistant
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: "#4ade80",
                          display: "inline-block",
                          boxShadow: "0 0 6px rgba(74,222,128,0.8)",
                        }}
                      />
                      <span style={{ color: "#86efac", fontSize: 11 }}>{statusLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Right: action buttons — clearly visible */}
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Minimize"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "rgba(255,255,255,0.14)",
                      border: "1.5px solid rgba(255,255,255,0.28)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 0,
                    }}
                  >
                    -
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background: "rgba(239,68,68,0.8)",
                      border: "1.5px solid rgba(252,165,165,0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: 0,
                      boxShadow: "0 2px 10px rgba(239,68,68,0.4)",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* ===== MESSAGES ===== */}
              <div
                className="jarvis-scroll"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {messages.map((msg, i) => {
                  const isUser = msg.role === "USER";
                  const content = msg.content || msg.text || "";
                  if (!content && !msg.type) return null;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      {/* Sender label + time */}
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(199,210,254,0.6)",
                          marginBottom: 4,
                          paddingLeft: isUser ? 0 : 4,
                          paddingRight: isUser ? 4 : 0,
                        }}
                      >
                        {isUser ? "You" : "Jarvis"}{" "}
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      <div
                        style={{
                          maxWidth: "82%",
                          padding: "10px 14px",
                          borderRadius: isUser
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                          fontSize: 13.5,
                          lineHeight: 1.55,
                          background: isUser
                            ? "rgba(255,255,255,0.18)"
                            : "rgba(255,255,255,0.1)",
                          color: "#e0e7ff",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        {content}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing dots */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(199,210,254,0.6)",
                        marginBottom: 4,
                        paddingLeft: 4,
                      }}
                    >
                      Jarvis
                    </div>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "18px 18px 18px 4px",
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        gap: 5,
                        alignItems: "center",
                      }}
                    >
                      {[0, 0.2, 0.4].map((delay, idx) => (
                        <motion.span
                          key={idx}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.7, delay }}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#a5b4fc",
                            display: "block",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ===== WAVEFORM ===== */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.08)",
                  padding: "4px 0",
                }}
              >
                <WaveformBars />
              </div>

              {/* ===== INPUT ===== */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 50,
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "6px 6px 6px 14px",
                  }}
                >
                  {/* MIC — always visible, red when active */}
                                    <button
  onClick={toggleListening} // Replace with your toggle function
  className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
    isListening 
      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/50 scale-105' 
      : 'bg-zinc-800 hover:bg-zinc-700'
  }`}
>
  {/* Layered Pulsing Rings (Only fires when actively listening) */}
  {isListening && (
    <>
      <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping [animation-duration:1.5s]" />
      <div className="absolute inset-1 rounded-full bg-indigo-500/20 animate-ping [animation-duration:2s] [animation-delay:0.3s]" />
    </>
  )}

  {/* Your Icon Logic Nestled Safely Inside */}
  <span className="relative z-10">
    {isListening ? (
      <MicOff size={16} strokeWidth={2.2} color="#fff" />
    ) : (
      <Mic size={16} strokeWidth={2.2} color="#fff" />
    )}
  </span>
</button>

                  
                                    {/* TEXT INPUT */}
                                    <input
                                      className="jv-input"
                                      type="text"
                                      placeholder="Type your message..."
                                      value={inputText}
                                      onChange={e => setInputText(e.target.value)}
                                      onKeyDown={handleKeyPress}
                                      style={{
                                        flex:1, background:"transparent", border:"none", outline:"none",
                                        fontSize:13.5, color:"#e0e7ff", fontFamily:"inherit", minWidth:0,
                                      }}
                                    />
                  
                                    {/* SEND — solid indigo, always visible */}
                                    <button
                                      onClick={sendMessage}
                                      title="Send"
                                      style={{
                                        width:38, height:38, borderRadius:"50%", flexShrink:0,
                                        background:"linear-gradient(135deg,#6366f1,#4f46e5)",
                                        border:"1.5px solid rgba(165,180,252,0.5)",
                                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                                        color:"#fff",
                                        boxShadow:"0 4px 16px rgba(99,102,241,0.55)",
                                      }}
                                    >
                                      <span style={{ fontSize: 18, lineHeight: 1 }}>➤</span>
                  </button>
                </div>

                {/* Listening label */}
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      justifyContent: "center",
                    }}
                  >
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#f87171",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        color: "rgba(199,210,254,0.7)",
                        fontSize: 12,
                      }}
                    >
                      Listening...
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= FLOATING BUTTON ================= */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.06 }}
            animate={{
              boxShadow:
                isListening || isSpeaking
                  ? [
                      "0 0 20px rgba(99,102,241,0.5)",
                      "0 0 45px rgba(129,140,248,0.9)",
                      "0 0 20px rgba(99,102,241,0.5)",
                    ]
                  : ["0 0 20px rgba(99,102,241,0.3)"],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => {

  const opening = !isOpen;

  setIsOpen(opening);

  if (opening && !assistantActive) {

    setAssistantActive(true);

    const welcomeMessage =
      `Welcome back ${user?.name || ""}. How can I help you today?`;

    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: welcomeMessage
      }
    ]);

    speak(welcomeMessage);
  }
}}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "transparent",
              border: "2px solid rgba(129,140,248,0.15)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.12s, box-shadow 0.18s",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "transparent",
              }}
            />
            <img
              src="/jarvis-logo1.png"
              alt="Jarvis"
              style={{ width: 46, height: 46, objectFit: "contain", position: "relative", zIndex: 1 }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML +=
                  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.8" style="position:relative;z-index:1"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
              }}
            />
          </motion.button>

          <span
            style={{
              fontSize: 11,
              color: "rgba(99,102,241,0.85)",
              fontWeight: 500,
              letterSpacing: "0.02em",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Jarvis
          </span>
        </div>
      </div>
    </>
  );
}
