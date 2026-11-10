import { Carpark, VehicleCategory } from '../types/carpark';
import { INITIAL_CARPARKS } from '../data/singaporeCarparks';

const BOOKMARKS_STORAGE_KEY = 'sg_parkpulse_bookmarks';

export function getInitialBookmarks(): string[] {
  try {
    const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse bookmarks', e);
  }
  // Default bookmarked examples
  return ['mbs-01', 'tampines-hub', 'ion-orchard'];
}

export function saveBookmarks(bookmarks: string[]) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks', e);
  }
}

/**
 * Helper to calculate occupancy percentage
 */
export function getOccupancyPercentage(carpark: Carpark, vehicleType: VehicleCategory = 'car'): number {
  const lotInfo = carpark.lots[vehicleType] || carpark.lots.car;
  if (!lotInfo || lotInfo.total === 0) return 0;
  const occupied = lotInfo.total - lotInfo.available;
  return Math.min(100, Math.max(0, Math.round((occupied / lotInfo.total) * 100)));
}

/**
 * Returns vacancy status category: 'high' | 'limited' | 'full'
 */
export function getAvailabilityStatus(carpark: Carpark, vehicleType: VehicleCategory = 'car'): {
  status: 'high' | 'limited' | 'full';
  label: string;
  colorClass: string;
  badgeBg: string;
  borderClass: string;
} {
  const lotInfo = carpark.lots[vehicleType] || carpark.lots.car;
  const available = lotInfo.available;
  const total = lotInfo.total;
  const ratio = total > 0 ? available / total : 0;

  if (available <= 5 || ratio < 0.1) {
    return {
      status: 'full',
      label: 'Nearly Full',
      colorClass: 'text-rose-600 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-500/30',
    };
  }

  if (available < 30 || ratio < 0.25) {
    return {
      status: 'limited',
      label: 'Limited Lots',
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-500/30',
    };
  }

  return {
    status: 'high',
    label: 'Available',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/30',
  };
}

/**
 * Calculate parking fee estimate for Singapore carparks
 */
export function calculateParkingFee(
  carpark: Carpark,
  durationMinutes: number,
  isSundayOrPH: boolean = false,
  isNightParking: boolean = false
): {
  estimatedCost: number;
  breakdown: string;
  isFree: boolean;
} {
  // Check grace period
  if (carpark.hasGracePeriod && durationMinutes <= carpark.gracePeriodMinutes) {
    return {
      estimatedCost: 0,
      breakdown: `Free under ${carpark.gracePeriodMinutes}-min grace period`,
      isFree: true,
    };
  }

  // Check Free Parking Scheme (FPS) on Sundays / Public Holidays
  if (isSundayOrPH && carpark.freeParkingScheme.includes('Sun & PH')) {
    return {
      estimatedCost: 0,
      breakdown: 'Complimentary parking (HDB Free Parking Scheme active)',
      isFree: true,
    };
  }

  const halfHourBlocks = Math.ceil(durationMinutes / 30);

  if (carpark.agency === 'HDB') {
    const isCentral = carpark.area === 'Central / CBD' || carpark.area === 'Orchard';
    const ratePerHalfHour = isCentral ? 1.4 : 0.6;
    let cost = halfHourBlocks * ratePerHalfHour;

    if (isNightParking && cost > 5.0) {
      cost = 5.0; // HDB night parking cap
      return {
        estimatedCost: cost,
        breakdown: `${halfHourBlocks} x 30m blocks (Night cap applied: $5.00)`,
        isFree: false,
      };
    }

    return {
      estimatedCost: Number(cost.toFixed(2)),
      breakdown: `${halfHourBlocks} x 30m @ $${ratePerHalfHour.toFixed(2)} / block`,
      isFree: false,
    };
  }

  if (carpark.agency === 'URA') {
    const isCentral = carpark.area === 'Central / CBD' || carpark.area === 'Orchard';
    const ratePerHalfHour = isCentral ? 1.4 : 0.7;
    const cost = halfHourBlocks * ratePerHalfHour;
    return {
      estimatedCost: Number(cost.toFixed(2)),
      breakdown: `${halfHourBlocks} x 30m @ $${ratePerHalfHour.toFixed(2)} / block (URA schedule)`,
      isFree: false,
    };
  }

  // Commercial / Shopping Mall standard calculation
  const baseRate = carpark.rates.ratePerHalfHour;
  let totalCost = halfHourBlocks * baseRate;

  // Add 1st hour premium if applicable
  if (carpark.rates.weekdayPeak.includes('1st hour')) {
    totalCost = Math.max(baseRate * 2, totalCost);
  }

  return {
    estimatedCost: Number(totalCost.toFixed(2)),
    breakdown: `Estimated at ~$${baseRate.toFixed(2)}/half hr (commercial mall tier)`,
    isFree: false,
  };
}

/**
 * Backend Hook Point:
 * Ready for future backend integration with Data.gov.sg or custom server
 */
export async function fetchLiveCarparkAvailability(
  _backendUrl?: string
): Promise<Carpark[]> {
  /*
   * When backend is integrated, replace simulation with:
   * const res = await fetch(_backendUrl || '/api/carparks/availability');
   * const data = await res.json();
   * return data;
   */

  // Simulating realistic live fluctuations in lot availability
  return INITIAL_CARPARKS.map((cp) => {
    // 30% chance of small lot change (+1 to -2)
    const shouldShift = Math.random() < 0.35;
    if (!shouldShift) return cp;

    const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const currentLots = cp.lots.car.available;
    const totalLots = cp.lots.car.total;
    const newAvailable = Math.max(0, Math.min(totalLots, currentLots + delta));

    return {
      ...cp,
      lots: {
        ...cp.lots,
        car: {
          ...cp.lots.car,
          available: newAvailable,
        },
      },
      recentChange: delta,
      trend: delta > 0 ? 'increasing' : delta < 0 ? 'decreasing' : 'stable',
      lastUpdated: 'Just now',
    };
  });
}
