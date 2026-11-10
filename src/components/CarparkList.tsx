import React, { useState } from 'react';
import { Carpark, VehicleCategory } from '../types/carpark';
import { CarparkCard } from './CarparkCard';
import { ArrowUpDown, AlertCircle } from 'lucide-react';

interface CarparkListProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  bookmarkedIds: string[];
  vehicleType: VehicleCategory;
  onSelectCarpark: (carpark: Carpark) => void;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onResetFilters: () => void;
}

type SortField = 'available' | 'name' | 'rate' | 'occupancy';

export const CarparkList: React.FC<CarparkListProps> = ({
  carparks,
  selectedCarpark,
  bookmarkedIds,
  vehicleType,
  onSelectCarpark,
  onToggleBookmark,
  onOpenDetails,
  onResetFilters,
}) => {
  const [sortBy, setSortBy] = useState<SortField>('available');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Sort carparks
  const sortedCarparks = [...carparks].sort((a, b) => {
    const aLot = (a.lots[vehicleType] || a.lots.car).available;
    const bLot = (b.lots[vehicleType] || b.lots.car).available;

    if (sortBy === 'available') {
      return sortOrder === 'desc' ? bLot - aLot : aLot - bLot;
    }
    if (sortBy === 'name') {
      return sortOrder === 'desc'
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    }
    if (sortBy === 'rate') {
      return sortOrder === 'desc'
        ? b.rates.ratePerHalfHour - a.rates.ratePerHalfHour
        : a.rates.ratePerHalfHour - b.rates.ratePerHalfHour;
    }
    if (sortBy === 'occupancy') {
      const aTotal = (a.lots[vehicleType] || a.lots.car).total;
      const bTotal = (b.lots[vehicleType] || b.lots.car).total;
      const aOcc = aTotal > 0 ? (aTotal - aLot) / aTotal : 0;
      const bOcc = bTotal > 0 ? (bTotal - bLot) / bTotal : 0;
      return sortOrder === 'desc' ? bOcc - aOcc : aOcc - bOcc;
    }
    return 0;
  });

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' ? 'asc' : 'desc');
    }
  };

  if (carparks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl m-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          No carparks match your filters
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Try expanding your search query, selecting another Singapore region, or resetting filter constraints.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-4 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* List Header: Sorting Bar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-1.5 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort By:</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSort('available')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              sortBy === 'available'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Vacancy {sortBy === 'available' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('rate')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              sortBy === 'rate'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Rate {sortBy === 'rate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => toggleSort('occupancy')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              sortBy === 'occupancy'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Occupancy {sortBy === 'occupancy' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('name')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer ${
              sortBy === 'name'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? 'A-Z' : 'Z-A')}
          </button>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sortedCarparks.map((carpark) => (
          <CarparkCard
            key={carpark.id}
            carpark={carpark}
            isSelected={selectedCarpark?.id === carpark.id}
            isBookmarked={bookmarkedIds.includes(carpark.id)}
            vehicleType={vehicleType}
            onSelect={onSelectCarpark}
            onToggleBookmark={onToggleBookmark}
            onOpenDetails={onOpenDetails}
          />
        ))}
      </div>
    </div>
  );
};
