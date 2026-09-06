import React from "react";
import { motion } from "framer-motion";
import { Car, Zap, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * SlotGrid
 * Props:
 *  - slots: Array of slot objects from backend
 *  - onSlotSelect: function(slot)
 *  - selectedSlot: selected slot object
 */
export default function SlotGrid({ slots = [], onSlotSelect, selectedSlot }) {

  /* ---------------- GROUP SLOTS BY FLOOR ---------------- */
  const slotsByFloor = slots.reduce((acc, slot) => {
    const floor = slot.floorNumber ?? "Ground"; // fallback if floor missing
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(slot);
    return acc; // ✅ FIXED (DO NOT CHANGE UI)
  }, {});

  const floors =
    Object.keys(slotsByFloor).length > 0
      ? Object.keys(slotsByFloor)
      : ["Ground"];

  /* ---------------- STATUS COLOR ---------------- */
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


  return (
    <div className="space-y-8">
      {floors.map((floor) => {
        const floorSlots = slotsByFloor[floor] || slots;
        
        return (
          <div key={floor}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {floor} Floor
            </h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {floorSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isAvailable = slot.status === 'AVAILABLE';
                
                return (
                  <motion.button
                    key={slot.id}
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                    onClick={() => isAvailable && onSlotSelect(slot)}
                    disabled={!isAvailable}
                    className={cn(
                      'relative aspect-square rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-2',
                      getStatusColor(slot.status),
                      isSelected && 'ring-4 ring-indigo-600 ring-offset-2',
                      isAvailable && 'cursor-pointer shadow-md hover:shadow-lg'
                    )}
                  >
                    <div className="text-white mb-1">
                      {getSlotIcon(slot.status, slot.slotType)}
                    </div>
                    <div className="text-white font-bold text-xs">
                      {slot.slotNumber}
                    </div>
                    
                    {slot.slotType === 'EV_CHARGING' && isAvailable && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white" />
                    )}
                    
                    {slot.slotType === 'DISABLED' && (
                      <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center text-[8px] text-white font-bold">
                        ♿
                      </div>
                    )}
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