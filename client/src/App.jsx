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
import { AgentSignupModal } from './components/AgentSignupModal';
import { AgentLoginModal } from './components/AgentLoginModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { Building2, PlusCircle, RotateCcw, HandCoins, Share2, UserPlus, ShieldCheck, KeyRound, LogIn, Lock } from 'lucide-react';
export default function App() {
  // Admin's full inventory - only ever fetched once an admin is authenticated
  const [plots, setPlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Fetch the full inventory only once an admin has logged in
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadPlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Agent's own inventory - only the listings THEY added, never anyone else's
  const [agentPlots, setAgentPlots] = useState([]);
  const [isAgentPlotsLoading, setIsAgentPlotsLoading] = useState(false);
  const [agentPlotsError, setAgentPlotsError] = useState(null);

  const loadAgentPlots = async agentId => {
    setIsAgentPlotsLoading(true);
    setAgentPlotsError(null);
    try {
      const data = await getPlots(agentId);
      setAgentPlots(data);
    } catch (e) {
      console.error('Failed to load agent plots:', e);
      setAgentPlotsError(e.message || 'Failed to load your listings.');
    } finally {
      setIsAgentPlotsLoading(false);
    }
  };

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
  const [isAgentSignupOpen, setIsAgentSignupOpen] = useState(false);
  const [isAgentLoginOpen, setIsAgentLoginOpen] = useState(false);
  const [loggedInAgent, setLoggedInAgent] = useState(null);
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

  // Import confirmed callback - routes to the admin's full inventory or the
  // logged-in agent's own inventory depending on who is currently active.
  const handleImportConfirmed = async newItems => {
    try {
      if (isAdminAuthenticated) {
        const inserted = await importPlots(newItems);
        setPlots(prev => [...inserted, ...prev]);
        showToast(`Successfully imported ${inserted.length} plot listings!`);
      } else if (loggedInAgent) {
        const inserted = await importPlots(newItems, {
          ownerAgentId: loggedInAgent.id,
          ownerAgentName: loggedInAgent.fullName
        });
        setAgentPlots(prev => [...inserted, ...prev]);
        showToast(`Added ${inserted.length} listing(s) to your inventory!`);
      }
    } catch (e) {
      console.error('Failed to import plots:', e);
      showToast(e.message || 'Failed to import plots. Please try again.');
    }
  };

  // Applies an updated plot to whichever list currently holds it (admin's
  // full list and/or the logged-in agent's own list).
  const applyPlotUpdate = updatedPlot => {
    setPlots(prev => prev.some(p => p.id === updatedPlot.id) ? prev.map(p => p.id === updatedPlot.id ? updatedPlot : p) : prev);
    setAgentPlots(prev => prev.some(p => p.id === updatedPlot.id) ? prev.map(p => p.id === updatedPlot.id ? updatedPlot : p) : prev);
  };

  // Submit offer callback - persists the offer to MongoDB via the API
  const handleSubmitOffer = async (plotId, offer) => {
    try {
      const updatedPlot = await submitOffer(plotId, offer);
      applyPlotUpdate(updatedPlot);
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
      applyPlotUpdate(updatedPlot);
      if (plotForDetail && plotForDetail.id === plotId) {
        setPlotForDetail(updatedPlot);
      }
      showToast(`Offer marked as ${status}`);
    } catch (e) {
      console.error('Failed to update offer status:', e);
      showToast(e.message || 'Failed to update offer. Please try again.');
    }
  };

  // Admin login success - fetches the full inventory and opens the admin panel
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
    loadPlots();
  };

  // Admin logout - closes the panel and clears the session (and its inventory)
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminPanelOpen(false);
    setPlots([]);
  };

  // Agent login success - stores the logged-in agent, closes the modal, and
  // fetches ONLY that agent's own listings
  const handleAgentLoginSuccess = agent => {
    setLoggedInAgent(agent);
    setIsAgentLoginOpen(false);
    showToast(`Welcome back, ${agent.fullName}!`);
    loadAgentPlots(agent.id);
  };

  // Agent logout - clears the logged-in agent and their listings from state
  const handleAgentLogout = () => {
    setLoggedInAgent(null);
    setAgentPlots([]);
    showToast('Signed out successfully.');
  };

  // Share on WhatsApp
  const handleShareWhatsApp = plot => {
    const text = `🏡 *Karachi Real Estate Listing*\n\n📍 *${plot.societyName}* (${plot.precinctOrSector})\n• Plot #${plot.plotNumber} | ${plot.sizeDisplay} (${plot.category})\n• Demand: *${plot.demandDisplay}*\n• Agent: ${plot.agentName} (${plot.agentPhone})\n\nContact for details & token!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Filtered and Sorted Plots (admin view only)
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

  return <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">

      {/* Toast Notification */}
      {toastMessage && <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>}

      {isAdminAuthenticated ? <>
          {/* ===================== ADMIN VIEW: full inventory ===================== */}

          {isLoading ? <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
              <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 font-semibold">Loading plot inventory…</p>
            </div> : loadError ? <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center py-24">
              <div>
                <h3 className="text-base font-bold text-slate-800">Couldn't load plot inventory</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">{loadError}</p>
              </div>
              <button onClick={loadPlots} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                Retry
              </button>
            </div> : <>
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
            </>}

          {/* Footer (full - admin is signed in) */}
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-bold text-slate-200">Karachi Real Estate Agent Hub</span>
                <p className="text-[11px] text-slate-500">
                  Bahria Town Karachi (Precincts 1–63) • DHA City Karachi (Sectors 1A–14B) • DHA Karachi (Phases 1–8)
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center">
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
                <button id="admin-login-btn" onClick={() => setIsAdminPanelOpen(true)} className="text-amber-400 hover:underline font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>
          </footer>
        </> : loggedInAgent ? <>
          {/* ===================== AGENT DASHBOARD: only their own listings ===================== */}
          <div className="border-b border-slate-800 bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold">My Inventory</h1>
                  <p className="text-[11px] text-slate-400">Signed in as {loggedInAgent.fullName} ({loggedInAgent.contactPhone})</p>
                </div>
              </div>
              <button onClick={handleAgentLogout} className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all">
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Your Listings</h2>
                <p className="text-xs text-slate-500">Only plots you've added are shown here.</p>
              </div>
              <button onClick={() => setIsImportOpen(true)} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>Paste Raw Inventory</span>
              </button>
            </div>

            {isAgentPlotsLoading ? <div className="flex flex-col items-center justify-center gap-3 py-24">
                <div className="w-8 h-8 border-4 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-semibold">Loading your listings…</p>
              </div> : agentPlotsError ? <div className="flex flex-col items-center justify-center gap-4 px-6 text-center py-16">
                <p className="text-xs text-red-600">{agentPlotsError}</p>
                <button onClick={() => loadAgentPlots(loggedInAgent.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                  Retry
                </button>
              </div> : agentPlots.length === 0 ? <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-16 text-center space-y-4">
                <div className="p-3 bg-slate-100 rounded-2xl w-fit mx-auto text-slate-400">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">No Listings Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    You haven't added any inventory yet. Click "Paste Raw Inventory" above to add your first listing.
                  </p>
                </div>
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentPlots.map(plot => <PlotCard key={plot.id} plot={plot} onMakeOffer={p => setPlotForOffer(p)} onViewDetail={p => setPlotForDetail(p)} onShareWhatsApp={handleShareWhatsApp} />)}
              </div>}
          </main>

          <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-[11px] py-4 text-center">
            Karachi Real Estate Agent Hub
          </footer>
        </> : <>
          {/* ===================== PUBLIC LANDING: not logged in at all ===================== */}
          <div className="border-b border-slate-800 bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold">Karachi Estate Hub</h1>
                <p className="text-[11px] text-slate-400">Agent &amp; Admin Portal</p>
              </div>
            </div>
          </div>

          <main className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xs p-8 text-center space-y-5">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Inventory Access Restricted</h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  Plot inventory is only visible to the admin. Agents get their own inventory dashboard after signing in. Please sign in below.
                </p>
              </div>

              <button onClick={() => setIsAdminLoginOpen(true)} className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Login</span>
              </button>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button id="register-agent-btn" onClick={() => setIsAgentRegistrationOpen(true)} className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  <span>Register as Agent</span>
                </button>
                <button id="agent-signup-btn" onClick={() => setIsAgentSignupOpen(true)} className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Sign Up as Agent</span>
                </button>
                <button id="agent-login-btn" onClick={() => setIsAgentLoginOpen(true)} className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                  <LogIn className="w-4 h-4" />
                  <span>Agent Sign In</span>
                </button>
              </div>
            </div>
          </main>

          <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-[11px] py-4 text-center">
            Karachi Real Estate Agent Hub
          </footer>
        </>}

      {/* Modals - available regardless of access state */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportConfirmed={handleImportConfirmed} />

      <OfferModal plot={plotForOffer} isOpen={!!plotForOffer} onClose={() => setPlotForOffer(null)} onSubmitOffer={handleSubmitOffer} />

      <PlotDetailModal plot={plotForDetail} isOpen={!!plotForDetail} onClose={() => setPlotForDetail(null)} onMakeOffer={p => {
      setPlotForDetail(null);
      setPlotForOffer(p);
    }} onShareWhatsApp={handleShareWhatsApp} onUpdateOfferStatus={handleUpdateOfferStatus} />

      <WhatsAppExportModal plots={isAdminAuthenticated ? filteredPlots : agentPlots} isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      <AgentRegistrationModal isOpen={isAgentRegistrationOpen} onClose={() => setIsAgentRegistrationOpen(false)} />

      <AgentSignupModal isOpen={isAgentSignupOpen} onClose={() => setIsAgentSignupOpen(false)} onSwitchToLogin={() => setIsAgentLoginOpen(true)} />

      <AgentLoginModal isOpen={isAgentLoginOpen} onClose={() => setIsAgentLoginOpen(false)} onLoginSuccess={handleAgentLoginSuccess} onSwitchToSignup={() => setIsAgentSignupOpen(true)} />

      <AdminLoginModal isOpen={isAdminLoginOpen} onClose={() => setIsAdminLoginOpen(false)} onLoginSuccess={handleAdminLoginSuccess} />

      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} onLogout={handleAdminLogout} />

    </div>;
}
