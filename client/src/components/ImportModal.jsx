import React, { useState } from 'react';
import { parseInventoryTextClient } from '../utils/parser';
import { Sparkles, Clipboard, Check, Trash2, Edit2, AlertCircle, Building, Loader2 } from 'lucide-react';
const SAMPLE_RAW_INVENTORY = `BAHRIA TOWN KARACHI:
Precinct 1 plot 42 250yd demand 98 lacs call Malik Zeeshan 03008291045
P10A plot 1105 125yd west open park facing demand 64 lacs 0333-9128374
P19 villa 350yd plot 88 corner main boulevard demand 1.85 Cr
P31 plot 452 250yd demand 72 lacs - Usman 03221122334
P63 plot 12 125yd demand 35 lac 03456789012

DHA CITY KARACHI:
Sector 3A plot 210 200yd corner park facing demand 78 lacs - Kamran 03219876543
Sector 14B plot 55 125yd west open demand 48 lacs 0312-3456789
Sector 1A Commercial plot 12 200yd demand 3.2 Cr 0300-5551234

DHA KARACHI:
Phase 6 Khayaban-e-Shahbaz plot 142 500yd demand 8.5 Crore - Hashim 03008299887
Phase 8 Zone B plot 921 500yd corner west open demand 12.5 Cr - 03003344556
Phase 2 Ext commercial plot 45-A 100yd demand 3.8 Cr`;

// Toggle this to show/hide the "Add to System" button without removing its logic.
const SHOW_ADD_TO_SYSTEM_BUTTON = false;

