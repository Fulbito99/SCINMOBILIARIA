import React from 'react';
import { Property } from '../types';
import { Bed, Bath, Move, MapPin } from 'lucide-react';

import { PROPERTY_TYPES_MAP } from '../utils/translations';

interface PropertyCardProps {
  property: Property;
  onClick: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 dark:border-slate-700"
      onClick={() => onClick(property)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            {PROPERTY_TYPES_MAP[property.type] || property.type}
          </div>
          <div className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg ${property.listing_type === 'rent' ? 'bg-orange-500' : 'bg-emerald-500'}`}>
            {property.listing_type === 'rent' ? 'Alquiler' : 'Venta'}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-white text-2xl font-bold flex items-center gap-1 text-shadow">
            {property.currency === 'EUR' && '€'}
            {property.currency === 'USD' && 'U$S'}
            {property.currency === 'ARS' && '$'}
            {(!['EUR', 'USD', 'ARS'].includes(property.currency)) && '$'}
            <span>{property.price.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 truncate">{property.title}</h3>
        <div className="flex items-center text-slate-500 dark:text-slate-400 mb-4 text-sm">
          <MapPin size={16} className="mr-1 text-red-500" />
          {property.location}
        </div>

        <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 border-t border-gray-100 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-1">
            <Bed size={18} className="text-red-500 dark:text-red-400" />
            <span className="text-sm font-medium">{property.beds} <span className="hidden sm:inline">Hab</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={18} className="text-red-500 dark:text-red-400" />
            <span className="text-sm font-medium">{property.baths} <span className="hidden sm:inline">Baños</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Move size={18} className="text-red-500 dark:text-red-400" />
            <span className="text-sm font-medium">{property.sqft} <span className="hidden sm:inline">m²</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};