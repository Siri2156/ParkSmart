import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BASE_URL from "@/api/apiConfig";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  ArrowLeft,
  MapPin,
  Shield,
  Car,
  Calendar,
  Clock,
  CreditCard,
  Wifi,
  Grid3x3,
  Map,
} from "lucide-react";

import { format, addHours } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import SlotMapView from "@/components/parking/SlotMapView";
import SlotGridView from "@/components/parking/SlotGridView";
import BookingForm from "@/components/parking/BookingForm";

/* ====================================================== */

export default function LocationDetails() {
  const navigate = useNavigate();
  const { id: locationId } = useParams();

  const normalizeLocation = (loc: any = {}) => ({
    ...loc,
    id: loc.id,
    name: loc.name ?? "Parking Location",
    address: loc.address ?? "",
    facilities: Array.isArray(loc.facilities) ? loc.facilities : [],
    hourly_rate: loc.hourly_rate ?? loc.hourlyRate ?? 0,
    total_slots: loc.total_slots ?? loc.totalSlots ?? 0,
  });

  const normalizeSlot = (slot: any = {}) => ({
    ...slot,
    id: slot.id,
    slotNumber: slot.slotNumber ?? slot.slot_number ?? `Slot-${slot.id ?? ""}`,
    status: slot.status ?? "AVAILABLE",
    floorNumber: slot.floorNumber ?? slot.floor_number ?? "Ground",
    slotType: slot.slotType ?? slot.slot_type ?? "NORMAL",
    locationId: slot.locationId ?? slot.location?.id ?? slot.location_id ?? null,
  });

  const [location, setLocation] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [iotConnected, setIotConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"map" | "grid">("map");
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get("slot");

  /* ---------------- FETCH LOCATION + SLOTS ---------------- */
  useEffect(() => {
    if (!locationId) return;

    setLoading(true);

    Promise.all([
      fetch(`${BASE_URL}/locations/${locationId}`).then(r => {
        if (!r.ok) throw new Error(`Location fetch failed: ${r.status}`);
        return r.json();
      }),
      fetch(`${BASE_URL}/locations/${locationId}/slots`).then(r => {
        if (!r.ok) throw new Error(`Slots fetch failed: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([loc, slotList]) => {
        const normalizedLocation = normalizeLocation(loc);
        const normalizedSlots = (Array.isArray(slotList) ? slotList : []).map(normalizeSlot);

        setLocation(normalizedLocation);
        setSlots(normalizedSlots);

        const floorsMap: any = {};
        normalizedSlots.forEach(slot => {
          const floor = slot.floorNumber ?? 0;
          if (!floorsMap[floor]) floorsMap[floor] = [];
          floorsMap[floor].push(slot);
        });

        setFloors(
          Object.keys(floorsMap).map(f => ({
            floorNumber: Number(f),
            slots: floorsMap[f],
          }))
        );
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load slots: " + err.message);
      })
      .finally(() => setLoading(false));
  }, [locationId, slotId]);

  useEffect(() => {

    if (!slotId || slots.length === 0) return;

    let aiSlot = slots.find(
      s =>
        Number(s.id) === Number(slotId) &&
        s.status === "AVAILABLE"
    );

    if (!aiSlot) {
      aiSlot = slots.find(
        s => s.status === "AVAILABLE"
      );
    }

    if (aiSlot) {
      setSelectedSlot(aiSlot);
      setShowBookingForm(true);

      toast.success(
        `Jarvis selected Slot ${aiSlot.slotNumber}`
      );
    } else {
      toast.error("No available slots.");
    }

  }, [slotId, slots]);

  /* ---------------- SIMULATED IOT UPDATES ---------------- */

  /* ---------------- IOT CONNECTION STATUS ---------------- */
  useEffect(() => {
    const iot = setInterval(() => {
      setIotConnected(Math.random() > 0.03);
    }, 5000);
    return () => clearInterval(iot);
  }, []);

  /* ---------------- SLOT SELECT ---------------- */
  const handleSlotSelect = (slot: any) => {
    if (slot.status === "AVAILABLE") {
      setSelectedSlot(slot);
      setShowBookingForm(true);
    }
  };

  /* ---------------- BOOKING SUBMIT ---------------- */
  const handleBookingComplete = async (formData: any) => {
    try {
      const user = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      }).then(r => r.json());

      const endTime = (() => {
        const [h, m] = formData.start_time.split(":");
        const d = new Date();
        d.setHours(+h, +m, 0);
        return format(addHours(d, formData.duration_hours), "HH:mm");
      })();

      const payload = {
        userEmail: user.email,
        locationId: location.id,
        slotId: selectedSlot.id,
        bookingDate: formData.booking_date,
        startTime: formData.start_time,
        endTime,
        durationHours: formData.duration_hours,
        vehicleNumber: formData.vehicle_number,
        totalAmount: location.hourly_rate * formData.duration_hours,
      };

      await fetch(`${BASE_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      toast.success("Booking confirmed!");
      navigate("/booking-confirmation");
    } catch {
      toast.error("Booking failed");
    }
  };

  if (loading || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  const availableSlots = slots.filter(s => s.status === "AVAILABLE").length;
  const facilities = location.facilities || [];

  /* ====================================================== */
  return (
    <div className="min-h-screen pb-12">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-3 mb-4 bg-transparent hover:bg-transparent focus:outline-none"
          >
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-white" />
            </span>
            <span className="text-white font-medium">Back to Search</span>
          </button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
              {location.name}
            </h1>

            <div className="flex items-start gap-2 text-indigo-100 mb-4">
              <MapPin className="w-5 h-5 mt-0.5" />
              <span className="text-lg">{location.address}</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white">
                <span className="text-indigo-600 font-medium">₹{location.hourly_rate}</span>
                <span className="ml-2 text-sm text-indigo-600/80">/hour</span>
              </div>

              <Badge className={availableSlots > 0 ? '!bg-green-500 !text-white !border-transparent' : '!bg-red-500 !text-white !border-transparent'}>
                {availableSlots} / {location.total_slots} Available
              </Badge>

              <Badge className={iotConnected ? '!bg-green-500 !text-white !border-transparent' : '!bg-red-500 !text-white !border-transparent'}>
                <Wifi className="w-3 h-3 mr-1" />
                IoT {iotConnected ? 'Connected' : 'Offline'}
              </Badge>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-sm text-indigo-100 mb-1">Total Capacity</div>
            <div className="text-4xl font-bold">{location.total_slots}</div>
            <div className="text-sm text-indigo-100">parking slots</div>
          </div>
        </div>
      </div>
    </div>

    {/* ================= MAIN CONTENT ================= */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* ================= SLOT VIEW ================= */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Select Your Slot</h2>

                <Tabs value={viewMode} onValueChange={(value) => 
                  setViewMode(value as "map" | "grid")
                }>
                  <TabsList>
                    <TabsTrigger value="map">
                      <Map className="w-4 h-4 mr-2" />
                      Map
                    </TabsTrigger>
                    <TabsTrigger value="grid">
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      Grid
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* SLOT LEGEND */}
              <div className="flex gap-6 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  Available
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  Occupied
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded" />
                  Reserved
                </div>
              </div>

              {viewMode === "map" ? (
                <SlotMapView
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  iotConnected={iotConnected}
                />
              ) : (
                <SlotGridView
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                  iotConnected={iotConnected}
                />
              )}

              <div className="mt-6 p-4 bg-blue-50 border rounded-lg">
                <div className="flex items-start gap-2">
                  <Wifi
                    className={cn(
                      "w-5 h-5",
                      iotConnected
                        ? "text-green-600 animate-pulse"
                        : "text-red-600"
                    )}
                  />
                  <div>
                    <div className="font-medium text-blue-900">
                      IoT Sensors Active
                    </div>
                    <div className="text-sm text-blue-700">
                      Last update: {format(lastUpdate, "HH:mm:ss")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="space-y-6">
          {!showBookingForm ? (
            <>
              {/* FACILITIES */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Facilities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {facilities.length ? (
                      facilities.map((f: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Shield className="w-4 h-4 text-indigo-600" />
                          {f}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-2">
                        No facilities listed
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* PRICING */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Pricing</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Hourly</span>
                      <span>₹{location.hourly_rate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Half Day (6h)</span>
                      <span>₹{location.hourly_rate * 6}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Full Day (12h)</span>
                      <span>₹{location.hourly_rate * 12}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SELECTED SLOT */}
              {selectedSlot && (
                <Card className="border-2 border-indigo-600">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">
                          Selected Slot
                        </div>
                        <div className="text-xl font-bold">
                          {selectedSlot.slotNumber}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => setShowBookingForm(true)}
                    >
                      Continue to Book
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <BookingForm
              location={location}
              slot={selectedSlot}
              onComplete={handleBookingComplete}
              onCancel={() => {
                setShowBookingForm(false);
                setSelectedSlot(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  </div>
);
}