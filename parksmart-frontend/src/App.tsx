import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";

import Landing from "./pages/Landing/Landing";

import AdminDashboard from "./pages/AdminDashboard";
import ManageLocations from "./pages/ManageLocations";
import ManageBookings from "./pages/ManageBookings";
import ManageUsers from "./pages/ManageUsers";

import UserDashboard from "./pages/UserDashboard";
import Search from "./pages/Search";
import BookingConfirmation from "./pages/BookingConfirmation";
import LocationDetails from "./pages/LocationDetails";
import Login from "./pages/Login";
import HomeRedirect from "./routes/HomeRedirect";

import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />

        {/* Shared layout */}
        <Route element={<Layout />}>

          {/* USER ROUTES */}
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="search" element={<Search />} />
          <Route path="booking-confirmation" element={<BookingConfirmation />} />
          <Route path="location/:id" element={<LocationDetails />} />

          {/* ADMIN ROUTES (PROTECTED) */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="admin/locations"
            element={
              <AdminRoute>
                <ManageLocations />
              </AdminRoute>
            }
          />
          <Route
            path="admin/bookings"
            element={
              <AdminRoute>
                <ManageBookings />
              </AdminRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
