import React from 'react';
import { useCRM } from '../context/CRMContext';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  UserCheck,
  Building,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SLA_DAYS } from '../utils/crmEngine';

export const SlaMonitor: React.FC = () => {
  const {
    processedLeads,
    summaries,
    asOfDate,
    setAsOfDate,
    updateLeadStatus,
    setSelectedLeadId,
  } = useCRM();

  const openLeads = processedLeads.filter((l) => ['New', 'Contacted', 'Qualified'].includes(l.status));
  const newLeads = processedLeads.filter((l) => l.status === 'New');
  const breachedLeads = summaries.slaBreaches;

  const maxOverdue = breachedLeads.length > 0 ? breachedLeads[0].days_overdue : 0;

  return (
    <div className="space-y-6">
      {/* SLA Overview Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Module 5: Follow-up Due Dates & SLA Breach Command
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              First-response SLA applies to leads in status <strong>New</strong>. Hot leads require contact within 1 day, Warm within 3 days, and Cold within 7 days from creation date.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Reference as_of Date:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="py-1 px-2.5 font-mono text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* SLA Rule Cards Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded">
            <div className="text-red-700 dark:text-red-400 font-medium">Active SLA Breaches</div>
            <div className="font-mono tabular-nums text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5">
              {breachedLeads.length} leads
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Requires immediate SDR attention
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded">
            <div className="text-slate-500">Max Overdue Days</div>
            <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              +{maxOverdue} days
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Relative to {asOfDate}
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded">
            <div className="text-slate-500">Pending "New" Triage</div>
            <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {newLeads.length} leads
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Subject to SLA countdown
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded">
            <div className="text-slate-500">Total Open Pipeline</div>
            <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {openLeads.length} leads
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              New + Contacted + Qualified
            </div>
          </div>
        </div>

        {/* SLA Formula Reference */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700 dark:text-slate-300">SLA Standard:</span>
          <span>Hot (≥70 pts): <strong>1 Day</strong></span>
          <span aria-hidden="true">·</span>
          <span>Warm (40-69 pts): <strong>3 Days</strong></span>
          <span aria-hidden="true">·</span>
          <span>Cold (&lt;40 pts): <strong>7 Days</strong></span>
          <span aria-hidden="true">·</span>
          <span className="text-slate-400">Advancing status to 'Contacted' marks SLA satisfied.</span>
        </div>
      </div>

      {/* Breached Leads Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Overdue SLA Breaches ({breachedLeads.length} records)</span>
          </h3>
          <span className="text-xs text-slate-400">Sorted by days overdue descending</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold select-none">
                  <th className="py-2.5 px-3">Lead ID</th>
                  <th className="py-2.5 px-3">Contact & Company</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Owner Rep</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3">Follow-up Due</th>
                  <th className="py-2.5 px-3 text-red-600 font-bold">Days Overdue</th>
                  <th className="py-2.5 px-3 text-center">Fast-Track Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {breachedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">All SLAs Satisfied</span>
                        <span className="text-xs">No overdue first-response breaches on record for {asOfDate}.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  breachedLeads.map((lead) => (
                    <tr
                      key={lead.lead_id}
                      onClick={() => setSelectedLeadId(lead.lead_id)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {lead.lead_id}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{lead.company}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {lead.region}
                      </td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={lead.grade === 'Hot' ? 'text-emerald-600 font-bold' : lead.grade === 'Warm' ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                          {lead.grade} ({lead.lead_score})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {lead.owner}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {lead.created_date}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {lead.follow_up_due}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-red-600 dark:text-red-400">
                        +{lead.days_overdue} days
                      </td>
                      <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => updateLeadStatus(lead.lead_id, 'Contacted')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded transition-colors"
                          title="Advance status to 'Contacted' to satisfy SLA"
                        >
                          <span>Mark Contacted</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
