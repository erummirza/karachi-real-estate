import React from 'react';
import { MapPin, Phone, User, Tag, TrendingUp, HandCoins, Share2, CheckCircle2 } from 'lucide-react';
export const PlotCard = ({
  plot,
  onMakeOffer,
  onViewDetail,
  onShareWhatsApp
}) => {
  const getSocietyBadge = () => {
    switch (plot.society) {
      case 'BTK':
        return {
          label: 'Bahria Town Karachi',
          sub: plot.precinctOrSector.toUpperCase().startsWith('P') ? plot.precinctOrSector : `P${plot.precinctOrSector}`,
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          badgeBg: 'bg-emerald-600 text-white'
        };
      case 'DCK':
        return {
          label: 'DHA City Karachi',
          sub: `Sector ${plot.precinctOrSector}`,
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          badgeBg: 'bg-blue-600 text-white'
        };
      case 'DHA':
        return {
          label: 'DHA Karachi',
          sub: plot.precinctOrSector,
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          badgeBg: 'bg-indigo-600 text-white'
        };
    }
  };
  const badge = getSocietyBadge();

  // Find highest offer if any
  const highestOffer = plot.offers && plot.offers.length > 0 ? Math.max(...plot.offers.map(o => o.offeredPricePkr)) : 0;
  return <div id={`plot-card-${plot.id}`} className="bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group">
      {/* Top Header: Society Badge + Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 ${badge.bg}`}>
            <span>{badge.label}</span>
          </span>

          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-md uppercase tracking-wider">
            {plot.category}
          </span>
        </div>

        {/* Location & Plot # Title */}
        <div className="flex items-start justify-between gap-2 pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-slate-900">
              <span className={`px-2 py-0.5 text-xs font-black rounded-md ${badge.badgeBg}`}>
                {badge.sub}
              </span>
              <span className="text-base font-extrabold tracking-tight">
                Plot #{plot.plotNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{plot.location} • {plot.sizeDisplay}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-medium uppercase">Demand Price</span>
            <span className="text-base font-black text-emerald-700">
              {plot.demandDisplay}
            </span>
          </div>
        </div>

        {/* Feature Tags */}
        {plot.features && plot.features.length > 0 && <div className="flex flex-wrap gap-1 pt-1">
            {plot.features.map((feat, idx) => <span key={idx} className="px-2 py-0.5 text-[10px] font-medium bg-slate-50 border border-slate-200 text-slate-600 rounded-md">
                {feat}
              </span>)}
          </div>}
      </div>

      {/* Offers Badge Section */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
            <HandCoins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-medium">Offers Submitted</span>
            <span className="text-xs font-bold text-slate-800">
              {plot.offers && plot.offers.length > 0 ? <>
                  {plot.offers.length} Offer{plot.offers.length > 1 ? 's' : ''} (High: {plot.offers[plot.offers.length - 1].offeredDisplay})
                </> : <span className="text-slate-400 font-normal">No offers yet</span>}
            </span>
          </div>
        </div>

        <button onClick={() => onViewDetail(plot)} className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold underline">
          View Log
        </button>
      </div>

      {/* Agent Contact & Action Buttons */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1 font-medium truncate max-w-[160px]">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{plot.agentName}</span>
          </span>

          <a href={`tel:${plot.agentPhone}`} className="flex items-center gap-1 text-slate-700 hover:text-emerald-700 font-mono text-[11px] font-bold" onClick={e => e.stopPropagation()}>
            <Phone className="w-3 h-3 text-emerald-600" />
            <span>{plot.agentPhone}</span>
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button id={`offer-btn-${plot.id}`} onClick={() => onMakeOffer(plot)} className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
            <HandCoins className="w-3.5 h-3.5" />
            <span>Offer Price</span>
          </button>

          <button id={`share-btn-${plot.id}`} onClick={() => onShareWhatsApp(plot)} className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

    </div>;
};
