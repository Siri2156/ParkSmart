import React, { useState, useEffect } from 'react';
import { BASE_URL } from "@/api/apiConfig";
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function LocationFormDialog({ open, onOpenChange, location }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    area: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    total_slots: 20,
    hourly_rate: 50,
    facilities: [],
    image_url: '',
    is_active: true
  });

  const [newFacility, setNewFacility] = useState('');
  const [loading, setLoading] = useState(false);

  /* ----------------------------------
     Populate form when editing
  -----------------------------------*/
  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        address: location.address || '',
        city: location.city || '',
        area: location.area || '',
        pincode: location.pincode || '',
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        total_slots: location.total_slots || 20,
        hourly_rate: location.hourly_rate || 50,
        facilities: location.facilities || [],
        image_url: location.image_url || '',
        is_active: location.is_active !== false
      });
    }
  }, [location, open]);

  /* ----------------------------------
     Create slots after new location
  -----------------------------------*/
  const createSlots = async (locationId, totalSlots) => {
    const floorNames = [0, 1, 2, 3]; // Ground = 0, 1st = 1, etc.
    const slotsPerFloor = Math.ceil(totalSlots / floorNames.length);

    for (let f = 0; f < floorNames.length; f++) {
      const slotCount = Math.min(slotsPerFloor, totalSlots - f * slotsPerFloor);
      if (slotCount <= 0) break;

      const floorSlotNumbers = [];
      for (let i = 0; i < slotCount; i++) {
        floorSlotNumbers.push(`${String.fromCharCode(65 + f)}${i + 1}`);
      }

      await fetch(
        `${BASE_URL}/admin/locations/${locationId}/slots?floor=${floorNames[f]}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(floorSlotNumbers),
        }
      );
    }
  };

  /* ----------------------------------
     Submit handler (FIXED)
  -----------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = location
  ? `${BASE_URL}/admin/locations/${location.id}`
  : `${BASE_URL}/admin/locations`;

const res = await fetch(url, {
  method: location ? "PUT" : "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(formData)
});


      if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to save location");
    }
      const savedLocation = await res.json();

      // Create slots ONLY when new location
      if (!location) {
        await createSlots(savedLocation.id, formData.total_slots);
      }

      // 🔥 THIS IS WHAT UPDATES MapView & SlotMapView LIVE
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });

      toast.success(`Location ${location ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
     Facilities helpers
  -----------------------------------*/
  const addFacility = () => {
    if (newFacility.trim()) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  const removeFacility = (index) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., City Mall Parking"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Full address"
                required
              />
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="e.g., Mumbai"
                required
              />
            </div>

            <div>
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                placeholder="e.g., Andheri West"
              />
            </div>

            <div>
              <Label htmlFor="pincode">PIN Code</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                placeholder="400001"
              />
            </div>

            <div>
              <Label htmlFor="total_slots">Total Slots *</Label>
              <Input
                id="total_slots"
                type="number"
                min="1"
                value={formData.total_slots}
                onChange={(e) => setFormData({...formData, total_slots: parseInt(e.target.value)})}
                required
              />
            </div>

            <div>
              <Label htmlFor="hourly_rate">Hourly Rate (₹) *</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({...formData, hourly_rate: parseFloat(e.target.value)})}
                required
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <Label>Facilities</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                placeholder="Add facility (e.g., CCTV, Security)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFacility())}
              />
              <Button type="button" onClick={addFacility}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((facility, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {facility}
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
            />
            <Label>Active Location</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? 'Saving...' : (location ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}