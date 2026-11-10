import React, { useState } from 'react';
import { Carpark, VehicleCategory } from '../types/carpark';
import { calculateParkingFee, getAvailabilityStatus, getOccupancyPercentage } from '../services/carparkService';
import {
  X,
  Star,
  Navigation,
  ExternalLink,
  Zap,
  Clock,
  Shield,
  Layers,
  Copy,
  Check,
  Calculator,
  Calendar,
  Moon,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  activeVehicleType: VehicleCategory;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
  activeVehicleType,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(90); // 90 mins default
  const [isSundayOrPH, setIsSundayOrPH] = useState<boolean>(false);
  const [isNightParking, setIsNightParking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const statusInfo = getAvailabilityStatus(carpark, activeVehicleType);
  const occupancy = getOccupancyPercentage(carpark, activeVehicleType);
  const lotInfo = carpark.lots[activeVehicleType] || carpark.lots.car;

  const feeCalculation = calculateParkingFee(
    carpark,
    selectedDuration,
    isSundayOrPH,
    isNightParking
  );

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${carpark.name}, ${carpark.address}, Singapore ${carpark.postalCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {carpark.agency}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{carpark.carparkNo}</span>
              <span aria-hidden="true">·</span>
              <span>{carpark.area}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {carpark.address} · Singapore {carpark.postalCode}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => onToggleBookmark(carpark.id, e)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-500 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500'
              }`}
              title={isBookmarked ? 'Saved to bookmarks' : 'Add to bookmarks'}
              aria-label={isBookmarked ? 'Saved to bookmarks' : 'Add to bookmarks'}
            >
              <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Live Lot Vacancy Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Real-Time Availability
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                Synced: {carpark.lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Car Lots */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Car Lots (Type C)
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {carpark.lots.car.available}
                  </span>
                  <span className="text-xs text-slate-400 font-mono tabular-nums">
                    / {carpark.lots.car.total}
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.round(
                        ((carpark.lots.car.total - carpark.lots.car.available) /
                          carpark.lots.car.total) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Motorcycle Lots */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Motorcycle Lots (Type Y)
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {carpark.lots.motorcycle ? carpark.lots.motorcycle.available : 'N/A'}
                  </span>
                  {carpark.lots.motorcycle && (
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      / {carpark.lots.motorcycle.total}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-2 block">
                  Fixed $0.65/entry HDB cap
                </span>
              </div>

              {/* Heavy Vehicles */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  Heavy Vehicle (Type H)
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {carpark.lots.heavyVehicle ? carpark.lots.heavyVehicle.available : 'None'}
                  </span>
                  {carpark.lots.heavyVehicle && (
                    <span className="text-xs text-slate-400 font-mono tabular-nums">
                      / {carpark.lots.heavyVehicle.total}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-2 block">
                  Designated bus/lorry bays
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: 24-Hour Typical Vacancy Trend */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                24-Hour Historical Vacancy Profile
              </span>
              <span className="text-xs text-slate-400">00:00 to 23:00</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="h-24 flex items-end gap-1.5 justify-between pt-4">
                {carpark.historicalHourlyLots.map((val, idx) => {
                  const maxVal = Math.max(...carpark.historicalHourlyLots, 1);
                  const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group/bar relative"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 hidden group-hover/bar:block z-30 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-mono">
                        {idx}:00 — {val} lots
                      </div>
                      <div
                        className={`w-full rounded-t transition-all ${
                          idx === 14 || idx === 19
                            ? 'bg-amber-500'
                            : 'bg-emerald-500/70 dark:bg-emerald-500/50 group-hover/bar:bg-emerald-500'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM (Peak)</span>
                <span>6 PM (Peak)</span>
                <span>11 PM</span>
              </div>
            </div>
          </div>

          {/* Section 3: Interactive Parking Fee Calculator */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Estimated Parking Fee Calculator
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Duration Buttons */}
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1.5">
                  Select Parking Duration:
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[15, 30, 60, 90, 120, 180, 240, 480].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setSelectedDuration(mins)}
                      className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                        selectedDuration === mins
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Scheme Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isSundayOrPH}
                    onChange={(e) => setIsSundayOrPH(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Sunday / Public Holiday</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isNightParking}
                    onChange={(e) => setIsNightParking(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Night Parking (10:30 PM - 7:00 AM)</span>
                </label>
              </div>

              {/* Calculation Output Strip */}
              <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Estimated Charge:
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-mono mt-0.5 block">
                    {feeCalculation.breakdown}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-black font-mono tabular-nums ${
                      feeCalculation.isFree
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {feeCalculation.isFree
                      ? 'FREE'
                      : `$${feeCalculation.estimatedCost.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Specifications & Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Grace Period & EPS</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200">
                {carpark.gracePeriodMinutes} mins grace period. Electronic Parking System (EPS) automated gantry sensor.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Clearance & Scheme</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200">
                Gantry height limit: <strong>{carpark.gantryHeight}m</strong>. Free Parking Scheme: {carpark.freeParkingScheme}.
              </p>
            </div>

            {carpark.hasEvCharging && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Electric Vehicle (EV) Charging</span>
                </div>
                <p className="text-slate-800 dark:text-slate-200">
                  {carpark.evChargersCount}x fast/slow charging bays on site. Compatible with Singapore standard Type 2 AC & CCS2 DC plugs.
                </p>
              </div>
            )}
          </div>

          {/* Section 5: Official Rates Schedule Notes */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">
              Official Rate Structure
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Weekday Peak:</strong>
                <span>{carpark.rates.weekdayPeak}</span>
              </div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Weekday Off-Peak:</strong>
                <span>{carpark.rates.weekdayOffPeak}</span>
              </div>
              <div className="sm:col-span-2">
                <strong className="text-slate-800 dark:text-slate-200 block">Weekends & PH:</strong>
                <span>{carpark.rates.weekend}</span>
              </div>
            </div>
            {carpark.rates.pricingNotes && (
              <p className="text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 italic">
                {carpark.rates.pricingNotes}
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer: Directions & External Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
          </button>

          <div className="flex items-center gap-2">
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Waze</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
