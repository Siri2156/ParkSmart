import React, { useState, useEffect } from 'react';
import { BASE_URL } from "@/api/apiConfig";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Car, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, available) => {
  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 0C11.163 0 4 7.163 4 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${color}"/>
      <circle cx="20" cy="16" r="8" fill="white"/>
      <text x="20" y="20" font-size="12" font-weight="bold" text-anchor="middle" fill="${color}">${available}</text>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function RealTimeMap({ locations = [], slots = [] }) {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [route, setRoute] = useState(null);
  const [mapCenter, setMapCenter] = useState([19.0760, 72.8777]); // Default to Mumbai

  const normalizeLocation = (location = {}) => ({
    ...location,
    id: location.id,
    name: location.name ?? 'Parking Location',
    address: location.address ?? '',
    hourly_rate: location.hourly_rate ?? location.hourlyRate ?? 0,
    total_slots: location.total_slots ?? location.totalSlots ?? 0,
    slots: location.total_slots ?? location.totalSlots ?? location.slots ?? 0,
  });

  const normalizeSlot = (slot = {}) => ({
    ...slot,
    id: slot.id,
    slotNumber: slot.slotNumber ?? slot.slot_number ?? `Slot-${slot.id ?? ''}`,
    status: slot.status ?? 'AVAILABLE',
    floorNumber: slot.floorNumber ?? slot.floor_number ?? 'Ground',
    slotType: slot.slotType ?? slot.slot_type ?? 'NORMAL',
    locationId: slot.locationId ?? slot.location?.id ?? slot.location_id ?? null,
  });

  const normalizedSlots = slots.map(normalizeSlot);

  const [availableCounts, setAvailableCounts] = useState({});

  useEffect(() => {
    if (!userLocation || !selectedSlot) return;

    const fetchRoute = async () => {
      try {
        const response = await fetch(`${BASE_URL}/route/optimize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            start: {
              lat: userLocation[0],
              lng: userLocation[1]
            },
            end: {
              lat: selectedSlot.latitude,
              lng: selectedSlot.longitude
            }
          })
        });

        const data = await response.json();
        setRoute(data);
      } catch (error) {
        console.error("Route fetch failed", error);
      }
    };

    fetchRoute();
  }, [userLocation, selectedSlot]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          // expose user location globally for other components (best-effort)
          try { window.__USER_LOCATION = [latitude, longitude]; } catch (e) {}
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  }, []);

  // Keep global user location in sync if it changes
  useEffect(() => {
    if (userLocation) {
      try { window.__USER_LOCATION = userLocation; } catch (e) {}
    }
  }, [userLocation]);

  const getAvailableSlots = (locationId) => {
    // Prefer server-provided live counts when available, fallback to local slots array
    const live = availableCounts[locationId];
    if (typeof live === 'number') return live;

    return normalizedSlots.filter(
      (slot) =>
        Number(slot.locationId ?? slot.location?.id) === Number(locationId) &&
        slot.status === "AVAILABLE"
    ).length;
  };

  // Fetch live available slot counts for visible locations
  useEffect(() => {
    let cancelled = false;
    const visible = locations
      .filter(loc => loc.latitude && loc.longitude && loc.active !== false)
      .map(l => l.id);

    if (visible.length === 0) return undefined;

    (async () => {
      try {
        const results = await Promise.all(
          visible.map(id => fetch(`${BASE_URL}/locations/${id}/available`).then(r => r.ok ? r.json() : []))
        );

        if (cancelled) return;

        const map = {};
        visible.forEach((id, idx) => {
          map[id] = Array.isArray(results[idx]) ? results[idx].length : 0;
        });
        setAvailableCounts(map);
      } catch (e) {
        console.error('Failed to fetch live available counts', e);
      }
    })();

    return () => { cancelled = true; };
  }, [locations, slots]);

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  const getMarkerColor = (availableSlots, totalSlots = 0) => {
    const safeTotal = totalSlots || 1;
    const percentage = (availableSlots / safeTotal) * 100;
    if (percentage > 50) return '#10b981'; // Green
    if (percentage > 20) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  return (
    <div className="relative">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <Button
          onClick={centerOnUser}
          size="icon"
          className="bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
          title="Center on my location"
        >
          <Navigation className="w-5 h-5" />
        </Button>
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-xl" style={{ height: '600px' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater center={mapCenter} />

          {/* User Location Marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    background: #3b82f6;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  ""></div>
                `,
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>
                <div className="p-2">
                  <p className="font-semibold">Your Location</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Parking Location Markers */}
          {locations
            .filter(loc => loc.latitude && loc.longitude && loc.active !== false)
            .map((location) => {
              const normalizedLocation = normalizeLocation(location);
              const availableSlots = getAvailableSlots(normalizedLocation.id);
              const markerColor = getMarkerColor(availableSlots, normalizedLocation.total_slots || normalizedLocation.slots || 0);

              return (
                <Marker
                  key={normalizedLocation.id}
                  position={[normalizedLocation.latitude, normalizedLocation.longitude]}
                  icon={createCustomIcon(markerColor, availableSlots)}
                >
                  <Popup maxWidth={300}>
                    <Card className="border-0 shadow-none">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2">{normalizedLocation.name}</h3>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="text-gray-700">{normalizedLocation.address}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">₹{normalizedLocation.hourly_rate}/hour</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            <Badge className={availableSlots > 0 ? '!bg-green-500 !text-white !border-transparent' : '!bg-red-500 !text-white !border-transparent'}>
                              {availableSlots} / {normalizedLocation.total_slots || normalizedLocation.slots || 0} Available
                            </Badge>
                          </div>
                        </div>

                        <Button
                          onClick={() => navigate(`/location/${normalizedLocation.id}`)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          size="sm"
                        >
                          View Details & Book
                        </Button>
                      </CardContent>
                    </Card>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="mt-4 bg-white rounded-lg p-4 shadow-md">
        <h4 className="font-semibold mb-3 text-sm">Map Legend</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm text-gray-700">Available (50%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span className="text-sm text-gray-700">Limited (20-50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm text-gray-700">Almost Full (&lt;20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />
            <span className="text-sm text-gray-700">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}