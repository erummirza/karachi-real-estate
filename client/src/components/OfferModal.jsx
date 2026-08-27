import React, { useState } from 'react';
import { formatPkrDisplay } from '../utils/parser';
import { HandCoins, Check, Building, Phone, User, ShieldCheck } from 'lucide-react';
export const OfferModal = ({
  plot,
  isOpen,
  onClose,
  onSubmitOffer
}) => {
  const [offerPriceInput, setOfferPriceInput] = useState('');
  const [priceUnit, setPriceUnit] = useState('lacs');
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [terms, setTerms] = useState('Immediate cash offer, 5 Lacs token ready on spot');
  if (!isOpen || !plot) return null;
  const handleSubmit = e => {
    e.preventDefault();
    if (!offerPriceInput || isNaN(Number(offerPriceInput))) return;
    const val = Number(offerPriceInput);
    const pricePkr = priceUnit === 'crores' ? Math.round(val * 10000000) : Math.round(val * 100000);
    const display = formatPkrDisplay(pricePkr);
    const newOffer = {
      id: `offer-${Date.now()}`,
      plotId: plot.id,
      offeredPricePkr: pricePkr,
      offeredDisplay: display,
      offeringAgentName: agentName.trim() || 'Karachi Buying Agent',
      offeringAgentPhone: agentPhone.trim() || '0300-1234567',
      offeringAgency: agencyName.trim() || 'Independent Real Estate Broker',
      terms: terms.trim() || 'Standard payment terms',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    onSubmitOffer(plot.id, newOffer);

    // Reset form
    setOfferPriceInput('');
    setAgentName('');
    setAgentPhone('');
    setAgencyName('');
    onClose();
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div id="offer-modal-container" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Offer Plot Price</h2>
              <p className="text-xs text-slate-400">
                Submit binding offer to {plot.agentName || 'Listing Agent'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Target Plot Summary */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                {plot.societyName}
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {plot.precinctOrSector} • Plot #{plot.plotNumber}
              </h3>
              <p className="text-xs text-slate-500">{plot.sizeDisplay} ({plot.category})</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Demand Price</span>
              <span className="text-base font-black text-emerald-700 block">{plot.demandDisplay}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Offer Price Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Your Offered Price <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input id="offer-price-num-input" type="number" step="0.01" required value={offerPriceInput} onChange={e => setOfferPriceInput(e.target.value)} placeholder={priceUnit === 'lacs' ? 'e.g. 92' : 'e.g. 1.75'} className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300">
                <button type="button" onClick={() => setPriceUnit('lacs')} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${priceUnit === 'lacs' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                  Lacs
                </button>
                <button type="button" onClick={() => setPriceUnit('crores')} className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${priceUnit === 'crores' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                  Crores
                </button>
              </div>
            </div>

            {offerPriceInput && !isNaN(Number(offerPriceInput)) && <p className="text-xs text-emerald-700 font-bold pt-0.5">
                Calculated Offer: {formatPkrDisplay(priceUnit === 'crores' ? Number(offerPriceInput) * 10000000 : Number(offerPriceInput) * 100000)}
              </p>}
          </div>

          {/* Offering Agent Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Agent Name</label>
              <input type="text" required value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="e.g. Syed Tariq" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Mobile / WhatsApp</label>
              <input type="text" required value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="0321-4455667" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">Agency Name</label>
            <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="e.g. Al-Hidayah Real Estate & Marketing" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase">Terms & Payment Timeline</label>
            <textarea rows={2} value={terms} onChange={e => setTerms(e.target.value)} placeholder="e.g. Token ready 5 Lacs, 10 days balance payment" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500" />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
              Cancel
            </button>

            <button id="submit-offer-form-btn" type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
              <HandCoins className="w-4 h-4" />
              <span>Submit Offer Price</span>
            </button>
          </div>

        </form>

      </div>
    </div>;
};