export const ImportModal = ({
  isOpen,
  onClose,
  onImportConfirmed
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isAddingToSystem, setIsAddingToSystem] = useState(false);
  const [parseSource, setParseSource] = useState(null);
  if (!isOpen) return null;
  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    setParseSource(null);
    try {
      // Call server endpoint
      const response = await fetch('/api/parse-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: rawText
        })
      });
      const data = await response.json();
      if (data && data.items && data.items.length > 0 && !data.useFallback) {
        // AI parse succeeded
        const formatted = data.items.map((item, idx) => ({
          ...item,
          id: `imported-${Date.now()}-${idx}`,
          status: 'Available',
          createdAt: new Date().toISOString(),
          offers: item.offers || []
        }));
        setParsedItems(formatted);
        setParseSource('ai');
      } else {
        // Client regex fallback parser
        const clientParsed = parseInventoryTextClient(rawText);
        setParsedItems(clientParsed);
        setParseSource('rule');
      }
    } catch (err) {
      // Fallback to client-side rule parser
      const clientParsed = parseInventoryTextClient(rawText);
      setParsedItems(clientParsed);
      setParseSource('rule');
    } finally {
      setIsParsing(false);
    }
  };
  const handleLoadSample = () => {
    setRawText(SAMPLE_RAW_INVENTORY);
  };
  const removeItem = index => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };
  const updateItemField = (index, field, value) => {
    setParsedItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const updated = {
        ...item,
        [field]: value
      };
      if (field === 'society') {
        updated.societyName = value === 'BTK' ? 'Bahria Town Karachi' : value === 'DCK' ? 'DHA City Karachi' : 'DHA Karachi';
      }
      return updated;
    }));
  };
  const finalizeParsedItems = () => parsedItems.map((item, idx) => ({
    id: item.id || `plot-imp-${Date.now()}-${idx}`,
    society: item.society || 'BTK',
    societyName: item.societyName || (item.society === 'DCK' ? 'DHA City Karachi' : item.society === 'DHA' ? 'DHA Karachi' : 'Bahria Town Karachi'),
    location: item.location || 'Precinct 1',
    precinctOrSector: item.precinctOrSector || 'P1',
    plotNumber: item.plotNumber || '101',
    category: item.category || 'Residential',
    sizeSqyd: item.sizeSqyd || 250,
    sizeDisplay: item.sizeDisplay || `${item.sizeSqyd || 250} Sqyd`,
    demandPricePkr: item.demandPricePkr || 5000000,
    demandDisplay: item.demandDisplay || '50 Lacs',
    features: item.features && item.features.length > 0 ? item.features : ['Standard Location'],
    agentName: item.agentName || 'Agent Direct',
    agentPhone: item.agentPhone || '0300-0000000',
    agencyName: item.agencyName || 'Karachi Real Estate',
    status: 'Available',
    notes: item.notes || '',
    rawText: item.rawText || '',
    createdAt: new Date().toISOString(),
    offers: []
  }));
  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;
    const finalized = finalizeParsedItems();
    onImportConfirmed(finalized);
    setRawText('');
    setParsedItems([]);
    onClose();
  };
  const handleAddToSystem = async () => {
    if (parsedItems.length === 0) return;
    setIsAddingToSystem(true);
    try {
      const finalized = finalizeParsedItems();
      await onImportConfirmed(finalized);
      setRawText('');
      setParsedItems([]);
    } finally {
      setIsAddingToSystem(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div id="import-modal-container" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Paste & Auto-Categorize Inventory</h2>
              <p className="text-xs text-slate-400">
                Paste raw WhatsApp text for BTK (P1-P63), DHA City (1A-14B), and DHA (Ph 1-8)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-all">
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Step 1: Text Paste Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clipboard className="w-4 h-4 text-emerald-600" />
                <span>Raw Inventory Paste Box</span>
              </label>

              <button type="button" onClick={handleLoadSample} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Load Sample Karachi Inventory
              </button>
            </div>

            <textarea id="raw-inventory-textarea" value={rawText} onChange={e => setRawText(e.target.value)} rows={6} placeholder={`Paste raw messages copied from WhatsApp or notes...
Example:
BTK Precinct 10A plot 1105 125yd demand 64 lacs 0333-9128374
DCK Sector 3A plot 210 200yd corner demand 78 lacs
DHA Phase 6 plot 142 500yd demand 8.5 Crore`} className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner" />

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-500">
                Supports multiple listings line-by-line or paragraph blocks.
              </p>
              <div className="flex items-center gap-2">
                {SHOW_ADD_TO_SYSTEM_BUTTON && <button id="add-to-system-btn" type="button" onClick={handleAddToSystem} disabled={parsedItems.length === 0 || isAddingToSystem} className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition-all ${parsedItems.length === 0 || isAddingToSystem ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 cursor-pointer'}`}>
                  {isAddingToSystem ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </> : <span>Add to System</span>}
                </button>}

                <button id="process-inventory-btn" onClick={handleParse} disabled={!rawText.trim() || isParsing} className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition-all cursor-pointer ${!rawText.trim() || isParsing ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'}`}>
                  {isParsing ? <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Auto Categorizing...</span>
                    </> : <>
                      <Sparkles className="w-4 h-4" />
                      <span>Auto Categorize Listings</span>
                    </>}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Extracted Preview Table */}
          {parsedItems.length > 0 && <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Extracted Listings ({parsedItems.length} found)
                  </h3>
                  {parseSource && <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${parseSource === 'ai' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-blue-50 text-blue-700 border-blue-300'}`}>
                      {parseSource === 'ai' ? 'Parsed via Gemini AI' : 'Smart Karachi Rule Engine'}
                    </span>}
                </div>
                <span className="text-xs text-slate-500">Review & edit details before importing</span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Society</th>
                      <th className="p-2.5">Precinct / Sector</th>
                      <th className="p-2.5">Plot #</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Demand Price</th>
                      <th className="p-2.5">Agent / Contact</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {parsedItems.map((item, idx) => <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Society */}
                        <td className="p-2">
                          <select value={item.society || 'BTK'} onChange={e => updateItemField(idx, 'society', e.target.value)} className="p-1 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800">
                            <option value="BTK">BTK (Bahria)</option>
                            <option value="DCK">DCK (DHA City)</option>
                            <option value="DHA">DHA Karachi</option>
                          </select>
                        </td>

                        {/* Precinct / Sector */}
                        <td className="p-2">
                          <input type="text" value={item.precinctOrSector || ''} onChange={e => {
                      updateItemField(idx, 'precinctOrSector', e.target.value);
                      updateItemField(idx, 'location', e.target.value);
                    }} className="p-1 w-20 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-900" />
                        </td>

                        {/* Plot # */}
                        <td className="p-2">
                          <input type="text" value={item.plotNumber || ''} onChange={e => updateItemField(idx, 'plotNumber', e.target.value)} className="p-1 w-16 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-900" />
                        </td>

                        {/* Type */}
                        <td className="p-2">
                          <select value={item.category || 'Residential'} onChange={e => updateItemField(idx, 'category', e.target.value)} className="p-1 bg-slate-50 border border-slate-300 rounded text-xs">
                            <option value="Residential">Residential</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Villa">Villa</option>
                            <option value="Apartment">Apartment</option>
                          </select>
                        </td>

                        {/* Size */}
                        <td className="p-2">
                          <input type="number" value={item.sizeSqyd || 250} onChange={e => {
                      const sz = Number(e.target.value);
                      updateItemField(idx, 'sizeSqyd', sz);
                      updateItemField(idx, 'sizeDisplay', `${sz} Sqyd`);
                    }} className="p-1 w-16 bg-slate-50 border border-slate-300 rounded text-xs" />
                          <span className="text-[10px] text-slate-500 ml-1">yd</span>
                        </td>

                        {/* Demand Price */}
                        <td className="p-2">
                          <input type="text" value={item.demandDisplay || ''} onChange={e => updateItemField(idx, 'demandDisplay', e.target.value)} className="p-1 w-24 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-emerald-700" />
                        </td>

                        {/* Contact */}
                        <td className="p-2">
                          <input type="text" value={item.agentPhone || ''} onChange={e => updateItemField(idx, 'agentPhone', e.target.value)} className="p-1 w-28 bg-slate-50 border border-slate-300 rounded text-[11px] font-mono text-slate-700" />
                        </td>

                        {/* Delete */}
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => removeItem(idx)} className="p-1 text-slate-400 hover:text-red-600 rounded transition-all" title="Remove item">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
            Cancel
          </button>

          <button id="confirm-import-btn" onClick={handleConfirmImport} disabled={parsedItems.length === 0} className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition-all cursor-pointer ${parsedItems.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'}`}>
            <Check className="w-4 h-4" />
            <span>Import {parsedItems.length} Listings to Active Inventory</span>
          </button>
        </div>

      </div>
    </div>;
};