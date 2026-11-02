import React from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadStatus, LeadGrade } from '../types/crm';
import {
  Search,
  Filter,
  ChevronRight,
  Building,
  AlertTriangle,
  Clock,
  User,
  MapPin,
} from 'lucide-react';
import { VALID_STATUSES } from '../utils/crmEngine';

const STAGE_DESCRIPTIONS: Record<LeadStatus, string> = {
  New: 'Awaiting triage & first contact',
  Contacted: 'First outreach made; SLA clock stopped',
  Qualified: 'Budget & requirements verified',
  Converted: 'Won & signed customer',
  Lost: 'Disqualified or closed lost',
};

const NEXT_STAGE_MAP: Record<LeadStatus, LeadStatus | null> = {
  New: 'Contacted',
  Contacted: 'Qualified',
  Qualified: 'Converted',
  Converted: null,
  Lost: 'New',
};

export const KanbanBoard: React.FC = () => {
  const {
    processedLeads,
    updateLeadStatus,
    setSelectedLeadId,
    searchTerm,
    setSearchTerm,
    gradeFilter,
    setGradeFilter,
    regionFilter,
    setRegionFilter,
  } = useCRM();

  // Filter leads
  const filtered = processedLeads.filter((lead) => {
    const matchesSearch =
      searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lead_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === 'all' || lead.grade === gradeFilter;
    const matchesRegion = regionFilter === 'all' || lead.region === regionFilter;

    return matchesSearch && matchesGrade && matchesRegion;
  });

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getGradeColor = (grade: LeadGrade) => {
    switch (grade) {
      case 'Hot':
        return 'text-emerald-700 dark:text-emerald-400 font-bold';
      case 'Warm':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      case 'Cold':
        return 'text-slate-600 dark:text-slate-400 font-medium';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by lead ID, name, company, email, rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Grades (Hot/Warm/Cold)</option>
            <option value="Hot">Hot (≥70 pts)</option>
            <option value="Warm">Warm (40-69 pts)</option>
            <option value="Cold">Cold (&lt;40 pts)</option>
          </select>

          {/* Region filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Regions</option>
            <option value="North">North (Arjun Rao, Meena, Karan)</option>
            <option value="South">South (Lakshmi Nair, Vikram, Divya)</option>
            <option value="East">East (Sourav Das, Priya, Ankit)</option>
            <option value="West">West (Rohan Mehta, Neha, Sameer)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Showing <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">{filtered.length}</span> of {processedLeads.length} processed leads
        </div>
      </div>

      {/* Kanban Board Columns Container */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-flex gap-4 min-w-full items-start">
          {VALID_STATUSES.map((status) => {
            const stageLeads = filtered.filter((l) => l.status === status);
            const stageBudget = stageLeads.reduce((acc, l) => acc + (l.budget || 0), 0);
            const nextStage = NEXT_STAGE_MAP[status];

            return (
              <div
                key={status}
                className="w-76 shrink-0 flex flex-col bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3"
              >
                {/* Stage Header */}
                <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
                      {status}
                    </h3>
                    <span className="font-mono tabular-nums text-xs font-semibold px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate pr-1 text-[11px]">{STAGE_DESCRIPTIONS[status]}</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100 shrink-0 text-[11px]">
                      {formatINR(stageBudget)}
                    </span>
                  </div>
                </div>

                {/* Lead Cards List */}
                <div className="mt-3 space-y-2.5 min-h-[460px]">
                  {stageLeads.length === 0 ? (
                    <div className="py-12 px-4 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-400">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.lead_id}
                        onClick={() => setSelectedLeadId(lead.lead_id)}
                        className={`group bg-white dark:bg-slate-900 border ${
                          lead.sla_breached
                            ? 'border-red-300 dark:border-red-900/80 shadow-xs ring-1 ring-red-400/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                        } rounded-lg p-3 cursor-pointer transition-all shadow-xs`}
                      >
                        {/* Header: Lead ID, Name & Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-slate-400">
                                {lead.lead_id}
                              </span>
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                {lead.name}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{lead.company}</span>
                              <span aria-hidden="true">·</span>
                              <span>{lead.industry}</span>
                            </p>
                          </div>

                          {/* Zero-Pill Score Display */}
                          <div className="text-right shrink-0">
                            <div className={`text-xs ${getGradeColor(lead.grade)} font-mono tabular-nums`}>
                              {lead.lead_score} pts
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {lead.grade}
                            </div>
                          </div>
                        </div>

                        {/* Budget & Source */}
                        <div className="mt-2 text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                            {formatINR(lead.budget)}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {lead.source}
                          </span>
                        </div>

                        {/* Owner & Region Row */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.owner}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 text-slate-400">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{lead.region}</span>
                          </div>
                        </div>

                        {/* SLA Warning Flag if breached */}
                        {lead.sla_breached && (
                          <div className="mt-2 p-1.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded flex items-center justify-between text-[11px] text-red-700 dark:text-red-400">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                              <span className="font-semibold">
                                SLA Breached (+{lead.days_overdue}d)
                              </span>
                            </div>
                            <span className="font-mono text-[10px]">
                              Due: {lead.follow_up_due}
                            </span>
                          </div>
                        )}

                        {/* Card Footer: Advance button */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadId(lead.lead_id);
                            }}
                            className="text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            Details →
                          </button>

                          {nextStage && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLeadStatus(lead.lead_id, nextStage);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              title={`Advance to ${nextStage}`}
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
