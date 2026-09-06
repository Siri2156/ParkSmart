import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Shield, Zap, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LocationCard({ location, availableSlots, onClick }) {
  const facilities = location.facilities || [];
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full" onClick={onClick}>
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
          {location.image_url ? (
            <img 
              src={location.image_url} 
              alt={location.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-16 h-16 text-indigo-300" />
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className={availableSlots > 0 ? '!bg-green-500 !text-white !border-transparent' : '!bg-red-500 !text-white !border-transparent'}>
                            {availableSlots} / {location.total_slots} Available
                          </Badge>
          </div>
        </div>
        
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {location.name}
          </h3>
          
          <div className="flex items-start gap-2 text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
            <span className="text-sm line-clamp-2">{location.address}</span>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1 text-indigo-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              ₹{location.hourly_rate}/hr
            </div>
            <div className="text-gray-500">
              {location.total_slots} slots
            </div>
          </div>

          {facilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {facilities.slice(0, 3).map((facility, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {facility}
                </Badge>
              ))}
              {facilities.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{facilities.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 group">
            View Details
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}