import React, { useState } from "react";
import BASE_URL from "@/api/apiConfig";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Search,
  ParkingCircle,
  DollarSign,
} from "lucide-react";
import LocationFormDialog from "../components/admin/LocationFormDialog.jsx";
import { toast } from "sonner";

export default function ManageLocations() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  /* -------------------- FETCH LOCATIONS -------------------- */
  const {
  data: locations = [],
  isLoading,
  isError,
  refetch,
} = useQuery({
  queryKey: ['adminLocations'],
  queryFn: async () => {
    const res = await fetch(`${BASE_URL}/admin/locations`);
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },
  retry: false,
});


  /* -------------------- FETCH SLOTS -------------------- */
  
  /* -------------------- DELETE LOCATION -------------------- */
  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId) => {
      const res = await fetch(`${BASE_URL}/admin/locations/${locationId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLocations"] });
      toast.success("Location deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete location");
    },
  });

  /* -------------------- FILTER -------------------- */
  const filteredLocations = locations.filter((loc) =>
    `${loc.name} ${loc.city} ${loc.area}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowDialog(true);
  };

  const handleDelete = (location) => {
    if (
      confirm(
        `Are you sure you want to delete "${location.name}"? This will also delete all its parking slots.`
      )
    ) {
      deleteLocationMutation.mutate(location.id);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Locations
            </h1>
            <p className="text-gray-600">
              {locations.length} parking locations
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingLocation(null);
              setShowDialog(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Location
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Locations Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ParkingCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load locations
              </h3>
              <p className="text-gray-600 mb-6">
                There was a problem fetching locations from the backend.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => refetch()} className="bg-indigo-600 hover:bg-indigo-700">Retry</Button>
                <Button variant="outline" onClick={() => setShowDialog(true)}>Add Location</Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredLocations.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => {
              const totalSlots = location.total_slots
              const availableSlots = location.available_slots??totalSlots;
              
              return (
                <Card key={location.id} className="hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {location.name}
                      </h3>
                      <Badge className={location.is_active !== false ? 'bg-green-500' : 'bg-gray-400'}>
                        {location.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{location.address}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <ParkingCircle className="w-4 h-4 text-indigo-600" />
                          <span className="font-medium">{location.total_slots} slots</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-medium">₹{location.hourly_rate}/hr</span>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-600">Available: </span>
                        <span className="font-semibold text-green-600">{availableSlots}</span>
                        <span className="text-gray-600"> / </span>
                        <span className="font-semibold">{location.total_slots}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(location)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(location)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <ParkingCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Locations Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search' : 'Get started by adding your first parking location'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Location Form Dialog */}
        <LocationFormDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          location={editingLocation}
        />
      </div>
    </div>
  );
}