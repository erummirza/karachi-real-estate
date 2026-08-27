import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, Table, Grid3x3, RotateCcw, Check } from 'lucide-react';
const CATEGORIES = ['ALL', 'Residential', 'Commercial', 'Villa', 'Apartment', 'Plot File'];
const SIZES = [{
  label: 'All Sizes',
  value: 'ALL'
}, {
  label: '125 Sqyd',
  value: 125
}, {
  label: '200 Sqyd',
  value: 200
}, {
  label: '250 Sqyd',
  value: 250
}, {
  label: '500 Sqyd',
  value: 500
}, {
  label: '1000 Sqyd (1 Kanal)',
  value: 1000
}, {
  label: '2000 Sqyd (2 Kanal)',
  value: 2000
}];
const COMMON_FEATURES = ['Corner', 'West Open', 'Main Boulevard', 'Park Facing', 'Possession'];
export const FilterBar = ({
  filters,
  viewMode,
  totalFilteredCount,
  onFilterChange,
  onViewModeChange,
  onResetFilters
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const toggleFeature = feature => {
    const current = filters.features;
    if (current.includes(feature)) {
      onFilterChange({
        features: current.filter(f => f !== feature)
      });
    } else {
      onFilterChange({
        features: [...current, feature]
      });
    }
  };
  return <div id="filter-bar" className="bg-slate-50 border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        
        {/* Main Row: Search + Category + View Mode */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input id="search-input" type="text" value={filters.searchQuery} onChange={e => onFilterChange({
            searchQuery: e.target.value
          })} placeholder="Search by Plot #, Precinct (e.g. P10A, Sec 3A, Ph 6), Agent Name or Phone..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-2xs" />
            {filters.searchQuery && <button onClick={() => onFilterChange({
            searchQuery: ''
          })} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>}
          </div>

          {/* Quick Filter Group */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            
            {/* Category Dropdown */}
            <select id="category-filter" value={filters.category} onChange={e => onFilterChange({
            category: e.target.value
          })} className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>)}
            </select>

            {/* Size Dropdown */}
            <select id="size-filter" value={filters.sizeSqyd} onChange={e => onFilterChange({
            sizeSqyd: e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
          })} className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer">
              {SIZES.map(s => <option key={String(s.value)} value={s.value}>
                  {s.label}
                </option>)}
            </select>

            {/* Sort Dropdown */}
            <select id="sort-filter" value={filters.sortBy} onChange={e => onFilterChange({
            sortBy: e.target.value
          })} className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer">
              <option value="date-desc">Newest Added</option>
              <option value="price-asc">Demand: Low to High</option>
              <option value="price-desc">Demand: High to Low</option>
              <option value="plot-asc">Plot Number</option>
            </select>

            {/* Advanced Filters Toggle Button */}
            <button id="toggle-advanced-filters" onClick={() => setShowAdvanced(!showAdvanced)} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${showAdvanced || filters.features.length > 0 ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Features</span>
              {filters.features.length > 0 && <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-white text-emerald-700 rounded-full font-bold">
                  {filters.features.length}
                </span>}
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
              <button id="view-mode-grid" onClick={() => onViewModeChange('grid')} title="Grid Cards View" className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button id="view-mode-table" onClick={() => onViewModeChange('table')} title="Spreadsheet Table View" className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
                <Table className="w-4 h-4" />
              </button>
              <button id="view-mode-matrix" onClick={() => onViewModeChange('matrix')} title="Precinct/Sector Visual Matrix" className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'matrix' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Feature Checkboxes Drawer */}
        {showAdvanced && <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Filter by Plot Features & Tags
              </span>
              <button onClick={onResetFilters} className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Reset All Filters
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {COMMON_FEATURES.map(feat => {
            const isChecked = filters.features.includes(feat);
            return <button key={feat} onClick={() => toggleFeature(feat)} className={`px-3 py-1.5 text-xs rounded-lg font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${isChecked ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                    <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                      {isChecked && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>{feat}</span>
                  </button>;
          })}
            </div>
          </div>}

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <div>
            Showing <strong className="text-slate-900">{totalFilteredCount}</strong> plot listings
            {filters.precinctOrSector !== 'ALL' && <span> in <strong className="text-emerald-700">{filters.precinctOrSector}</strong></span>}
          </div>
          {(filters.searchQuery || filters.category !== 'ALL' || filters.sizeSqyd !== 'ALL' || filters.features.length > 0 || filters.precinctOrSector !== 'ALL') && <button onClick={onResetFilters} className="text-emerald-600 hover:text-emerald-800 font-semibold flex items-center gap-1">
              Clear filters ✕
            </button>}
        </div>

      </div>
    </div>;
};
