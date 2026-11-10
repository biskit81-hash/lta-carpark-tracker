import React from 'react';
import { X, ShieldCheck, Clock, CreditCard, AlertCircle, HelpCircle } from 'lucide-react';

interface RatesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RatesGuideModal: React.FC<RatesGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Official Reference
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Singapore Parking Rates & Schemes Guide
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              HDB, URA, and Commercial parking rules, electronic EPS gantries, and concessions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Section 1: HDB Parking Rates */}
          <div>
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>HDB (Housing & Development Board) Standard Rates</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Standard / Non-Central</th>
                    <th className="py-2.5 px-3">Central Area (CBD/Orchard)</th>
                    <th className="py-2.5 px-3">Night Parking (10:30pm - 7am)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                      Cars (Type C)
                    </td>
                    <td className="py-2.5 px-3">$0.60 per 30 mins</td>
                    <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">
                      $1.20 - $1.40 per 30 mins
                    </td>
                    <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      Capped at $5.00
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                      Motorcycles (Type Y)
                    </td>
                    <td className="py-2.5 px-3">$0.65 per entry</td>
                    <td className="py-2.5 px-3">$0.65 per entry</td>
                    <td className="py-2.5 px-3">$0.65 per entry</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-100">
                      Heavy Vehicles (Type H)
                    </td>
                    <td className="py-2.5 px-3">$1.20 per 30 mins</td>
                    <td className="py-2.5 px-3">$1.20 per 30 mins</td>
                    <td className="py-2.5 px-3">Season / designated only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Special Concession Schemes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Free Parking Scheme (FPS)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Most non-central HDB carparks offer <strong>FREE PARKING on Sundays and Public Holidays</strong> from 7:00 AM to 10:30 PM for cars and motorcycles. Normal parking charges resume from 10:30 PM onwards.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Grace Period (10–15 mins)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Motorists enjoy a <strong>15-minute grace period</strong> at all HDB and URA electronic EPS car parks to facilitate pick-ups and drop-offs. If exit occurs after 15 minutes, fees are calculated from entry time.
              </p>
            </div>
          </div>

          {/* Section 3: Payment Methods in Singapore */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              Electronic Payment Options (EPS)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">ERP 2.0 / OBU:</strong>
                <span>Next-generation on-board unit with backend account deduction.</span>
              </div>
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">NETS FlashPay / CashCard:</strong>
                <span>Inserted into vehicle In-Vehicle Unit (IU) before passing gantry.</span>
              </div>
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">Parking.sg / EZ-Link Pay:</strong>
                <span>Direct bank-card automated toll deduction via license plate matching.</span>
              </div>
            </div>
          </div>

          {/* Section 4: Shopping Malls & Commercial Rules */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Commercial & Shopping Mall Tips:</strong>
              <p>
                Commercial carparks (e.g. Marina Bay Sands, ION Orchard, Suntec City) set independent rate tiers with 1st-hour surcharges and peak dinner/weekend rates. Check in-mall spending thresholds (e.g. $50 spend) to redeem complimentary parking rebate coupons.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
