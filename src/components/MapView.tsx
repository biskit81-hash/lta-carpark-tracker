import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Carpark, VehicleCategory } from '../types/carpark';
import { getAvailabilityStatus } from '../services/carparkService';
import { Navigation, Crosshair } from 'lucide-react';

interface MapViewProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  vehicleType: VehicleCategory;
  isDarkMode: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  vehicleType,
  isDarkMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const isInitialMountRef = useRef<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Singapore
      const sgCenter: L.LatLngExpression = [1.3521, 103.8198];

      const map = L.map(mapContainerRef.current, {
        center: sgCenter,
        zoom: 12,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
      });

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size after layout mounts to ensure leaflet knows its dimensions
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }

    const map = mapInstanceRef.current;

    // Tile Layer: CartoDB Voyager
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
  }, [isDarkMode]);

  // Handle ResizeObserver to keep Leaflet size synced with parent container
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when carparks or vehicleType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    carparks.forEach((cp) => {
      if (
        !cp.coordinates ||
        !Number.isFinite(cp.coordinates.lat) ||
        !Number.isFinite(cp.coordinates.lng)
      ) {
        return;
      }

      const lotInfo = cp.lots[vehicleType] || cp.lots.car;
      const statusInfo = getAvailabilityStatus(cp, vehicleType);

      // Determine pin colors
      let bgHex = '#10b981'; // emerald
      if (statusInfo.status === 'limited') bgHex = '#f59e0b'; // amber
      if (statusInfo.status === 'full') bgHex = '#f43f5e'; // rose

      const isSelected = selectedCarpark?.id === cp.id;

      // Custom HTML Pin showing available lot numbers
      const customIcon = L.divIcon({
        className: 'custom-carpark-pin',
        html: `
          <div style="
            transform: translate(-50%, -100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          ">
            <div style="
              background-color: ${bgHex};
              color: white;
              font-family: 'JetBrains Mono', monospace;
              font-weight: 700;
              font-size: 11px;
              padding: 3px 7px;
              border-radius: 6px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.25);
              border: ${isSelected ? '2.5px solid white' : '1.5px solid rgba(255,255,255,0.8)'};
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              transition: transform 0.15s ease;
            ">
              <span style="font-size: 9px; opacity: 0.9;">P</span>
              <span>${lotInfo.available}</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 5px solid transparent;
              border-right: 5px solid transparent;
              border-top: 6px solid ${bgHex};
              margin-top: -1px;
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
        title: cp.name,
      });

      // Marker click handler
      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      marker.addTo(map);
      markersRef.current[cp.id] = marker;
    });
  }, [carparks, vehicleType, selectedCarpark, onSelectCarpark]);

  // Fly to selected carpark if provided and valid
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCarpark) return;

    const lat = selectedCarpark.coordinates?.lat;
    const lng = selectedCarpark.coordinates?.lng;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    // Skip auto-fly on very first mount so the initial full Singapore view isn't interrupted
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    map.invalidateSize();
    const size = map.getSize();

    // If container size is not yet measured, fall back to safe setView
    if (!size || size.x <= 0 || size.y <= 0) {
      map.setView([lat, lng], 15);
      return;
    }

    try {
      map.flyTo([lat, lng], 15, { duration: 1.0 });
    } catch {
      map.setView([lat, lng], 15);
    }
  }, [selectedCarpark]);

  // Locate Singapore Center
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.invalidateSize();
    try {
      map.flyTo([1.3521, 103.8198], 12, { duration: 1 });
    } catch {
      map.setView([1.3521, 103.8198], 12);
    }
  };

  // Mock / Geolocation: Center on Driver in Singapore
  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.invalidateSize();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= 1.2 &&
            lat <= 1.48 &&
            lng >= 103.6 &&
            lng <= 104.1
          ) {
            try {
              map.flyTo([lat, lng], 15);
            } catch {
              map.setView([lat, lng], 15);
            }
          } else {
            // Default to Orchard / Central
            try {
              map.flyTo([1.304, 103.8319], 15);
            } catch {
              map.setView([1.304, 103.8319], 15);
            }
          }
        },
        () => {
          // Fallback to Orchard Road
          try {
            map.flyTo([1.304, 103.8319], 15);
          } catch {
            map.setView([1.304, 103.8319], 15);
          }
        }
      );
    } else {
      try {
        map.flyTo([1.304, 103.8319], 15);
      } catch {
        map.setView([1.304, 103.8319], 15);
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend & Control Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Legend */}
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-xs flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">&gt; 30 Lots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">&lt; 30 Lots</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-slate-300">&le; 5 Lots</span>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons: Reset & Locate */}
      <div className="absolute bottom-5 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          title="Locate my position in Singapore"
          className="p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Locate me"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetView}
          title="Reset to whole Singapore"
          className="p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Reset map"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
