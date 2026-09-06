import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import BASE_URL from "@/api/apiConfig";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, MapPin, ParkingCircle } from "lucide-react";
import LocationCard from "../components/parking/LocationCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const nearestLocationId = location.state?.nearestLocationId;
  const voiceMode = location.state?.voiceMode;
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedCity, setSelectedCity] = useState("all");

  const { data: locations = [], isLoading } = useQuery({
  queryKey: ["parkingLocations"],
  queryFn: async () => {
    const res = await fetch(`${BASE_URL}/locations`);
    if (!res.ok) return [];

    const data = await res.json();

    // 🔥 NORMALIZE KEYS FOR UI (NO UI CHANGE)
    return data.map((loc) => ({
      ...loc,
      image_url: loc.image_url ?? loc.imageUrl ?? null,
      hourly_rate: loc.hourly_rate ?? loc.hourlyRate ?? 0,
      total_slots: loc.total_slots ?? loc.totalSlots ?? 0,
      is_active: loc.is_active ?? loc.active ?? true,
    }));
  },
});


  const { data: slots = [] } = useQuery({
    queryKey: ["parkingSlots"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/slots`);
      return res.ok ? res.json() : [];
    },
  });

  const normalizeSlot = (slot = {}) => ({
    ...slot,
    id: slot.id,
    status: slot.status ?? "AVAILABLE",
    locationId: slot.locationId ?? slot.location?.id ?? slot.location_id ?? null,
  });

  const normalizedSlots = Array.isArray(slots) ? slots.map(normalizeSlot) : [];

  const getLocationSlotStats = (locationId, fallbackTotal = 0) => {
    const matchedSlots = normalizedSlots.filter(
      (slot) => Number(slot.locationId ?? slot.location?.id ?? 0) === Number(locationId)
    );
    const total = matchedSlots.length > 0 ? matchedSlots.length : Number(fallbackTotal || 0);
    const available = matchedSlots.filter((slot) => slot.status === "AVAILABLE").length;
    return {
      available,
      total: Math.max(total, available),
    };
  };

  const getAvailableSlots = (locationId, fallbackTotal = 0) => {
    if (typeof availableCounts[locationId] === 'number') return availableCounts[locationId];
    return getLocationSlotStats(locationId, fallbackTotal).available;
  };

  const [availableCounts, setAvailableCounts] = useState({});

  // fetch live available counts for shown locations
  useEffect(() => {
    let cancelled = false;
    const ids = locations.map(l => l.id).filter(Boolean);
    if (ids.length === 0) return undefined;

    (async () => {
      try {
        const results = await Promise.all(ids.map(id => fetch(`${BASE_URL}/locations/${id}/available`).then(r => r.ok ? r.json() : [])));
        if (cancelled) return;
        const map = {};
        ids.forEach((id, idx) => { map[id] = Array.isArray(results[idx]) ? results[idx].length : 0; });
        setAvailableCounts(map);
      } catch (e) {
        console.error('Failed to fetch available counts', e);
      }
    })();

    return () => { cancelled = true; };
  }, [locations, slots]);
      
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.pincode?.includes(searchQuery);

    const matchesCity =
      selectedCity === "all" || location.city === selectedCity;

    return matchesSearch && matchesCity && location.is_active === true;
  });

  const cities = [...new Set(locations.map((l) => l.city).filter(Boolean))];

  return (
    <div className="min-h-screen pb-12">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Find Your Perfect Parking Spot
            </h1>
            <p className="text-xl text-indigo-100">
              Search from {locations.length}+ locations across the city
            </p>
          </div>
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-2">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by city, area, or PIN code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg text-gray-900 caret-gray-900 placeholder:text-gray-400 border-0 focus-visible:ring-0"
                  />
                </div>
                <Button 
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 px-8"
                >
                  <SearchIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-8">
            {[
              { label: "Total Locations", value: locations.length },
              { label: "Available Slots", value: slots.filter(s => s.status === 'AVAILABLE').length },
              { label: "Cities", value: cities.length },
              { label: "Active Bookings", value: "24/7" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCity === "all" ? "default" : "outline"}
              onClick={() => setSelectedCity("all")}
            >
              All Cities
            </Button>
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </Button>
            ))}
          </div>

          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="grid">
                <ParkingCircle className="w-4 h-4 mr-2" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Loading...</p>
            ) : filteredLocations.length ? (
              filteredLocations.map((location) => (
                <LocationCard
                selected={location.id === nearestLocationId}
                  key={location.id}
                  location={location}
                  availableSlots={getAvailableSlots(location.id)}
                  onClick={() =>
                    navigate(`/location/${location.id}`)
                  }
                />
              ))
            ) : (
              <p>No locations found</p>
            )}
          </div>
        ) : (
          <p>Map view not implemented</p>
        )}
      </div>
    </div>
    
  );
}
