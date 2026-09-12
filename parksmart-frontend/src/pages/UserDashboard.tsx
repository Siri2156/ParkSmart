import React, { useState } from 'react';
import { BASE_URL } from '@/api/apiConfig';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Car, CreditCard, AlertCircle, History, LayoutDashboard, Map as MapIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import RealTimeMap from '@/components/map/RealTimeMap';

export default function UserDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      });
    const currentUser = res.ok ? await res.json() : null;
    setUser(currentUser);
  };

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const userRes = await fetch(`${BASE_URL}/auth/me`, {
        credentials: "include",
      });
      const user = userRes.ok ? await userRes.json() : null;

      const bookingsRes = await fetch(`${BASE_URL}/bookings`, {
        credentials: "include",
      });
      const allBookings = bookingsRes.ok ? await bookingsRes.json() : [];

      // Bookings store `userName` (not a nested user object), and the logged-in
      // user may have an email or name depending on auth flow.
      const currentUserName = user?.name || user?.email;
      const userBookings = currentUserName
        ? allBookings.filter(b => b.userName === currentUserName)
        : [];
      return userBookings;
    },
    initialData: [],
  });

  const { data: locations } = useQuery({
    queryKey: ['parkingLocations'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/locations`, {
        credentials: 'include',
      });
      return res.ok ? res.json() : [];
    },
    initialData: [],
  });

  const fetchSlotsByLocation = async (locationId: number) => {
    const res = await fetch(`${BASE_URL}/locations/${locationId}/slots`, {
      credentials: 'include',
    });
    return res.ok ? res.json() : [];
  };

const [slotsMap, setSlotsMap] = React.useState<Record<number, any[]>>({});
React.useEffect(() => {
  if (!locations.length) return;

  locations.forEach(async (loc) => {
    const slots = await fetchSlotsByLocation(loc.id);
    setSlotsMap(prev => ({
      ...prev,
      [loc.id]: slots
    }));
  });
}, [locations]);

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      const booking = bookings.find(b => b.id === bookingId);
      
      // Update booking status
      const cancelBookingMutation = useMutation({
  mutationFn: async (bookingId) => {

    const res = await fetch(
      `${BASE_URL}/bookings/${bookingId}/cancel`,
      {
        method: 'PUT',
        credentials: 'include',
      }
    );

    if (!res.ok) {
      const message = await res.text();
      throw new Error(message || 'Failed to cancel booking');
    }

    return await res.json();
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['userBookings']
    });

    queryClient.invalidateQueries({
      queryKey: ['parkingLocations']
    });

    toast.success('Booking cancelled successfully');
  },

  onError: (error) => {
    console.error('Cancel booking error:', error);
    toast.error(error.message || 'Failed to cancel booking');
  },
});

      // Update slot status back to available
      if (booking?.slotId) {
        await fetch(`${BASE_URL}/slots/${booking.slotId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'AVAILABLE' })
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['locationSlots'] });
      toast.success('Booking cancelled successfully');
    },
  });

  const activeBookings = bookings.filter(b => 
    b.status === 'CONFIRMED' || b.status === 'ACTIVE'
  );

  const pastBookings = bookings.filter(b => 
    b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  const totalSpent = bookings
    // Treat completed bookings as paid, since paymentStatus is not set by default.
    .filter(b => b.status === 'COMPLETED' && b.amount)
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const BookingCard = ({ booking, isPast = false }) => {
    const statusColors = {
      confirmed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {booking.locationName}
              </h3>
              <Badge className={statusColors[booking.status?.toLowerCase()] || ''}>
                {booking.status?.toLowerCase() || ''}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                ₹{booking.amount}
              </div>
              <div className="text-xs text-gray-500">
                {booking.durationHours}h parking
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500 text-xs">Slot</div>
                <div className="font-medium">{booking.slotNumber}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Car className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500 text-xs">Vehicle</div>
                <div className="font-medium">{booking.vehicleNumber}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500 text-xs">Date</div>
                <div className="font-medium">
                  {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-gray-500 text-xs">Time</div>
                <div className="font-medium">
                  {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isPast && (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate(`/booking-confirmation?id=${booking.id}`)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this booking?')) {
                      cancelBookingMutation.mutate(booking.id);
                    }
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            )}
            {isPast && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/booking-confirmation?bookingId=${booking.id}`)}
                className="w-full"
              >
                View Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">Manage your parking bookings and history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Bookings</p>
                  <p className="text-3xl font-bold text-indigo-600">{activeBookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <History className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">₹{totalSpent.toFixed(0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/search')}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Parking
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/search')}
                className="w-full"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book in Advance
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="map">
              <MapIcon className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="active">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Active ({activeBookings.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Find Nearby Parking</h3>
                    <p className="text-gray-600 mt-1">Real-time availability on interactive map</p>
                  </div>
                  <Button onClick={() => navigate('/search')}>
                    View All Locations
                  </Button>
                </div>
                <RealTimeMap
                   locations={locations}
                   slotsMap={slotsMap}
                  />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
              </div>
            ) : activeBookings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {activeBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Active Bookings
                  </h3>
                  <p className="text-gray-600 mb-6">
                    You don't have any active parking bookings at the moment
                  </p>
                  <Button onClick={() => navigate('/search')}>
                    Find Parking Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {pastBookings.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {pastBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} isPast />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <History className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Booking History
                  </h3>
                  <p className="text-gray-600">
                    Your past bookings will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}