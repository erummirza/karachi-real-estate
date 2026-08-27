import React from 'react';
import { HandCoins, Share2, Phone, User, CheckCircle2, XCircle, Clock, MapPin, Building, MessageSquare } from 'lucide-react';
export const PlotDetailModal = ({
  plot,
  isOpen,
  onClose,
  onMakeOffer,
  onShareWhatsApp,
  onUpdateOfferStatus
}) => {
  if (!isOpen || !plot) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div id="plot-detail-modal-container" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              {plot.societyName}
            </span>
            <h2 className="text-xl font-black">
              {plot.precinctOrSector} • Plot #{plot.plotNumber}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Demand Price</span>
              <span className="text-lg font-black text-emerald-900">{plot.demandDisplay}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Plot Size</span>
              <span className="text-sm font-bold text-slate-900">{plot.sizeDisplay}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Property Type</span>
              <span className="text-sm font-bold text-slate-900">{plot.category}</span>
            </div>
          </div>

          {/* Features */}
          {plot.features && plot.features.length > 0 && <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Features</span>
              <div className="flex flex-wrap gap-1.5">
                {plot.features.map((feat, idx) => <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-slate-100 border border-slate-200 text-slate-800 rounded-lg">
                    ✓ {feat}
                  </span>)}
              </div>
            </div>}

          {/* Listing Agent Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Listing Agent Info</span>
            <div className="flex items-center justify-between">
              <div>
                <strong className="text-sm text-slate-900 block">{plot.agentName}</strong>
                <span className="text-xs text-slate-500">{plot.agencyName}</span>
              </div>

              <a href={`tel:${plot.agentPhone}`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs">
                <Phone className="w-3.5 h-3.5" />
                <span>{plot.agentPhone}</span>
              </a>
            </div>
          </div>

          {/* Offers History Log */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-emerald-600" />
                <span>Submitted Offers History ({plot.offers ? plot.offers.length : 0})</span>
              </h3>

              <button onClick={() => onMakeOffer(plot)} className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-all cursor-pointer">
                + New Offer
              </button>
            </div>

            {!plot.offers || plot.offers.length === 0 ? <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-xs text-slate-500">
                No offers recorded on this plot yet. Click "+ New Offer" to submit a price offer.
              </div> : <div className="space-y-2">
                {plot.offers.map(off => <div key={off.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-base font-black text-emerald-800">{off.offeredDisplay}</span>
                        <span className="text-xs text-slate-500 ml-2">by {off.offeringAgentName} ({off.offeringAgency})</span>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${off.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : off.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {off.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">"{off.terms}"</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Phone: <strong className="font-mono text-slate-800">{off.offeringAgentPhone}</strong></span>
                      <div className="flex items-center gap-1">
                        {off.status === 'Pending' && <>
                            <button onClick={() => onUpdateOfferStatus(plot.id, off.id, 'Accepted')} className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[10px]">
                              Accept
                            </button>
                            <button onClick={() => onUpdateOfferStatus(plot.id, off.id, 'Rejected')} className="px-2 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">
                              Reject
                            </button>
                          </>}
                      </div>
                    </div>
                  </div>)}
              </div>}
          </div>

          {/* Raw Text Reference */}
          {plot.rawText && <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-[11px]">
              <span className="font-bold text-slate-500 uppercase block mb-1">Original Pasted Text:</span>
              <p className="font-mono text-slate-700">{plot.rawText}</p>
            </div>}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button onClick={() => onShareWhatsApp(plot)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format for WhatsApp</span>
          </button>

          <button onClick={() => onMakeOffer(plot)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md">
            Submit Offer Price
          </button>
        </div>

      </div>
    </div>;
};
