import React from 'react';
import { Building2, PlusCircle, Share2, Sparkles, Database, Layers } from 'lucide-react';
export const Header = ({
  plots,
  onOpenImport,
  onOpenExport
}) => {
  const btkCount = plots.filter(p => p.society === 'BTK').length;
  const dckCount = plots.filter(p => p.society === 'DCK').length;
  const dhaCount = plots.filter(p => p.society === 'DHA').length;
  const totalOffers = plots.reduce((acc, p) => acc + (p.offers ? p.offers.length : 0), 0);
  const totalValuationPkr = plots.reduce((acc, p) => acc + (p.demandPricePkr || 0), 0);
  const totalValuationCrores = (totalValuationPkr / 10000000).toFixed(1);
  return <header id="main-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">Karachi Estate Hub</h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto Parser Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bahria Town Karachi (P1–P63) • DHA City (1A–14B) • DHA (Phase 1–8)
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60">
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Total Inventory</span>
              <span className="font-bold text-slate-100 text-sm flex items-center justify-center gap-1">
                <Database className="w-3.5 h-3.5 text-blue-400" /> {plots.length} Plots
              </span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Total Value</span>
              <span className="font-bold text-emerald-400 text-sm">~{totalValuationCrores} Crore</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div className="text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Societies</span>
              <span className="font-medium text-slate-200 text-xs">
                BTK ({btkCount}) • DCK ({dckCount}) • DHA ({dhaCount})
              </span>
            </div>
            {totalOffers > 0 && <>
                <div className="h-6 w-px bg-slate-700" />
                <div className="text-center">
                  <span className="text-slate-400 block text-[10px] uppercase font-medium">Offers Received</span>
                  <span className="font-bold text-amber-400 text-sm">{totalOffers} Active</span>
                </div>
              </>}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button id="header-export-btn" onClick={onOpenExport} className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp Export</span>
            </button>

            <button id="header-import-btn" onClick={onOpenImport} className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all flex items-center gap-2 shadow-md shadow-emerald-900/30 active:scale-95">
              <PlusCircle className="w-4 h-4" />
              <span>Paste Raw Inventory</span>
            </button>
          </div>

        </div>
      </div>
    </header>;
};
