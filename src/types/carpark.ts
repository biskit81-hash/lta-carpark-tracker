export type Agency = 'HDB' | 'URA' | 'LTA / Commercial';

export type CarparkType = 'Multi-Storey (MSCP)' | 'Surface' | 'Basement' | 'Mechanised';

export type SingaporeArea =
  | 'Central / CBD'
  | 'Orchard'
  | 'Marina Bay'
  | 'East (Tampines/Bedok)'
  | 'North (Woodlands/Yishun)'
  | 'North-East (Punggol/Sengkang)'
  | 'West (Jurong/Clementi)'
  | 'Central North (Bishan/AMK)';

export type VehicleCategory = 'car' | 'motorcycle' | 'heavyVehicle';

export interface LotAvailability {
  total: number;
  available: number;
}

export interface CarparkRates {
  weekdayPeak: string;
  weekdayOffPeak: string;
  weekend: string;
  ratePerHalfHour: number;
  perDayMax?: string;
  pricingNotes: string;
}

export interface Carpark {
  id: string;
  carparkNo: string; // e.g. "ACB", "TR12", "ION01"
  name: string;
  address: string;
  postalCode: string;
  area: SingaporeArea;
  agency: Agency;
  type: CarparkType;
  coordinates: {
    lat: number;
    lng: number;
  };
  gantryHeight: number; // in meters (e.g. 2.15)
  hasEvCharging: boolean;
  evChargersCount?: number;
  hasGracePeriod: boolean;
  gracePeriodMinutes: number; // typically 10 or 15 mins
  freeParkingScheme: string; // e.g. 'Sun & PH 7:00 AM - 10:30 PM' or 'None'
  nightParking: boolean;
  electronicParking: boolean; // EPS
  rates: CarparkRates;
  lots: {
    car: LotAvailability;
    motorcycle?: LotAvailability;
    heavyVehicle?: LotAvailability;
  };
  lastUpdated: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  recentChange: number; // -3, 0, +2 lots
  historicalHourlyLots: number[]; // 24 data points representing available lots over 24h
}

export interface FilterOptions {
  searchQuery: string;
  area: string;
  agency: string;
  vehicleType: VehicleCategory;
  availabilityFilter: 'all' | 'high' | 'limited' | 'availableOnly';
  minLots: number;
  hasEvChargingOnly: boolean;
  freeParkingOnly: boolean;
  highClearanceOnly: boolean; // >= 2.0m
}
