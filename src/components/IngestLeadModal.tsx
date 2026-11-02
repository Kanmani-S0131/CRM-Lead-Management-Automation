import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { X, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import {
  SOURCE_POINTS,
  REGIONS,
  TIMELINE_POINTS,
  cleanPhone,
} from '../utils/crmEngine';
import { Region } from '../types/crm';

interface IngestLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IngestLeadModal: React.FC<IngestLeadModalProps> = ({ isOpen, onClose }) => {
  const { ingestSingleLead, asOfDate, setSelectedLeadId } = useCRM();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: 'Technology',
    source: 'Referral',
    region: 'North' as Region,
    created_date: asOfDate,
    budget: 600000,
    company_size: 40,
    timeline: '1-3 Months',
    website_visits: 4,
    emails_opened: 3,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const phoneValid = cleanPhone(form.phone) !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = ingestSingleLead(form);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Ingest Inbound Lead (Module 1 Validated)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Must satisfy DIT-P06 validation rules: 10-digit Indian phone, valid email, source & region.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Full Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. Diya Nair"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Kaveri Agro"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Work Email *</label>
              <input
                required
                type="email"
                placeholder="diya.nair@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Indian Phone *</label>
                <span className={`text-[10px] font-mono ${phoneValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {phoneValid ? '✓ Valid Mobile' : '[6-9] + 9 digits'}
                </span>
              </div>
              <input
                required
                type="text"
                placeholder="+91 9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Acquisition Source *</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              >
                {Object.keys(SOURCE_POINTS).map((s) => (
                  <option key={s} value={s}>{s} (+{SOURCE_POINTS[s]} pts)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Region *</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value as Region })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Budget (INR) *</label>
              <input
                required
                type="number"
                min={0}
                step={50000}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Company Size</label>
              <input
                type="number"
                min={1}
                value={form.company_size}
                onChange={(e) => setForm({ ...form, company_size: Number(e.target.value) })}
                className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Timeline</label>
              <select
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              >
                {Object.keys(TIMELINE_POINTS).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Visits</label>
              <input
                type="number"
                min={0}
                value={form.website_visits}
                onChange={(e) => setForm({ ...form, website_visits: Number(e.target.value) })}
                className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Emails</label>
              <input
                type="number"
                min={0}
                value={form.emails_opened}
                onChange={(e) => setForm({ ...form, emails_opened: Number(e.target.value) })}
                className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="p-4 px-6 -mx-6 -mb-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Validate & Process Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
