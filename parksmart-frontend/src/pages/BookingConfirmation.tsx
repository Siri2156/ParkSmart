import React, { useEffect, useRef } from 'react';
import BASE_URL from "@/api/apiConfig";
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Calendar, Clock, MapPin, Car, CreditCard, Download, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const bookingId = urlParams.get('bookingId');
  const hasAskedNavigation = useRef(false);
const bookingRef = useRef(null);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const res = await fetch(`${BASE_URL}/bookings/${bookingId}`);
      return res.ok ? await res.json() : null;
    },
    enabled: !!bookingId,
  });

  useEffect(() => {

    if (!booking) return;

    if (hasAskedNavigation.current) return;

    hasAskedNavigation.current = true;

    bookingRef.current = booking;

    window.dispatchEvent(
        new CustomEvent("booking-confirmed", {
            detail: booking
        })
    );

}, [booking]);

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 text-center">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600 text-center">
            Your parking spot is reserved and ready
          </p>
        </motion.div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6 overflow-hidden border-2 border-indigo-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">Booking ID</div>
                  <div className="text-2xl font-bold">{booking.qrCode}</div>
                </div>
                <Badge className="bg-green-500 text-white px-4 py-2">
                  {booking.status}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              {/* QR Code Placeholder */}
              <div className="bg-white border-4 border-gray-200 rounded-xl p-8 mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <div className="grid grid-cols-8 grid-rows-8 gap-1 w-40 h-40">
                      {Array(64).fill(0).map((_, i) => (
                        <div 
                          key={i} 
                          className={`${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'} rounded-sm`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Show this QR code at the parking entrance
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="font-semibold text-gray-900">{booking.locationName}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Slot Number</div>
                      <div className="font-semibold text-gray-900">{booking.slotNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Vehicle</div>
                      <div className="font-semibold text-gray-900">{booking.vehicleNumber}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Date</div>
                      <div className="font-semibold text-gray-900">
                        {booking.bookingDate ? format(new Date(booking.bookingDate), 'MMMM dd, yyyy') : '-'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Time Slot</div>
                      <div className="font-semibold text-gray-900">
                        {format(new Date(booking.startTime), 'hh:mm a')} -{" "}
                        {format(new Date(booking.endTime), 'hh:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-500">Amount Paid</div>
                      <div className="font-semibold text-gray-900">₹{booking.amount}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Payment Successful</span>
                </div>
                <div className="text-sm text-green-700">
                  Transaction ID: {booking.paymentId}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="w-full"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
          <Button
            size="lg"
            onClick={() => navigate('/user-dashboard')}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Important Instructions</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">1.</span>
                <span>Arrive at the parking location 5 minutes before your booking time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">2.</span>
                <span>Show the QR code at the entrance for quick access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">3.</span>
                <span>Park your vehicle in the assigned slot {booking.slotNumber}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">4.</span>
                <span>For any assistance, contact our support team</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}