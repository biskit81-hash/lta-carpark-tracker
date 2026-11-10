/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Carpark, FilterOptions, VehicleCategory } from './types/carpark';
import { INITIAL_CARPARKS } from './data/singaporeCarparks';
import {
  fetchLiveCarparkAvailability,
  getInitialBookmarks,
  saveBookmarks,
} from './services/carparkService';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { CarparkList } from './components/CarparkList';
import { CarparkCard } from './components/CarparkCard';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { RatesGuideModal } from './components/RatesGuideModal';
import { Bookmark, Sparkles, RefreshCw } from 'lucide-react';

const DEFAULT_FILTERS: FilterOptions = {
  searchQuery: '',
  area: 'All Areas',
  agency: 'All Agencies',
  vehicleType: 'car',
  availabilityFilter: 'all',
  minLots: 0,
  hasEvChargingOnly: false,
  freeParkingOnly: false,
  highClearanceOnly: false,
};

export default function App() {
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailModalCarpark, setDetailModalCarpark] = useState<Carpark | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(getInitialBookmarks);
  const [currentTab, setCurrentTab] = useState<'map' | 'directory' | 'saved' | 'rates'>('map');
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [isRatesModalOpen, setIsRatesModalOpen] = useState<boolean>(false);

  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('sg_parkpulse_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sg_parkpulse_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sg_parkpulse_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Real-time lot refresh handler
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await fetchLiveCarparkAvailability();
      setCarparks(updated);

      // Keep selected carpark updated with latest figures
      if (selectedCarpark) {
        const found = updated.find((c) => c.id === selectedCarpark.id);
        if (found) setSelectedCarpark(found);
      }
      if (detailModalCarpark) {
        const foundModal = updated.find((c) => c.id === detailModalCarpark.id);
        if (foundModal) setDetailModalCarpark(foundModal);
      }

      const now = new Date();
      setLastUpdatedTime(
        now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, [selectedCarpark, detailModalCarpark]);

  // Periodic simulated live stream every 25 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleRefreshData();
    }, 25000);
    return () => clearInterval(timer);
  }, [handleRefreshData]);

  // Bookmarking handler
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      saveBookmarks(next);
      return next;
    });
  };

  // Filter Logic
  const filteredCarparks = useMemo(() => {
    return carparks.filter((cp) => {
      const lotInfo = cp.lots[filters.vehicleType] || cp.lots.car;

      // Search Query (matches name, carpark code, address, postal code)
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        const matchName = cp.name.toLowerCase().includes(q);
        const matchNo = cp.carparkNo.toLowerCase().includes(q);
        const matchAddr = cp.address.toLowerCase().includes(q);
        const matchPostal = cp.postalCode.includes(q);
        if (!matchName && !matchNo && !matchAddr && !matchPostal) {
          return false;
        }
      }

      // Area Filter
      if (filters.area !== 'All Areas' && cp.area !== filters.area) {
        return false;
      }

      // Agency Filter
      if (filters.agency !== 'All Agencies' && cp.agency !== filters.agency) {
        return false;
      }

      // Availability Filter
      if (filters.availabilityFilter === 'availableOnly' && lotInfo.available <= 0) {
        return false;
      }
      if (filters.availabilityFilter === 'high' && lotInfo.available < 50) {
        return false;
      }
      if (filters.availabilityFilter === 'limited' && (lotInfo.available > 30 || lotInfo.available === 0)) {
        return false;
      }

      // EV Charging
      if (filters.hasEvChargingOnly && !cp.hasEvCharging) {
        return false;
      }

      // Free Parking
      if (filters.freeParkingOnly && cp.freeParkingScheme === 'None') {
        return false;
      }

      // High Clearance
      if (filters.highClearanceOnly && cp.gantryHeight < 2.1) {
        return false;
      }

      return true;
    });
  }, [carparks, filters]);

  // Bookmarked Carparks
  const bookmarkedCarparks = useMemo(() => {
    return carparks.filter((cp) => bookmarkedIds.includes(cp.id));
  }, [carparks, bookmarkedIds]);

  const handleSelectTab = (tab: 'map' | 'directory' | 'saved' | 'rates') => {
    if (tab === 'rates') {
      setIsRatesModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        savedCount={bookmarkedIds.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshData}
        lastUpdatedTime={lastUpdatedTime}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Metrics Overview Strip */}
      <MetricsOverview
        carparks={carparks}
        vehicleType={filters.vehicleType}
        onFilterFreeParking={() =>
          setFilters((prev) => ({ ...prev, freeParkingOnly: !prev.freeParkingOnly }))
        }
        onFilterEvCharging={() =>
          setFilters((prev) => ({ ...prev, hasEvChargingOnly: !prev.hasEvChargingOnly }))
        }
        onFilterCentralArea={() =>
          setFilters((prev) => ({
            ...prev,
            area: prev.area === 'Central / CBD' ? 'All Areas' : 'Central / CBD',
          }))
        }
        freeParkingActive={filters.freeParkingOnly}
        evChargingActive={filters.hasEvChargingOnly}
        centralAreaActive={filters.area === 'Central / CBD'}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        resultCount={filteredCarparks.length}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TAB 1: LIVE MAP & SPLIT VIEW */}
        {currentTab === 'map' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left: Map View */}
            {(viewMode === 'split' || viewMode === 'map') && (
              <div
                className={`relative ${
                  viewMode === 'map' ? 'w-full h-full min-h-[75vh]' : 'w-full lg:w-3/5 h-[45vh] lg:h-full'
                }`}
              >
                <MapView
                  carparks={filteredCarparks}
                  selectedCarpark={selectedCarpark}
                  onSelectCarpark={(cp) => {
                    setSelectedCarpark(cp);
                    setDetailModalCarpark(cp);
                  }}
                  vehicleType={filters.vehicleType}
                  isDarkMode={isDarkMode}
                />
              </div>
            )}

            {/* Right: Carpark List */}
            {(viewMode === 'split' || viewMode === 'list') && (
              <div
                className={`flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 ${
                  viewMode === 'list' ? 'w-full h-full' : 'w-full lg:w-2/5 h-[55vh] lg:h-full'
                }`}
              >
                <CarparkList
                  carparks={filteredCarparks}
                  selectedCarpark={selectedCarpark}
                  bookmarkedIds={bookmarkedIds}
                  vehicleType={filters.vehicleType}
                  onSelectCarpark={(cp) => {
                    setSelectedCarpark(cp);
                  }}
                  onToggleBookmark={handleToggleBookmark}
                  onOpenDetails={(cp) => setDetailModalCarpark(cp)}
                  onResetFilters={resetFilters}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CARPARK DIRECTORY (Full Grid View) */}
        {currentTab === 'directory' && (
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Singapore Carpark Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Full list of monitored HDB, URA, and Shopping Mall carparks across Singapore.
                </p>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {filteredCarparks.length} Hubs Found
              </span>
            </div>

            {filteredCarparks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No carparks match your filter criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-lg cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    isSelected={selectedCarpark?.id === cp.id}
                    isBookmarked={bookmarkedIds.includes(cp.id)}
                    vehicleType={filters.vehicleType}
                    onSelect={(c) => setSelectedCarpark(c)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenDetails={(c) => setDetailModalCarpark(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED LOTS */}
        {currentTab === 'saved' && (
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500 fill-amber-400" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Saved Carpark Hubs
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your bookmarked parking locations for quick access and real-time lot checking.
                  </p>
                </div>
              </div>
              {bookmarkedIds.length > 0 && (
                <button
                  onClick={() => {
                    setBookmarkedIds([]);
                    saveBookmarks([]);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium cursor-pointer"
                >
                  Clear All Saved
                </button>
              )}
            </div>

            {bookmarkedCarparks.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  No carparks bookmarked yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Click the star icon on any carpark card or map pin to bookmark your frequent parking spots (e.g. office, home, shopping mall).
                </p>
                <button
                  onClick={() => setCurrentTab('map')}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
                >
                  Explore Singapore Map
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarkedCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    isSelected={selectedCarpark?.id === cp.id}
                    isBookmarked={true}
                    vehicleType={filters.vehicleType}
                    onSelect={(c) => setSelectedCarpark(c)}
                    onToggleBookmark={handleToggleBookmark}
                    onOpenDetails={(c) => setDetailModalCarpark(c)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Carpark Detail Drawer / Modal */}
      {detailModalCarpark && (
        <CarparkDetailModal
          carpark={detailModalCarpark}
          isOpen={!!detailModalCarpark}
          onClose={() => setDetailModalCarpark(null)}
          isBookmarked={bookmarkedIds.includes(detailModalCarpark.id)}
          onToggleBookmark={handleToggleBookmark}
          activeVehicleType={filters.vehicleType}
        />
      )}

      {/* Rates & Rules Modal */}
      <RatesGuideModal
        isOpen={isRatesModalOpen}
        onClose={() => setIsRatesModalOpen(false)}
      />
    </div>
  );
}
