import React from 'react';
import { HandCoins, Phone, Share2, Eye, MapPin } from 'lucide-react';
export const PlotTableView = ({
  plots,
  onMakeOffer,
  onViewDetail,
  onShareWhatsApp
}) => {
  if (plots.length === 0) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
        No plot inventory matching current filters.
      </div>;
  }
  return <div id="plot-table-container" className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-900 text-slate-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Society</th>
              <th className="p-3.5">Precinct / Sector / Phase</th>
              <th className="p-3.5">Plot #</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5">Demand Price</th>
              <th className="p-3.5">Features</th>
              <th className="p-3.5">Agent / Contact</th>
              <th className="p-3.5">Offers</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {plots.map(plot => {
            const offerCount = plot.offers ? plot.offers.length : 0;
            const lastOffer = offerCount > 0 ? plot.offers[offerCount - 1] : null;
            return <tr key={plot.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Society Badge */}
                  <td className="p-3 font-bold text-slate-900">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${plot.society === 'BTK' ? 'bg-emerald-100 text-emerald-800' : plot.society === 'DCK' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {plot.society}
                    </span>
                  </td>

                  {/* Precinct / Location */}
                  <td className="p-3 font-extrabold text-slate-900">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-800">
                      {plot.precinctOrSector}
                    </span>
                  </td>

                  {/* Plot # */}
                  <td className="p-3 font-black text-slate-900 text-sm">
                    #{plot.plotNumber}
                  </td>

                  {/* Category */}
                  <td className="p-3 text-slate-600 font-medium">
                    {plot.category}
                  </td>

                  {/* Size */}
                  <td className="p-3 font-semibold text-slate-800">
                    {plot.sizeDisplay}
                  </td>

                  {/* Demand Price */}
                  <td className="p-3 font-black text-emerald-700 text-sm">
                    {plot.demandDisplay}
                  </td>

                  {/* Features */}
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {plot.features && plot.features.map((f, i) => <span key={i} className="px-1.5 py-0.2 text-[9px] bg-slate-100 text-slate-600 rounded">
                          {f}
                        </span>)}
                    </div>
                  </td>

                  {/* Agent Contact */}
                  <td className="p-3">
                    <div className="text-slate-900 font-semibold">{plot.agentName}</div>
                    <a href={`tel:${plot.agentPhone}`} className="text-emerald-700 font-mono text-[11px] font-bold hover:underline">
                      {plot.agentPhone}
                    </a>
                  </td>

                  {/* Offers */}
                  <td className="p-3">
                    {offerCount > 0 ? <span className="px-2 py-1 bg-amber-100 text-amber-900 font-bold rounded text-[10px] block w-fit">
                        {offerCount} Offer ({lastOffer?.offeredDisplay})
                      </span> : <span className="text-slate-400 text-[11px]">None</span>}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onMakeOffer(plot)} className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all" title="Offer Plot Price">
                        <HandCoins className="w-3.5 h-3.5" />
                      </button>

                      <button onClick={() => onViewDetail(plot)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all" title="View Details & Log">
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button onClick={() => onShareWhatsApp(plot)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all" title="Share on WhatsApp">
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </div>
                  </td>

                </tr>;
          })}
          </tbody>
        </table>
      </div>
    </div>;
};
