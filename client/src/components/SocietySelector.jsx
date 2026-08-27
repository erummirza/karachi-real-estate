import React from 'react';
import { MapPin, Building, Home, CheckCircle2 } from 'lucide-react';
import { matchPrecinctOrSector } from '../utils/parser';
// Generate lists of Precincts, Sectors, and Phases
const BTK_PRECINCTS = Array.from({
  length: 63
}, (_, i) => `P${i + 1}`);
// Include popular sub-precincts
['P10A', 'P11A', 'P15A', 'P19A', 'P27A', 'P35A'].forEach(p => {
  if (!BTK_PRECINCTS.includes(p)) BTK_PRECINCTS.splice(10, 0, p);
});
const DCK_SECTORS = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B', '11A', '11B', '12A', '12B', '13A', '13B', '14A', '14B'];
const DHA_PHASES = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5', 'Phase 6', 'Phase 7', 'Phase 8', 'Phase 8 Ext'];
export const SocietySelector = ({
  selectedSociety,
  selectedPrecinctOrSector,
  plots,
  onSelectSociety,
  onSelectPrecinctOrSector
}) => {
  // Calculate plot counts per precinct/sector
  const getCountForPrecinct = (precinctKey, soc) => {
    return plots.filter(p => {
      if (p.society !== soc) return false;
      return matchPrecinctOrSector(precinctKey, p.precinctOrSector, p.location);
    }).length;
  };
  const btkPlotsCount = plots.filter(p => p.society === 'BTK').length;
  const dckPlotsCount = plots.filter(p => p.society === 'DCK').length;
  const dhaPlotsCount = plots.filter(p => p.society === 'DHA').length;
  return <div id="society-selector" className="bg-white border-b border-slate-200 shadow-xs py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Main Society Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          
          <button id="tab-all-societies" onClick={() => {
          onSelectSociety('ALL');
          onSelectPrecinctOrSector('ALL');
        }} className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${selectedSociety === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Societies</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${selectedSociety === 'ALL' ? 'bg-slate-800 text-emerald-300' : 'bg-slate-200 text-slate-600'}`}>
              {plots.length}
            </span>
          </button>

          <button id="tab-btk-society" onClick={() => {
          onSelectSociety('BTK');
          onSelectPrecinctOrSector('ALL');
        }} className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${selectedSociety === 'BTK' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Building className="w-3.5 h-3.5" />
            <span>Bahria Town Karachi</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${selectedSociety === 'BTK' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'}`}>
              P1–P63 ({btkPlotsCount})
            </span>
          </button>

          <button id="tab-dck-society" onClick={() => {
          onSelectSociety('DCK');
          onSelectPrecinctOrSector('ALL');
        }} className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${selectedSociety === 'DCK' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <MapPin className="w-3.5 h-3.5" />
            <span>DHA City Karachi</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${selectedSociety === 'DCK' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}`}>
              Sectors 1A–14B ({dckPlotsCount})
            </span>
          </button>

          <button id="tab-dha-society" onClick={() => {
          onSelectSociety('DHA');
          onSelectPrecinctOrSector('ALL');
        }} className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${selectedSociety === 'DHA' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Building className="w-3.5 h-3.5" />
            <span>DHA Karachi</span>
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${selectedSociety === 'DHA' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-600'}`}>
              Phase 1–8 ({dhaPlotsCount})
            </span>
          </button>

        </div>

        {/* Sub-selector for specific Precincts/Sectors when a society is active */}
        {selectedSociety !== 'ALL' && <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                {selectedSociety === 'BTK' && 'Filter Precincts (P1 to P63)'}
                {selectedSociety === 'DCK' && 'Filter DHA City Sectors (1A to 14B)'}
                {selectedSociety === 'DHA' && 'Filter DHA Phases (Phase 1 to Phase 8)'}
              </span>
              {selectedPrecinctOrSector !== 'ALL' && <button onClick={() => onSelectPrecinctOrSector('ALL')} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium underline">
                  Show All {selectedSociety}
                </button>}
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              
              <button onClick={() => onSelectPrecinctOrSector('ALL')} className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${selectedPrecinctOrSector === 'ALL' ? 'bg-slate-900 text-white font-semibold' : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'}`}>
                All {selectedSociety}
              </button>

              {selectedSociety === 'BTK' && BTK_PRECINCTS.map(precinctKey => {
            const count = getCountForPrecinct(precinctKey, 'BTK');
            const isSelected = selectedPrecinctOrSector.toLowerCase() === precinctKey.toLowerCase();
            return <button key={precinctKey} onClick={() => onSelectPrecinctOrSector(precinctKey)} className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${isSelected ? 'bg-emerald-600 text-white font-bold shadow-xs' : count > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    <span>{precinctKey}</span>
                    {count > 0 && <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${isSelected ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900 font-bold'}`}>
                        {count}
                      </span>}
                  </button>;
          })}

              {selectedSociety === 'DCK' && DCK_SECTORS.map(secKey => {
            const count = getCountForPrecinct(secKey, 'DCK');
            const isSelected = selectedPrecinctOrSector.toLowerCase() === secKey.toLowerCase();
            return <button key={secKey} onClick={() => onSelectPrecinctOrSector(secKey)} className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${isSelected ? 'bg-blue-600 text-white font-bold shadow-xs' : count > 0 ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-semibold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    <span>Sector {secKey}</span>
                    {count > 0 && <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${isSelected ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-900 font-bold'}`}>
                        {count}
                      </span>}
                  </button>;
          })}

              {selectedSociety === 'DHA' && DHA_PHASES.map(phKey => {
            const count = getCountForPrecinct(phKey, 'DHA');
            const isSelected = selectedPrecinctOrSector.toLowerCase() === phKey.toLowerCase();
            return <button key={phKey} onClick={() => onSelectPrecinctOrSector(phKey)} className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 cursor-pointer ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-xs' : count > 0 ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 font-semibold' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    <span>{phKey}</span>
                    {count > 0 && <span className={`px-1.5 py-0.2 text-[10px] rounded-md ${isSelected ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-indigo-900 font-bold'}`}>
                        {count}
                      </span>}
                  </button>;
          })}

            </div>
          </div>}

      </div>
    </div>;
};
