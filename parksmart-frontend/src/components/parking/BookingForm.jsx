import React, { useState, useEffect } from 'react';
import { BASE_URL } from "@/api/apiConfig";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Car, CreditCard, X } from 'lucide-react';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';

export default function BookingForm({ location, slot, onComplete, onCancel }) {
  useEffect(() => {

    window.dispatchEvent(
        new Event("booking-form-open")
    );

    return () => {
        window.dispatchEvent(
            new Event("booking-form-close")
        );
    };

}, []);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    booking_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: format(new Date(), 'HH:mm'),
    duration_hours: 2,
    vehicle_number: '',
  });
  const [loading, setLoading] = useState(false);

  // load logged-in user for booking metadata
  React.useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const calculateTotal = () => {
    return (location.hourly_rate * formData.duration_hours).toFixed(2);
  };

  const calculateEndTime = () => {
    const [hours, minutes] = formData.start_time.split(':');
    const startDate = new Date();
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const endDate = addHours(startDate, formData.duration_hours);
    return format(endDate, 'HH:mm');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.vehicle_number.trim()) {
    toast.error('Please enter your vehicle number');
    return;
  }

  setLoading(true);

  try {
    const startTime = `${formData.booking_date}T${formData.start_time}:00`;
    const endTimeObj = addHours(
      new Date(`${formData.booking_date}T${formData.start_time}`)
    , formData.duration_hours);
    const endTime = format(endTimeObj, "yyyy-MM-dd'T'HH:mm:ss");

    const response = await fetch(`${BASE_URL}/bookings/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userName: user?.name || user?.email || "Anonymous",
        vehicleNumber: formData.vehicle_number.toUpperCase(),
        locationId: location.id,
        slotId: slot.id,
        startTime: startTime,
        endTime: endTime,
        durationHours: formData.duration_hours
      })
    });

    if (!response.ok) throw new Error("Booking failed");

    const data = await response.json();

    toast.success("Booking confirmed!");
    navigate(`/booking-confirmation?bookingId=${data.id}`);
    if (onComplete) onComplete(data);

  } catch (error) {
    console.error('Booking error:', error);
    toast.error('Failed to complete booking.');
  } finally {
    setLoading(false);
  }
};
useEffect(() => {

    const listener = () => {

        handleSubmit({
            preventDefault: () => {}
        });

    };

    window.addEventListener(
        "voice-pay-confirm",
        listener
    );

    return () =>
        window.removeEventListener(
            "voice-pay-confirm",
            listener
        );

}, [formData, user]);

  return (
    <Card className="border-2 border-indigo-600">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Complete Booking
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Booking Details Summary */}
          <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Location</span>
              <span className="font-medium text-right">{location.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Slot</span>
              <span className="font-medium">{slot.slotNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Rate</span>
              <span className="font-medium">₹{location.hourly_rate}/hour</span>
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <Label htmlFor="vehicle_number">Vehicle Number *</Label>
            <Input
              id="vehicle_number"
              placeholder="e.g., MH12AB1234"
              value={formData.vehicle_number}
              onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
              className="uppercase"
              required
            />
          </div>

          {/* Booking Date */}
          <div>
            <Label htmlFor="booking_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Booking Date
            </Label>
            <Input
              id="booking_date"
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <Label htmlFor="start_time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Start Time
            </Label>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration">Duration (hours)</Label>
            <Select
              value={formData.duration_hours.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration_hours: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 24].map(hours => (
                  <SelectItem key={hours} value={hours.toString()}>
                    {hours} {hours === 1 ? 'hour' : 'hours'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* End Time Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">End Time</div>
            <div className="text-lg font-semibold">{calculateEndTime()}</div>
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Amount</span>
              <span className="text-3xl font-bold text-indigo-600">₹{calculateTotal()}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-6 text-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ₹{calculateTotal()} & Confirm
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Your payment is secured with 256-bit SSL encryption
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
