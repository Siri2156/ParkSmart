import React from "react";
import { motion } from "framer-motion";
import { Car, Zap, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SlotGridView({
  slots = [],
  onSlotSelect,
  selectedSlot,
  iotConnected,
}) {
  /* ---------------- GROUP BY FLOOR ---------------- */
  const slotsByFloor = slots.reduce((acc, slot) => {
    const floor = slot.floorNumber ?? "Ground";
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(slot);
    return acc;
  }, {});

  const floors = Object.keys(slotsByFloor).sort((a, b) => {
    const order = ["Ground", "1st", "2nd", "3rd", "4th"];
    return order.indexOf(a) - order.indexOf(b);
  });

  /* ---------------- STATUS COLORS ---------------- */
  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500 hover:bg-green-600 border-green-600";
      case "OCCUPIED":
        return "bg-red-500 border-red-600 cursor-not-allowed";
      case "RESERVED":
        return "bg-yellow-500 border-yellow-600 cursor-not-allowed";
      case "MAINTENANCE":
        return "bg-gray-400 border-gray-500 cursor-not-allowed";
      default:
        return "bg-gray-300 border-gray-400";
    }
  };

  /* ---------------- SLOT ICON ---------------- */
  const getSlotIcon = (status, slotType) => {
    if (status === "MAINTENANCE") return <Wrench className="w-4 h-4" />;
    if (slotType === "EV_CHARGING") return <Zap className="w-4 h-4" />;
    return <Car className="w-4 h-4" />;
  };

  /* ---------------- UI (UNCHANGED) ---------------- */
  return (
    <div className="space-y-8">
      {floors.map((floor) => {
        const floorSlots = slotsByFloor[floor] || [];

        return (
          <div key={floor}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {floor} Floor
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {floorSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isAvailable = slot.status === "AVAILABLE";

                return (
                  <motion.button
                    key={slot.id}
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => isAvailable && onSlotSelect(slot)}
                    disabled={!isAvailable}
                    className={cn(
                      "relative aspect-square rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-2",
                      getStatusColor(slot.status),
                      isSelected && "ring-4 ring-indigo-600 ring-offset-2",
                      isAvailable &&
                        "cursor-pointer shadow-md hover:shadow-lg"
                    )}
                  >
                    <div className="text-white mb-1">
                      {getSlotIcon(slot.status, slot.slotType || "NORMAL")}
                    </div>

                    <div className="text-white font-bold text-xs">
                      {slot.slotNumber}
                    </div>

                    {slot.slotType === "EV_CHARGING" && isAvailable && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
                    )}

                    {/* IoT Status Dot */}
                    <motion.div
                      className="absolute -bottom-1 -left-1"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          iotConnected ? "bg-green-400" : "bg-red-400"
                        )}
                      />
                    </motion.div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
