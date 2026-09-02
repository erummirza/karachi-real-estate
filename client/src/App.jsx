import React, { useState, useEffect, useMemo } from 'react';
import { matchPrecinctOrSector } from './utils/parser';
import { getPlots, importPlots, submitOffer, updateOfferStatus } from './api/plots';
import { Header } from './components/Header';
import { SocietySelector } from './components/SocietySelector';
import { FilterBar } from './components/FilterBar';
import { PlotCard } from './components/PlotCard';
import { PlotTableView } from './components/PlotTableView';
import { PrecinctMatrixView } from './components/PrecinctMatrixView';
import { ImportModal } from './components/ImportModal';
import { OfferModal } from './components/OfferModal';
import { PlotDetailModal } from './components/PlotDetailModal';
import { WhatsAppExportModal } from './components/WhatsAppExportModal';
import { AgentRegistrationModal } from './components/AgentRegistrationModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Building2, PlusCircle, RotateCcw, HandCoins, Share2, UserPlus, ShieldCheck } from 'lucide-react';
export default function App() {
  // Plots state is loaded from the API (backed by MongoDB) instead of localStorage
  const [plots, setPlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadPlots = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getPlots();
      setPlots(data);
    } catch (e) {
      console.error('Failed to load plots from API:', e);
      setLoadError(e.message || 'Failed to load plots.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch plots from the server on mount
  useEffect(() => {
    loadPlots();
  }, []);

  // Filters state
  const [filters, setFilters] = useState({
    society: 'ALL',
    precinctOrSector: 'ALL',
    category: 'ALL',
    sizeSqyd: 'ALL',
    minPricePkr: 0,
    maxPricePkr: 500000000,
    features: [],
    searchQuery: '',
    status: 'ALL',
    sortBy: 'date-desc'
  });

  // View mode
  const [viewMode, setViewMode] = useState('grid');

  // Modal controls
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAgentRegistrationOpen, setIsAgentRegistrationOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [plotForOffer, setPlotForOffer] = useState(null);
  const [plotForDetail, setPlotForDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = msg => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };
  const handleFilterChange = updates => {
    setFilters(prev => ({
      ...prev,
      ...updates
    }));
  };
  const handleResetFilters = () => {
    setFilters({
      society: 'ALL',
      precinctOrSector: 'ALL',
      category: 'ALL',
      sizeSqyd: 'ALL',
      minPricePkr: 0,
      maxPricePkr: 500000000,
      features: [],
      searchQuery: '',
      status: 'ALL',
      sortBy: 'date-desc'
    });
  };

  // Import confirmed callback - persists new plots to MongoDB via the API
  const handleImportConfirmed = async newItems => {
    try {
      const inserted = await importPlots(newItems);
      setPlots(prev => [...inserted, ...prev]);
      showToast(`Successfully imported ${inserted.length} plot listings!`);
    } catch (e) {
      console.error('Failed to import plots:', e);
      showToast(e.message || 'Failed to import plots. Please try again.');
    }
  };

  // Submit offer callback - persists the offer to MongoDB via the API
  const handleSubmitOffer = async (plotId, offer) => {
    try {
      const updatedPlot = await submitOffer(plotId, offer);
      setPlots(prev => prev.map(p => p.id === plotId ? updatedPlot : p));
      showToast(`Offer of ${offer.offeredDisplay} submitted!`);
    } catch (e) {
      console.error('Failed to submit offer:', e);
      showToast(e.message || 'Failed to submit offer. Please try again.');
    }
  };

  // Update offer status - persists the change to MongoDB via the API
  const handleUpdateOfferStatus = async (plotId, offerId, status) => {
    try {
      const updatedPlot = await updateOfferStatus(plotId, offerId, status);
      setPlots(prev => prev.map(p => p.id === plotId ? updatedPlot : p));
      if (plotForDetail && plotForDetail.id === plotId) {
        setPlotForDetail(updatedPlot);
      }
      showToast(`Offer marked as ${status}`);
    } catch (e) {
      console.error('Failed to update offer status:', e);
      showToast(e.message || 'Failed to update offer. Please try again.');
    }
  };

  // Admin login success - opens the admin panel
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
  };

  // Admin logout - closes the panel and clears the session
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminPanelOpen(false);
  };

  // Share on WhatsApp
  const handleShareWhatsApp = plot => {
    const text = `🏡 *Karachi Real Estate Listing*\n\n📍 *${plot.societyName}* (${plot.precinctOrSector})\n• Plot #${plot.plotNumber} | ${plot.sizeDisplay} (${plot.category})\n• Demand: *${plot.demandDisplay}*\n• Agent: ${plot.agentName} (${plot.agentPhone})\n\nContact for details & token!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered and Sorted Plots
  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      // Society
      if (filters.society !== 'ALL' && plot.society !== filters.society) {
        return false;
      }

      // Precinct / Sector / Phase
      if (filters.precinctOrSector !== 'ALL') {
        if (!matchPrecinctOrSector(filters.precinctOrSector, plot.precinctOrSector, plot.location)) {
          return false;
        }
      }

      // Category
      if (filters.category !== 'ALL' && plot.category !== filters.category) {
        return false;
      }

      // Size
      if (filters.sizeSqyd !== 'ALL' && plot.sizeSqyd !== filters.sizeSqyd) {
        return false;
      }

      // Features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feat => (plot.features || []).some(pf => pf.toLowerCase().includes(feat.toLowerCase())));
        if (!hasAllFeatures) return false;
      }

      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesPlot = (plot.plotNumber || '').toLowerCase().includes(q);
        const matchesLocation = (plot.location || '').toLowerCase().includes(q);
        const matchesPrecinct = (plot.precinctOrSector || '').toLowerCase().includes(q);
        const matchesAgent = (plot.agentName || '').toLowerCase().includes(q);
        const matchesPhone = (plot.agentPhone || '').toLowerCase().includes(q);
        const matchesSociety = (plot.societyName || '').toLowerCase().includes(q);
        if (!matchesPlot && !matchesLocation && !matchesPrecinct && !matchesAgent && !matchesPhone && !matchesSociety) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') {
        return (a.demandPricePkr || 0) - (b.demandPricePkr || 0);
      } else if (filters.sortBy === 'price-desc') {
        return (b.demandPricePkr || 0) - (a.demandPricePkr || 0);
      } else if (filters.sortBy === 'plot-asc') {
        return (a.plotNumber || '').localeCompare(b.plotNumber || '', undefined, {
          numeric: true
        });
      }
      // date-desc default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [plots, filters]);

  // Loading state - shown while the initial GET /api/plots request is in flight
  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-semibold">Loading plot inventory…</p>
      </div>;
  }

  // Error state - shown if the initial load failed (e.g. MongoDB/server unreachable)
  if (loadError) {
    return <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div>
          <h3 className="text-base font-bold text-slate-800">Couldn't load plot inventory</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">{loadError}</p>
        </div>
        <button onClick={loadPlots} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          Retry
        </button>
      </div>;
  }
  return <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>}

      {/* Header */}
      <Header plots={plots} onOpenImport={() => setIsImportOpen(true)} onOpenExport={() => setIsExportOpen(true)} />

      {/* Society Quick Selector */}
      <SocietySelector selectedSociety={filters.society} selectedPrecinctOrSector={filters.precinctOrSector} plots={plots} onSelectSociety={soc => handleFilterChange({
      society: soc,
      precinctOrSector: 'ALL'
    })} onSelectPrecinctOrSector={val => handleFilterChange({
      precinctOrSector: val
    })} />

      {/* Search & Filter Bar */}
      <FilterBar filters={filters} viewMode={viewMode} totalFilteredCount={filteredPlots.length} onFilterChange={handleFilterChange} onViewModeChange={setViewMode} onResetFilters={handleResetFilters} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* View render */}
        {filteredPlots.length === 0 ? <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <div className="p-3 bg-slate-100 rounded-2xl w-fit mx-auto text-slate-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Plot Listings Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                No inventory matches your current search criteria or precinct filter. Try clearing filters or pasting new inventory listings.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={handleResetFilters} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all">
                Reset All Filters
              </button>
              <button onClick={() => setIsImportOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Paste Inventory</span>
              </button>
            </div>
          </div> : viewMode === 'grid' ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlots.map(plot => <PlotCard key={plot.id} plot={plot} onMakeOffer={p => setPlotForOffer(p)} onViewDetail={p => setPlotForDetail(p)} onShareWhatsApp={handleShareWhatsApp} />)}
          </div> : viewMode === 'table' ? <PlotTableView plots={filteredPlots} onMakeOffer={p => setPlotForOffer(p)} onViewDetail={p => setPlotForDetail(p)} onShareWhatsApp={handleShareWhatsApp} /> : <PrecinctMatrixView plots={filteredPlots} selectedSociety={filters.society} onMakeOffer={p => setPlotForOffer(p)} onViewDetail={p => setPlotForDetail(p)} />}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-200">Karachi Real Estate Agent Hub</span>
            <p className="text-[11px] text-slate-500">
              Bahria Town Karachi (Precincts 1–63) • DHA City Karachi (Sectors 1A–14B) • DHA Karachi (Phases 1–8)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsImportOpen(true)} className="text-emerald-400 hover:underline font-semibold">
              + Paste Raw Inventory
            </button>
            <span>•</span>
            <button onClick={() => setIsExportOpen(true)} className="text-slate-300 hover:underline font-semibold">
              Export WhatsApp Message
            </button>
            <span>•</span>
            <button id="register-agent-btn" onClick={() => setIsAgentRegistrationOpen(true)} className="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register as Agent</span>
            </button>
            <span>•</span>
            <button id="admin-login-btn" onClick={() => isAdminAuthenticated ? setIsAdminPanelOpen(true) : setIsAdminLoginOpen(true)} className="text-amber-400 hover:underline font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportConfirmed={handleImportConfirmed} />

      <OfferModal plot={plotForOffer} isOpen={!!plotForOffer} onClose={() => setPlotForOffer(null)} onSubmitOffer={handleSubmitOffer} />

      <PlotDetailModal plot={plotForDetail} isOpen={!!plotForDetail} onClose={() => setPlotForDetail(null)} onMakeOffer={p => {
      setPlotForDetail(null);
      setPlotForOffer(p);
    }} onShareWhatsApp={handleShareWhatsApp} onUpdateOfferStatus={handleUpdateOfferStatus} />

      <WhatsAppExportModal plots={filteredPlots} isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      <AgentRegistrationModal isOpen={isAgentRegistrationOpen} onClose={() => setIsAgentRegistrationOpen(false)} />

      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLoginSuccess={handleAdminLoginSuccess} />

      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} onLogout={handleAdminLogout} />

    </div>;
}
