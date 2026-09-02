import React, { useState } from 'react';
import { UserPlus, Loader2, Check } from 'lucide-react';
import { registerAgent } from '../api/agents';

const EMPTY_FORM = {
  fullName: '',
  cnicNumber: '',
  contactPhone: '',
  agencyName: '',
  operatingCity: '',
  licenseCredentials: '',
};

const REQUIRED_FIELDS = ['fullName', 'cnicNumber', 'contactPhone', 'agencyName', 'operatingCity'];

export const AgentRegistrationModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = REQUIRED_FIELDS.every(field => form[field].trim().length > 0);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fill in all required fields.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await registerAgent(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div id="agent-registration-modal" className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden my-auto">

        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Agent Registration</h2>
              <p className="text-xs text-slate-400">Submit your details to join the platform</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-all">
            ✕
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Registration Submitted</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your profile has been saved. An admin will review your details and approve your account shortly.
              </p>
            </div>
            <button type="button" onClick={handleClose} className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                {error}
              </div>}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => updateField('fullName', e.target.value)} placeholder="e.g. Malik Zeeshan" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">CNIC / ID Number</label>
              <input type="text" value={form.cnicNumber} onChange={e => updateField('cnicNumber', e.target.value)} placeholder="e.g. 42101-1234567-1" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Contact Phone</label>
              <input type="tel" value={form.contactPhone} onChange={e => updateField('contactPhone', e.target.value)} placeholder="e.g. 0300-1234567" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Agency Name</label>
              <input type="text" value={form.agencyName} onChange={e => updateField('agencyName', e.target.value)} placeholder="e.g. Karachi Real Estate Co." className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Operating City / Location</label>
              <input type="text" value={form.operatingCity} onChange={e => updateField('operatingCity', e.target.value)} placeholder="e.g. Karachi" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">License Credentials <span className="text-slate-400 normal-case font-medium">(Optional)</span></label>
              <input type="text" value={form.licenseCredentials} onChange={e => updateField('licenseCredentials', e.target.value)} placeholder="e.g. Real Estate License #12345" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={handleClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800">
                Cancel
              </button>
              <button type="submit" disabled={!isFormValid || isSubmitting} className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition-all ${!isFormValid || isSubmitting ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 cursor-pointer'}`}>
                {isSubmitting ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </> : <span>Submit Registration</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
