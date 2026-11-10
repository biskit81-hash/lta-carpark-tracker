import React from 'react';
import { Carpark, VehicleCategory } from '../types/carpark';
import { Activity, BatteryCharging, ShieldCheck, MapPin } from 'lucide-react';

interface MetricsOverviewProps {
  carparks: Carpark[];
  vehicleType: VehicleCategory;
  onFilterFreeParking: () => void;
  onFilterEvCharging: () => void;
  onFilterCentralArea: () => void;
  freeParkingActive: boolean;
  evChargingActive: boolean;
  centralAreaActive: boolean;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  carparks,
  vehicleType,
  onFilterFreeParking,
  onFilterEvCharging,
  onFilterCentralArea,
  freeParkingActive,
  evChargingActive,
  centralAreaActive,
}) => {
  // Aggregate statistics
  const totalSites = carparks.length;

  const totalLots = carparks.reduce((acc, cp) => {
    const lot = cp.lots[vehicleType] || cp.lots.car;
    return acc + lot.total;
  }, 0);

  const availableLots = carparks.reduce((acc, cp) => {
    const lot = cp.lots[vehicleType] || cp.lots.car;
    return acc + lot.available;
  }, 0);

  const centralCarparks = carparks.filter(
    (cp) => cp.area === 'Central / CBD' || cp.area === 'Orchard' || cp.area === 'Marina Bay'
  );

  const centralAvailable = centralCarparks.reduce((acc, cp) => {
    const lot = cp.lots[vehicleType] || cp.lots.car;
    return acc + lot.available;
  }, 0);

  const centralTotal = centralCarparks.reduce((acc, cp) => {
    const lot = cp.lots[vehicleType] || cp.lots.car;
    return acc + lot.total;
  }, 0);

  const centralVacancyRate = centralTotal > 0 ? Math.round((centralAvailable / centralTotal) * 100) : 0;
  const overallVacancyRate = totalLots > 0 ? Math.round((availableLots / totalLots) * 100) : 0;

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Metric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Stat 1: Total Available Lots */}
          <div className="py-2 md:py-0 md:pr-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Island-wide Vacant Lots</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">
                {availableLots.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                / {totalLots.toLocaleString()} ({overallVacancyRate}%)
              </span>
            </div>
          </div>

          {/* Stat 2: Central / CBD Vacancy Rate */}
          <div className="py-2 md:py-0 md:px-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Central & Orchard Vacancy</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">
                {centralVacancyRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                ({centralAvailable.toLocaleString()} lots)
              </span>
            </div>
          </div>

          {/* Stat 3: Monitored Hubs */}
          <div className="py-2 md:py-0 md:px-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Live Monitored Hubs</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">
                {totalSites}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                HDB · URA · LTA Malls
              </span>
            </div>
          </div>

          {/* Stat 4: Quick Driver Toggles */}
          <div className="py-2 md:py-0 md:pl-4 flex flex-col justify-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Smart Filters</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onFilterCentralArea}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                  centralAreaActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                Central
              </button>
              <button
                onClick={onFilterEvCharging}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer border flex items-center gap-1 ${
                  evChargingActive
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <BatteryCharging className="w-3 h-3" />
                <span>EV</span>
              </button>
              <button
                onClick={onFilterFreeParking}
                className={`text-xs px-2.5 py-1 rounded transition-colors cursor-pointer border ${
                  freeParkingActive
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                Free Parking
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
