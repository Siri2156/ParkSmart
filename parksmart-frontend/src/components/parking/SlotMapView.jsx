import { motion } from "framer-motion";
import { Car, Zap, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function SlotMapView({
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
        return "bg-green-500 hover:bg-green-600 border-green-600 shadow-green-300";
      case "OCCUPIED":
        return "bg-red-500 border-red-600 cursor-not-allowed shadow-red-300";
      case "RESERVED":
        return "bg-yellow-500 border-yellow-600 cursor-not-allowed shadow-yellow-300";
      case "MAINTENANCE":
        return "bg-gray-400 border-gray-500 cursor-not-allowed shadow-gray-300";
      default:
        return "bg-gray-300 border-gray-400";
    }
  };

  /* ---------------- SLOT ICON ---------------- */
  const getSlotIcon = (status, slotType) => {
    if (status === "MAINTENANCE") return <Wrench className="w-5 h-5" />;
    if (slotType === "EV_CHARGING") return <Zap className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  return (
    <div className="space-y-8">
      {floors.map((floor) => {
        const floorSlots = slotsByFloor[floor] || [];
        const availableCount = floorSlots.filter(s => s.status === 'AVAILABLE').length;
        
        return (
          <motion.div
            key={floor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200"
          >
            {/* Floor Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{floor[0]}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{floor} Floor</h3>
                  <p className="text-sm text-gray-600">{availableCount} available of {floorSlots.length} slots</p>
                </div>
              </div>
              <Badge className={availableCount > 0 ? 'bg-green-500' : 'bg-red-500'}>
                {Math.round((availableCount / floorSlots.length) * 100)}% Free
              </Badge>
            </div>

            {/* Map Layout */}
            <div className="relative bg-white rounded-xl p-8 border-2 border-dashed border-gray-300">
              {/* Entry/Exit markers */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-medium">
                  ↓ ENTRY
                </div>
              </div>
              <div className="absolute bottom-0 right-8 translate-y-1/2">
                <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-medium">
                  EXIT ↑
                </div>
              </div>

              {/* Parking Layout */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Side */}
                <div className="space-y-4">
                  <div className="text-xs font-medium text-gray-500 text-center mb-2">LEFT SIDE</div>
                  <div className="grid grid-cols-4 gap-3">
                    {floorSlots.slice(0, Math.ceil(floorSlots.length / 2)).map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const isAvailable = slot.status === 'AVAILABLE';
                      
                      return (
                        <motion.button
                          key={slot.id}
                          whileHover={isAvailable ? { scale: 1.1, rotate: 2 } : {}}
                          whileTap={isAvailable ? { scale: 0.95 } : {}}
                          onClick={() => isAvailable && onSlotSelect(slot)}
                          disabled={!isAvailable}
                          className={cn(
                            'relative aspect-square rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center p-3 shadow-lg',
                            getStatusColor(slot.status),
                            isSelected && 'ring-4 ring-indigo-600 ring-offset-2 scale-110',
                            isAvailable && 'cursor-pointer hover:shadow-xl'
                          )}
                        >
                          <div className="text-white mb-1">{getSlotIcon(slot.status, slot.slotType)}</div>
                          <div className="text-white font-bold text-sm">{slot.slotNumber}</div>
                          
                          {/* IoT Sensor */}
                          <motion.div 
                            className="absolute -top-1 -left-1"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              iotConnected ? "bg-green-400" : "bg-red-400"
                            )} />
                          </motion.div>

                          {/* Special badges */}
                          {slot.slotType === 'EV_CHARGING' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                              <Zap className="w-2 h-2 text-yellow-900" />
                            </div>
                          )}
                          
                          {slot.slotType === 'DISABLED' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                              ♿
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Road/Aisle */}
                <div className="flex items-center justify-center">
                  <div className="w-full h-full border-l-4 border-r-4 border-dashed border-gray-400 bg-gray-200 flex items-center justify-center relative">
                    <div className="absolute inset-0 flex flex-col justify-around items-center py-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1 h-8 bg-yellow-400 rounded-full" />
                      ))}
                    </div>
                    <div className="transform -rotate-90 text-xs font-bold text-gray-600 tracking-wider">
                      DRIVE WAY
                    </div>
                  </div>
                </div>

                {/* Right Side */}
                <div className="space-y-4">
                  <div className="text-xs font-medium text-gray-500 text-center mb-2">RIGHT SIDE</div>
                  <div className="grid grid-cols-4 gap-3">
                    {floorSlots.slice(Math.ceil(floorSlots.length / 2)).map((slot) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      const isAvailable = slot.status === 'AVAILABLE';
                      
                      return (
                        <motion.button
                          key={slot.id}
                          whileHover={isAvailable ? { scale: 1.1, rotate: -2 } : {}}
                          whileTap={isAvailable ? { scale: 0.95 } : {}}
                          onClick={() => isAvailable && onSlotSelect(slot)}
                          disabled={!isAvailable}
                          className={cn(
                            'relative aspect-square rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center p-3 shadow-lg',
                            getStatusColor(slot.status),
                            isSelected && 'ring-4 ring-indigo-600 ring-offset-2 scale-110',
                            isAvailable && 'cursor-pointer hover:shadow-xl'
                          )}
                        >
                          <div className="text-white mb-1">{getSlotIcon(slot.status, slot.slotType)}</div>
                          <div className="text-white font-bold text-sm">{slot.slotNumber}</div>
                          
                          {/* IoT Sensor */}
                          <motion.div 
                            className="absolute -top-1 -left-1"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              iotConnected ? "bg-green-400" : "bg-red-400"
                            )} />
                          </motion.div>

                          {/* Special badges */}
                          {slot.slotType === 'EV_CHARGING' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                              <Zap className="w-2 h-2 text-yellow-900" />
                            </div>
                          )}
                          
                          {slot.slotType === 'DISABLED' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                              ♿
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
