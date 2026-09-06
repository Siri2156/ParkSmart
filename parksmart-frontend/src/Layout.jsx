import React, { useState, useEffect } from "react";
import VoiceAssistant from "@/components/assistant/VoiceAssistant";
import { BASE_URL } from '@/api/apiConfig';
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Car, 
  LayoutDashboard, 
  MapPin, 
  History, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Users,
  ParkingCircle,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [slotsMap, setSlotsMap] = useState({});

const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
  fetch(`${BASE_URL}/auth/me`, {
    credentials: "include",
  })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      setUser(data);
      setLoading(false);
    })
    .catch(() => {
      setUser(null);
      setLoading(false);
    });
}, []);

useEffect(() => {

    if (!user || isAdmin) return;

    loadAssistantData();

}, [user]);

const loadAssistantData = async () => {

    try {

        // Locations
        const locRes = await fetch(`${BASE_URL}/locations`, {
            credentials: "include"
        });

        const locs = locRes.ok ? await locRes.json() : [];

        setLocations(locs);

        // User bookings
        const bookingRes = await fetch(`${BASE_URL}/bookings`, {
            credentials: "include"
        });

        const allBookings =
            bookingRes.ok ? await bookingRes.json() : [];

        const userBookings =
            allBookings.filter(
                b => b.userName === (user.name || user.email)
            );

        setBookings(userBookings);

        // Slots
        const map = {};

        for (const loc of locs) {

            const slotRes = await fetch(
                `${BASE_URL}/locations/${loc.id}/slots`,
                {
                    credentials: "include"
                }
            );

            map[loc.id] =
                slotRes.ok ? await slotRes.json() : [];
        }

        setSlotsMap(map);

    } catch (err) {

        console.error(err);

    }

};

const handleLogout = async () => {
  try {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    navigate("/");
  }
};


  const userNavItems = [
    { title: "My Dashboard", url: "/user-dashboard", icon: LayoutDashboard },
    { title: "Find Parking", url: "/search", icon: MapPin },
  ];

  const adminNavItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Locations", url: "/admin/locations", icon: ParkingCircle },
    { title: "Bookings", url: "/admin/bookings", icon: History },
    { title: "Users", url: "/admin/users", icon: Users },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={isAdmin ? "/admin" : "/user-dashboard"} className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ParkSmart
              </span>
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <>
                  {isAdmin && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-700">Admin</span>
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="hidden md:block text-sm font-medium text-gray-700">
                          {user.name || user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name || user.email || 'User'}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              
              {/* Mobile Menu Button */}
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

{user?.role === "USER" && (
    <VoiceAssistant
        user={user}
        bookings={bookings}
        locations={locations}
        slots={slotsMap}
    />
)}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-indigo-600" />
              <span className="text-sm text-gray-600">
                © 2024 ParkSmart. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
        
      </footer>
    </div>
  );
}