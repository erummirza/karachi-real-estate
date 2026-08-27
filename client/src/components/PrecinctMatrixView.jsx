import React, { useState } from 'react';
import { Building, MapPin, HandCoins, ChevronRight, Eye } from 'lucide-react';
export const PrecinctMatrixView = ({
  plots,
  selectedSociety,
  onMakeOffer,
  onViewDetail
}) => {
  const [activePrecinct, setActivePrecinct] = useState(null);

  // Group plots by precinct/sector/phase
  const grouped = React.useMemo(() => {
    const map = {};
    plots.forEach(plot => {
      const key = `${plot.societyName} - ${plot.precinctOrSector}`;
      if (!map[key]) map[key] = [];
      map[key].push(plot);
    });
    return map;
  }, [plots]);
  const groupKeys = Object.keys(grouped).sort();
  if (groupKeys.length === 0) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
        No precinct groupings found for current filters.
      </div>;
  }
  return <div id="precinct-matrix-container" className="space-y-6">
      
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
          Precinct & Block Visual Inventory Matrix
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Click any Precinct, Sector or Phase block to view all listed plot numbers and demands.
        </p>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {groupKeys.map(key => {
          const list = grouped[key];
          const sample = list[0];
          const isSelected = activePrecinct === key;
          const prices = list.map(p => p.demandPricePkr).filter(p => p > 0);
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
          const minDisplay = list.find(p => p.demandPricePkr === minPrice)?.demandDisplay || '';
          const maxDisplay = list.find(p => p.demandPricePkr === maxPrice)?.demandDisplay || '';
          return <div key={key} onClick={() => setActivePrecinct(isSelected ? null : key)} className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs flex flex-col justify-between ${isSelected ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-500' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isSelected ? 'bg-emerald-500 text-slate-950' : sample.society === 'BTK' ? 'bg-emerald-100 text-emerald-800' : sample.society === 'DCK' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {sample.society}
                    </span>

                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-slate-800 text-emerald-300' : 'bg-white text-slate-700 border'}`}>
                      {list.length} Plot{list.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <h3 className="text-base font-black mt-2">
                    {sample.precinctOrSector}
                  </h3>
                  <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {sample.location}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/40 flex items-center justify-between text-xs">
                  <div>
                    <span className={`block text-[10px] uppercase font-medium ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>Range</span>
                    <span className="font-bold text-emerald-500">
                      {minDisplay === maxDisplay ? minDisplay : `${minDisplay} – ${maxDisplay}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-emerald-400">
                    <span>{isSelected ? 'Close' : 'View'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

              </div>;
        })}
        </div>
      </div>

      {/* Expanded Precinct List */}
      {activePrecinct && <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                Precinct Breakdown
              </span>
              <h3 className="text-xl font-bold">{activePrecinct}</h3>
            </div>
            <button onClick={() => setActivePrecinct(null)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300">
              Close Block Breakdown ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {grouped[activePrecinct].map(plot => <div key={plot.id} className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-white">
                    Plot #{plot.plotNumber}
                  </span>
                  <span className="text-sm font-bold text-emerald-400">
                    {plot.demandDisplay}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Size & Category:</span>
                    <strong className="text-slate-100">{plot.sizeDisplay} ({plot.category})</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Listing Agent:</span>
                    <strong className="text-slate-100">{plot.agentName} ({plot.agentPhone})</strong>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-700">
                  <button onClick={() => onMakeOffer(plot)} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <HandCoins className="w-3.5 h-3.5" />
                    <span>Offer Price</span>
                  </button>

                  <button onClick={() => onViewDetail(plot)} className="py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>
              </div>)}
          </div>
        </div>}

    </div>;
};
