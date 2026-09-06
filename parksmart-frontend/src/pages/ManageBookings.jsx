import React, { useState } from 'react';
import BASE_URL from '@/api/apiConfig';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, MapPin, Car, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ManageBookings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/admin/bookings`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return await res.json();
    },
    initialData: [],
    retry: false,
  });

  const updateBookingMutation = useMutation({
  mutationFn: async ({ id, status }) => {

    let endpoint = "";

    if (status === "CANCELLED") {
      endpoint = `${BASE_URL}/admin/bookings/${id}/cancel`;
    }

    if (status === "COMPLETED") {
      endpoint = `${BASE_URL}/admin/bookings/${id}/complete`;
    }

    if (status === "ACTIVE") {
      endpoint = `${BASE_URL}/admin/bookings/${id}/activate`;
    }

    const res = await fetch(endpoint, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Failed to update booking");

    return res.json();
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
    toast.success("Booking updated successfully");
  },
});

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.locationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicleNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.slotNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // normalize status to lowercase so it matches the filter values
    const status = booking.status?.toLowerCase();
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const paymentColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  };

  const exportToCSV = () => {
    const headers = ['Booking ID', 'User', 'Location', 'Slot', 'Vehicle', 'Date', 'Time', 'Duration', 'Amount', 'Status', 'Payment'];
    const rows = filteredBookings.map(b => [
      b.qrCode,
      b.userName,
      b.locationName,
      b.slotNumber,
      b.vehicleNumber,
      b.bookingDate ? format(new Date(b.bookingDate), 'yyyy-MM-dd') : '-',
      `${b.startTime} - ${b.endTime}`,
      `${b.durationHours}h`,
      b.amount,
      b.status,
      b.paymentId
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Bookings exported successfully');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Bookings
            </h1>
            <p className="text-gray-600">
              {bookings.length} total bookings
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: bookings.length, color: 'from-indigo-500 to-purple-600' },
            { label: 'Active', value: bookings.filter(b => {
                const s = b.status?.toLowerCase();
                return s === 'active' || s === 'confirmed';
              }).length, color: 'from-green-500 to-emerald-600' },
            { label: 'Completed', value: bookings.filter(b => b.status?.toLowerCase() === 'completed').length, color: 'from-blue-500 to-cyan-600' },
            { label: 'Cancelled', value: bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length, color: 'from-red-500 to-pink-600' }
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by user, location, vehicle, or slot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Location & Slot</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs">
                          {booking.qrCode?.slice(-12)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {booking.userName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm">{booking.locationName}</div>
                              <div className="text-xs text-gray-500">Slot {booking.slotNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-sm">{booking.vehicleNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <div className="text-sm">{booking.bookingDate ? format(new Date(booking.bookingDate), 'MMM dd, yyyy') : '-'}</div>
                              <div className="text-xs text-gray-500">{booking.startTime} - {booking.endTime}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">₹{booking.amount}</div>
                          <div className="text-xs text-gray-500">{booking.durationHours}h</div>
                        </TableCell>
                        <TableCell>
                          {
                            // ensure we use lowercase key for color lookup and display a capitalized status
                          }
                          <Badge className={statusColors[booking.status?.toLowerCase()]}> 
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentColors[booking.paymentId]}>
                            {booking.paymentId}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={booking.status?.toLowerCase()}
                            onValueChange={(value) => {
                              updateBookingMutation.mutate({
                                id: booking.id,
                                status: value.toUpperCase() 
                              });
                            }}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Bookings Found
                </h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Bookings will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}