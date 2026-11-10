import React from 'react';
import { RefreshCw, Moon, Sun, Car } from 'lucide-react';

interface NavbarProps {
  currentTab: 'map' | 'directory' | 'saved' | 'rates';
  onSelectTab: (tab: 'map' | 'directory' | 'saved' | 'rates') => void;
  savedCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdatedTime: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isLiveLta?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  isRefreshing,
  onRefresh,
  lastUpdatedTime,
  isDarkMode,
  onToggleDarkMode,
  isLiveLta = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Car className="w-5 h-5" />
          </div>
          <button
            onClick={() => onSelectTab('map')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap block">
              SG ParkPulse
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean single-line text links with active underlines) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => onSelectTab('map')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentTab === 'map'
                ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Live Map
          </button>
          <button
            onClick={() => onSelectTab('directory')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentTab === 'directory'
                ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Carpark Directory
          </button>
          <button
            onClick={() => onSelectTab('saved')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 flex items-center gap-1.5 ${
              currentTab === 'saved'
                ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Saved Lots</span>
            {savedCount > 0 && (
              <span className="text-xs font-mono tabular-nums px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                {savedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('rates')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer border-b-2 ${
              currentTab === 'rates'
                ? 'border-emerald-600 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Singapore Rates Guide
          </button>
        </nav>

        {/* Zone 3: Actions (Theme toggle & Live Refresh button) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveLta ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'
              }`}
              title={isLiveLta ? 'Connected to live LTA DataMall v2 feed' : 'Simulated real-time feed'}
            />
            <span>{isLiveLta ? 'LTA Live' : `Sync: ${lastUpdatedTime}`}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh carpark availability"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Lots</span>
          </button>

          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-xs font-medium">
        <button
          onClick={() => onSelectTab('map')}
          className={`px-3 py-1.5 rounded-md ${
            currentTab === 'map'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Live Map
        </button>
        <button
          onClick={() => onSelectTab('directory')}
          className={`px-3 py-1.5 rounded-md ${
            currentTab === 'directory'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Directory
        </button>
        <button
          onClick={() => onSelectTab('saved')}
          className={`px-3 py-1.5 rounded-md flex items-center gap-1 ${
            currentTab === 'saved'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <span>Saved</span>
          {savedCount > 0 && <span className="tabular-nums">({savedCount})</span>}
        </button>
        <button
          onClick={() => onSelectTab('rates')}
          className={`px-3 py-1.5 rounded-md ${
            currentTab === 'rates'
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          Rates
        </button>
      </div>
    </header>
  );
};
