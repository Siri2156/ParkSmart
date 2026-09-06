import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "@/api/apiConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  DollarSign,
  Calendar,
  MapPin,
  ParkingCircle,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

/* ---------------- TYPES (minimal, UI-safe) ---------------- */
// booking objects returned from /admin/bookings use camelCase
// as defined by BookingResponse on the backend.
type Booking = {
  id: string;
  status: string;           // CONFIRMED, ACTIVE, COMPLETED, CANCELLED
  paymentId?: string;       // not always present
  amount: number;
  bookingDate?: string;     // ISO datetime (startTime)
  startTime?: string;
  locationId?: string;
  locationName?: string;
  userName?: string;
  email?: string;
  slotNumber?: string | number;
  created_date?: string;
  // other fields omitted, not used by dashboard
};

type Slot = {
  status: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  /* ---------------- FETCH DATA ---------------- */
useEffect(() => {
  fetch(`${BASE_URL}/admin/bookings`, {
    credentials: "include",
  })
    .then(r => (r.ok ? r.json() : []))
    .then(setBookings)
    .catch(() => setBookings([]));

  fetch(`${BASE_URL}/admin/locations`, {
    credentials: "include",
  })
    .then(r => (r.ok ? r.json() : []))
    .then(setLocations)
    .catch(() => setLocations([]));

  fetch(`${BASE_URL}/slots`, {
    credentials: "include",
  })
    .then(r => (r.ok ? r.json() : []))
    .then(setSlots)
    .catch(() => setSlots([]));
}, []);

  /* ---------------- STATS ---------------- */
  // revenue calculated from all non-cancelled bookings
  const totalRevenue = bookings
    .filter(b => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const monthlyRevenue = bookings
    .filter(b => {
      if (!b.bookingDate) return false;
      const d = new Date(b.bookingDate);
      const now = new Date();
      return d >= startOfMonth(now) && d <= endOfMonth(now);
    })
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  const activeBookings = bookings.filter(
    b => {
      const s = b.status?.toUpperCase();
      return s === "CONFIRMED" || s === "ACTIVE";
    }
  ).length;

  const occupancyRate = slots.length
    ? (
        (slots.filter(s => s.status !== "AVAILABLE").length /
          slots.length) *
        100
      ).toFixed(1)
    : "0";

  /* ---------------- CHART DATA ---------------- */
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayBookings = bookings.filter(b => {
      if (!b.bookingDate) return false;
      const bookingDate = new Date(b.bookingDate);
      if (isNaN(bookingDate.getTime())) return false;
      return (
        format(bookingDate, "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
      );
    });

    return {
      name: format(date, "EEE"),
      revenue: dayBookings.reduce((s, b) => s + (b.amount || 0), 0),
      bookings: dayBookings.length,
    };
  });

  const statusData = [
    {
      name: "CONFIRMED",
      value: bookings.filter(b => b.status?.toUpperCase() === "CONFIRMED").length,
      color: "#10b981",
    },
    {
      name: "ACTIVE",
      value: bookings.filter(b => b.status?.toUpperCase() === "ACTIVE").length,
      color: "#3b82f6",
    },
    {
      name: "COMPLETED",
      value: bookings.filter(b => b.status?.toUpperCase() === "COMPLETED").length,
      color: "#6b7280",
    },
    {
      name: "CANCELLED",
      value: bookings.filter(b => b.status?.toUpperCase() === "CANCELLED").length,
      color: "#ef4444",
    },
  ];
  const topLocations = locations
    .map(loc => ({
      name: loc.name || "Unknown",
      revenue: bookings
        .filter(b => {
          if (b.status === "CANCELLED") return false;
          // booking may include a numeric/string locationId or only locationName
          if (b.locationId != null) return String(b.locationId) === String(loc.id);
          return (b.locationName || '').toString() === (loc.name || '').toString();
        })
        .reduce((sum, b) => sum + (b.amount || 0), 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const createPageUrl = (pageName: string): string => {
    return `/${pageName.replace(/([A-Z])/g, '-$1').toLowerCase().substring(1)}`;
  };

  const stats: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    change: string;
    color: string;
  }[] = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toFixed(0)}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Active Bookings',
      value: activeBookings,
      change: '+8.2%',
      icon: Calendar,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Total Locations',
      value: locations.length,
      change: '+2 new',
      icon: MapPin,
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      change: '+5.1%',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600'
    }
  ];

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">Monitor and manage your parking system</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/locations')}>
              <ParkingCircle className="w-4 h-4 mr-2" />
              Manage Locations
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => `₹${value}`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="Revenue (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#8b5cf6" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{location.name}</span>
                    </div>
                    <span className="font-semibold text-indigo-600">₹{location.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings
                .slice()
                .sort((a, b) => {
                  const aRaw = a.bookingDate ?? a.startTime ?? a.created_date ?? '';
                  const bRaw = b.bookingDate ?? b.startTime ?? b.created_date ?? '';
                  const aDt = aRaw ? new Date(aRaw).getTime() : 0;
                  const bDt = bRaw ? new Date(bRaw).getTime() : 0;
                  return bDt - aDt;
                })
                .slice(0, 5)
                .map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{booking.locationName}</div>
                            <div className="text-sm text-gray-500">
                              {booking.userName && booking.userName !== 'Anonymous' ? booking.userName : (booking.email || 'Anonymous')} • Slot {booking.slotNumber}
                            </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">₹{booking.amount}</div>
                    <div className="text-xs text-gray-500">
                        {(() => {
                          const raw = booking.bookingDate ?? booking.startTime ?? booking.created_date ?? null;
                          const dt = raw ? new Date(raw) : null;
                          if (dt && !isNaN(dt.getTime())) {
                            return format(dt, 'MMM dd, HH:mm');
                          }
                          return 'N/A';
                        })()}
                      </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}