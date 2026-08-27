import React, { useState } from 'react';
import { Copy, Check, Share2, MessageSquare } from 'lucide-react';
export const WhatsAppExportModal = ({
  plots,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  // Format listings for WhatsApp
  const generateMessage = () => {
    let msg = `🔥 *KARACHI REAL ESTATE AGENT INVENTORY* 🔥\n`;
    msg += `-----------------------------------------\n\n`;
    const btkPlots = plots.filter(p => p.society === 'BTK');
    const dckPlots = plots.filter(p => p.society === 'DCK');
    const dhaPlots = plots.filter(p => p.society === 'DHA');
    if (btkPlots.length > 0) {
      msg += `🏡 *BAHRIA TOWN KARACHI (BTK)*\n`;
      btkPlots.forEach(p => {
        msg += `• *${p.precinctOrSector}* Plot #${p.plotNumber} | ${p.sizeDisplay} (${p.category})\n`;
        msg += `  Demand: *${p.demandDisplay}* | Contact: ${p.agentPhone}\n`;
      });
      msg += `\n`;
    }
    if (dckPlots.length > 0) {
      msg += `🏙️ *DHA CITY KARACHI (DCK)*\n`;
      dckPlots.forEach(p => {
        msg += `• *Sector ${p.precinctOrSector}* Plot #${p.plotNumber} | ${p.sizeDisplay}\n`;
        msg += `  Demand: *${p.demandDisplay}* | Contact: ${p.agentPhone}\n`;
      });
      msg += `\n`;
    }
    if (dhaPlots.length > 0) {
      msg += `🏛️ *DHA KARACHI*\n`;
      dhaPlots.forEach(p => {
        msg += `• *${p.precinctOrSector}* Plot #${p.plotNumber} | ${p.sizeDisplay}\n`;
        msg += `  Demand: *${p.demandDisplay}* | Contact: ${p.agentPhone}\n`;
      });
      msg += `\n`;
    }
    msg += `-----------------------------------------\n`;
    msg += `📲 *Direct Inquiries & Offers Welcome*`;
    return msg;
  };
  const messageText = generateMessage();
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div id="whatsapp-export-modal-container" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">WhatsApp Broadcast Formatter</h2>
              <p className="text-xs text-slate-400">
                Copy formatted text snippet for WhatsApp agent groups
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Text Preview Box */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Formatted Broadcast Message ({plots.length} items)
            </span>

            <button id="copy-whatsapp-text-btn" onClick={handleCopy} className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${copied ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'}`}>
              {copied ? <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </> : <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Message</span>
                </>}
            </button>
          </div>

          <textarea readOnly value={messageText} rows={12} className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none shadow-inner" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl">
            Done
          </button>
        </div>

      </div>
    </div>;
};
