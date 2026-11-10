import React from 'react';
import { FilterOptions, VehicleCategory } from '../types/carpark';
import { Search, X, SlidersHorizontal, Map, List, LayoutGrid } from 'lucide-react';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  viewMode: 'split' | 'map' | 'list';
  onChangeViewMode: (mode: 'split' | 'map' | 'list') => void;
  resultCount: number;
}

const AREAS = [
  'All Areas',
  'Central / CBD',
  'Orchard',
  'Marina Bay',
  'East (Tampines/Bedok)',
  'West (Jurong/Clementi)',
  'North (Woodlands/Yishun)',
  'North-East (Punggol/Sengkang)',
  'Central North (Bishan/AMK)',
];

const AGENCIES = ['All Agencies', 'HDB', 'URA', 'LTA / Commercial'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  viewMode,
  onChangeViewMode,
  resultCount,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.area !== 'All Areas' ||
    filters.agency !== 'All Agencies' ||
    filters.availabilityFilter !== 'all' ||
    filters.hasEvChargingOnly ||
    filters.freeParkingOnly ||
    filters.highClearanceOnly;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Main Row: Search, Vehicle Type, View Modes */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by Carpark Code (e.g. TR24, MBS01), Mall, or Address..."
              className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Vehicle Type Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => onFilterChange({ ...filters, vehicleType: 'car' as VehicleCategory })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filters.vehicleType === 'car'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Cars
            </button>
            <button
              onClick={() =>
                onFilterChange({ ...filters, vehicleType: 'motorcycle' as VehicleCategory })
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filters.vehicleType === 'motorcycle'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Motorcycles
            </button>
            <button
              onClick={() =>
                onFilterChange({ ...filters, vehicleType: 'heavyVehicle' as VehicleCategory })
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                filters.vehicleType === 'heavyVehicle'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Heavy
            </button>
          </div>

          {/* View Mode Toggle & Filter Expansion */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showAdvanced || hasActiveFilters
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>

            {/* Layout Mode Buttons */}
            <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => onChangeViewMode('split')}
                title="Split Map & List"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-label="Split layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onChangeViewMode('map')}
                title="Full Map"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-label="Map only"
              >
                <Map className="w-4 h-4" />
              </button>
              <button
                onClick={() => onChangeViewMode('list')}
                title="Directory List"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                aria-label="List only"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Dropdown Row (Always accessible or expanded) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Area Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Area:</span>
            <select
              value={filters.area}
              onChange={(e) => onFilterChange({ ...filters, area: e.target.value })}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Agency Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Agency:</span>
            <select
              value={filters.agency}
              onChange={(e) => onFilterChange({ ...filters, agency: e.target.value })}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {AGENCIES.map((ag) => (
                <option key={ag} value={ag}>
                  {ag}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Segmented Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Availability:</span>
            <select
              value={filters.availabilityFilter}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  availabilityFilter: e.target.value as FilterOptions['availabilityFilter'],
                })
              }
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Vacancies</option>
              <option value="availableOnly">Has Available Lots (&gt;0)</option>
              <option value="high">High Availability (&gt;50 lots)</option>
              <option value="limited">Limited Lots (&lt;30)</option>
            </select>
          </div>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 ml-auto tabular-nums">
            Showing <strong className="text-slate-900 dark:text-slate-100">{resultCount}</strong> carparks
          </div>
        </div>

        {/* Advanced Filters Panel (Collapsible) */}
        {showAdvanced && (
          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filters.hasEvChargingOnly}
                onChange={(e) =>
                  onFilterChange({ ...filters, hasEvChargingOnly: e.target.checked })
                }
                className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>EV Charging Station Available</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filters.freeParkingOnly}
                onChange={(e) => onFilterChange({ ...filters, freeParkingOnly: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Free Parking Scheme Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={filters.highClearanceOnly}
                onChange={(e) =>
                  onFilterChange({ ...filters, highClearanceOnly: e.target.checked })
                }
                className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>High Vehicle Clearance (&ge; 2.1m)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
