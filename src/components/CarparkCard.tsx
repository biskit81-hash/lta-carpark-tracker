import React from 'react';
import { Carpark, VehicleCategory } from '../types/carpark';
import { getAvailabilityStatus, getOccupancyPercentage } from '../services/carparkService';
import { Star, Navigation, Zap, Clock, ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isBookmarked: boolean;
  vehicleType: VehicleCategory;
  onSelect: (carpark: Carpark) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onOpenDetails: (carpark: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isBookmarked,
  vehicleType,
  onSelect,
  onToggleBookmark,
  onOpenDetails,
}) => {
  const lotInfo = carpark.lots[vehicleType] || carpark.lots.car;
  const statusInfo = getAvailabilityStatus(carpark, vehicleType);
  const occupancy = getOccupancyPercentage(carpark, vehicleType);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;

  return (
    <div
      onClick={() => onSelect(carpark)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
    >
      {/* Top Header Row: Agency / Carpark Code & Bookmark Action */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {carpark.agency}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{carpark.carparkNo}</span>
          <span aria-hidden="true">·</span>
          <span>{carpark.type}</span>
        </div>

        <button
          onClick={(e) => onToggleBookmark(carpark.id, e)}
          className={`p-1 rounded transition-colors cursor-pointer ${
            isBookmarked
              ? 'text-amber-500 hover:text-amber-600'
              : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark carpark'}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark carpark'}
        >
          <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Carpark Name & Address */}
      <div className="mt-1.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
          {carpark.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
          {carpark.address} · S({carpark.postalCode})
        </p>
      </div>

      {/* Lot Status Grid */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between gap-3">
        {/* Left: Available lot number */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-extrabold font-mono tabular-nums leading-none ${
                statusInfo.status === 'full'
                  ? 'text-rose-600 dark:text-rose-400'
                  : statusInfo.status === 'limited'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {lotInfo.available}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
              / {lotInfo.total} lots
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
            <span className={statusInfo.colorClass}>{statusInfo.label}</span>
            <span aria-hidden="true">·</span>
            {carpark.trend === 'increasing' ? (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                <TrendingUp className="w-3 h-3" />
                <span>+{carpark.recentChange} lots</span>
              </span>
            ) : carpark.trend === 'decreasing' ? (
              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                <TrendingDown className="w-3 h-3" />
                <span>{carpark.recentChange} lots</span>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">Stable</span>
            )}
          </div>
        </div>

        {/* Right: Quick feature indicators */}
        <div className="flex flex-col items-end gap-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            {carpark.hasEvCharging && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title="EV charging available">
                <Zap className="w-3.5 h-3.5" />
                <span>EV</span>
              </span>
            )}
            {carpark.freeParkingScheme !== 'None' && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Free Sun/PH
              </span>
            )}
          </div>
          <span className="text-slate-400 dark:text-slate-500 tabular-nums">
            Clearance: {carpark.gantryHeight}m
          </span>
        </div>
      </div>

      {/* Capacity progress bar */}
      <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            occupancy > 90
              ? 'bg-rose-500'
              : occupancy > 75
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${occupancy}%` }}
        />
      </div>

      {/* Card Actions Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(carpark);
          }}
          className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Rates & Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-1 cursor-pointer transition-colors"
          title="Open directions in Google Maps"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </a>
      </div>
    </div>
  );
};
