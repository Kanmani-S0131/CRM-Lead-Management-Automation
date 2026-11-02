import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { LeadStatus } from '../types/crm';
import {
  X,
  Building,
  Mail,
  Phone,
  User,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { VALID_STATUSES, REPS } from '../utils/crmEngine';

export const LeadDetailDrawer: React.FC = () => {
  const {
    selectedLead,
    setSelectedLeadId,
    updateLeadStatus,
    assignLeadOwner,
    addLeadNote,
  } = useCRM();

  const [newNote, setNewNote] = useState('');

  if (!selectedLead) return null;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addLeadNote(selectedLead.lead_id, newNote);
    setNewNote('');
  };

  const bd = selectedLead.score_breakdown;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedLeadId(null)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400 font-semibold">
                {selectedLead.lead_id}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {selectedLead.name}
              </h2>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedLead.company}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedLead.industry}</span>
              <span aria-hidden="true">·</span>
              <span>{selectedLead.region} Region</span>
            </div>
          </div>

          <button
            onClick={() => setSelectedLeadId(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Status & Assignment Quick Strip */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-slate-500 font-medium mb-1">Lead Status</label>
              <select
                value={selectedLead.status}
                onChange={(e) => updateLeadStatus(selectedLead.lead_id, e.target.value as LeadStatus)}
                className="w-full py-1 px-2 font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
              >
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">Owner Assigned</label>
              <div className="py-1 px-2 font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 truncate">
                {selectedLead.owner}
              </div>
            </div>
          </div>

          {/* SLA Alert Banner if breached */}
          {selectedLead.sla_breached && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2.5 text-red-800 dark:text-red-300">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  SLA Breached: Overdue by {selectedLead.days_overdue} days
                </div>
                <div className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">
                  Follow-up due date was {selectedLead.follow_up_due}. Change status to <strong>Contacted</strong> once first touch is completed.
                </div>
              </div>
            </div>
          )}

          {/* Contact & Deal Profile */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-[11px]">
              Contact & Lead Profile
            </h3>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 select-all font-medium">
                  {selectedLead.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Verified Phone:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 select-all font-medium">
                  +91 {selectedLead.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Budget (INR):</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">
                  {formatINR(selectedLead.budget)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Company Size:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                  {selectedLead.company_size} employees
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Acquisition Source:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedLead.source}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Purchase Timeline:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedLead.timeline}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Engagement:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedLead.website_visits} visits · {selectedLead.emails_opened} opened
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Created Date:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedLead.created_date}
                </span>
              </div>
            </div>
          </div>

          {/* Module 3 Scoring Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-[11px]">
                Deterministic Lead Score Breakdown
              </h3>
              <span className="font-mono tabular-nums font-bold text-sm text-slate-900 dark:text-slate-100">
                {selectedLead.lead_score}/100 ({selectedLead.grade})
              </span>
            </div>

            {bd && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[11px] divide-y divide-slate-100 dark:divide-slate-800">
                <div className="py-1 flex justify-between">
                  <span className="text-slate-500 font-sans">1. Source ({selectedLead.source}):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">+{bd.sourcePts} pts</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span className="text-slate-500 font-sans">2. Budget ({formatINR(selectedLead.budget)}):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">+{bd.budgetPts} pts</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span className="text-slate-500 font-sans">3. Company Size ({selectedLead.company_size}):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">+{bd.sizePts} pts</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span className="text-slate-500 font-sans">4. Purchase Timeline ({selectedLead.timeline}):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">+{bd.timelinePts} pts</span>
                </div>
                <div className="py-1 flex justify-between">
                  <span className="text-slate-500 font-sans">5. Engagement ({selectedLead.website_visits}v, {selectedLead.emails_opened}e):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">+{bd.engagementPts} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Internal Sales Notes</span>
            </h3>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log call notes, customer objections, or next steps..."
                rows={2}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="px-3 py-1 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded disabled:opacity-50"
                >
                  Save Note
                </button>
              </div>
            </form>

            <div className="space-y-1.5 mt-2">
              {(selectedLead.notes || []).map((n) => (
                <div key={n.id} className="p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{n.author}</span>
                    <span>{n.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-800 dark:text-slate-200">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
