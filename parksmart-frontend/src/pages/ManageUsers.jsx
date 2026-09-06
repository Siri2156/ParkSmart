import React, { useState } from 'react';
import { BASE_URL } from '@/api/apiConfig';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Users as UsersIcon, Shield, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/admin/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    initialData: [],
  });

  const { data: bookings } = useQuery({
    queryKey: ['userBookingCounts'],
    queryFn: async () => {
      // fetch all admin bookings and compute per-user counts locally
      const res = await fetch(`${BASE_URL}/admin/bookings`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    initialData: [],
  });

  const getUserBookingCount = (userEmail) => {
    // Bookings expose `userName`. Match by the user's `name` first,
    // then fallback to matching by email or email-like username.
    const user = users.find(u => u.email === userEmail) || {};
    const name = user.name;
    return bookings.filter(b => (name && b.userName === name) || b.userName === userEmail).length;
  };

  const getUserTotalSpent = (userEmail) => {
    const user = users.find(u => u.email === userEmail) || {};
    const name = user.name;
    // BookingResponse doesn't include paymentStatus in the DTO; treat bookings
    // with a truthy `paymentId` or numeric `amount` as paid for the total.
    return bookings
      .filter(b => (name && b.userName === name) || b.userName === userEmail)
      .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const userCount = users.filter(u => u.role === 'USER').length;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Users
          </h1>
          <p className="text-gray-600">
            {users.length} total users
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Regular Users</p>
                  <p className="text-3xl font-bold text-gray-900">{userCount}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Administrators</p>
                  <p className="text-3xl font-bold text-gray-900">{adminCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name || 'User'}</div>
                              <div className="text-xs text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                            {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{getUserBookingCount(user.email)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            ₹{getUserTotalSpent(user.email).toFixed(0)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {(() => {
                              // prefer lastLogin as "Joined" per admin meaning; fall back to createdAt
                              const val = user.lastLogin || user.last_login || user.lastLoginAt || user.createdAt || user.created_at || user.createdDate;
                              if (!val) return '-';
                              let d;
                              // If backend serialized LocalDateTime as an object {year, monthValue, dayOfMonth, hour, minute, second}
                              if (typeof val === 'object' && (val.year || val.monthValue || val.dayOfMonth)) {
                                const y = Number(val.year);
                                const m = Number(val.monthValue || val.month);
                                const dd = Number(val.dayOfMonth || val.day);
                                const hh = Number(val.hour || val.hourOfDay || 0) || 0;
                                const mm = Number(val.minute || 0) || 0;
                                const ss = Number(val.second || 0) || 0;
                                if (!isNaN(y) && !isNaN(m) && !isNaN(dd)) {
                                  d = new Date(y, (m || 1) - 1, dd, hh, mm, ss);
                                }
                              } else {
                                // handle numeric timestamps (seconds or ms) and ISO strings
                                const n = Number(val);
                                if (!isNaN(n)) {
                                  d = String(val).length === 10 ? new Date(n * 1000) : new Date(n);
                                } else {
                                  d = new Date(val);
                                }
                              }
                              return d && !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : '-';
                            })()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UsersIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Users Found
                </h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search' : 'Users will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}