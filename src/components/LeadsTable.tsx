import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Lead, LeadGrade, LeadStatus, Region } from '../types/crm';
import {
  Search,
  Download,
  AlertCircle,
  Copy,
  CheckCircle,
  ArrowUpDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { VALID_STATUSES, REGIONS } from '../utils/crmEngine';

export const LeadsTable: React.FC = () => {
  const {
    processedLeads,
    rejectedLeads,
    duplicateLeads,
    setSelectedLeadId,
    updateLeadStatus,
    searchTerm,
    setSearchTerm,
    gradeFilter,
    setGradeFilter,
    regionFilter,
    setRegionFilter,
    statusFilter,
    setStatusFilter,
  } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'processed' | 'rejected' | 'duplicates'>('processed');
  const [sortField, setSortField] = useState<'lead_score' | 'budget' | 'created_date'>('lead_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  // Filtered Processed Leads
  const filteredProcessed = processedLeads.filter((lead) => {
    const matchesSearch =
      searchTerm === '' ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lead_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === 'all' || lead.grade === gradeFilter;
    const matchesRegion = regionFilter === 'all' || lead.region === regionFilter;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesGrade && matchesRegion && matchesStatus;
  });

  // Sorted Processed Leads
  const sortedProcessed = [...filteredProcessed].sort((a, b) => {
    let diff = 0;
    if (sortField === 'lead_score') diff = a.lead_score - b.lead_score;
    if (sortField === 'budget') diff = a.budget - b.budget;
    if (sortField === 'created_date') diff = a.created_date.localeCompare(b.created_date);
    return sortDirection === 'desc' ? -diff : diff;
  });

  const handleSort = (field: 'lead_score' | 'budget' | 'created_date') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const triggerDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportProcessedCSV = () => {
    const headers = [
      'lead_id', 'name', 'company', 'industry', 'email', 'phone', 'source', 'region',
      'created_date', 'status', 'budget', 'company_size', 'timeline', 'website_visits',
      'emails_opened', 'lead_score', 'grade', 'owner', 'follow_up_due', 'sla_breached', 'days_overdue',
    ];
    const rows = sortedProcessed.map((l) => [
      l.lead_id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      `"${(l.industry || '').replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      `"${l.source}"`,
      l.region,
      l.created_date,
      l.status,
      l.budget,
      l.company_size,
      `"${l.timeline}"`,
      l.website_visits,
      l.emails_opened,
      l.lead_score,
      l.grade,
      `"${l.owner}"`,
      l.follow_up_due || '',
      l.sla_breached ? 'TRUE' : 'FALSE',
      l.days_overdue,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `processed_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(filename, csvContent);
    setExportNotice(`Exported ${sortedProcessed.length} current leads to ${filename}`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportRejectedCSV = () => {
    const headers = [
      'lead_id', 'name', 'email', 'phone', 'source', 'region', 'created_date',
      'company', 'industry', 'status', 'budget', 'company_size', 'timeline',
      'website_visits', 'emails_opened', 'reject_reason',
    ];
    const rows = rejectedLeads.map((r) => [
      r.lead_id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.source || '').replace(/"/g, '""')}"`,
      `"${(r.region || '').replace(/"/g, '""')}"`,
      `"${(r.created_date || '').replace(/"/g, '""')}"`,
      `"${(r.company || '').replace(/"/g, '""')}"`,
      `"${(r.industry || '').replace(/"/g, '""')}"`,
      `"${(r.status || '').replace(/"/g, '""')}"`,
      r.budget ?? '',
      r.company_size ?? '',
      `"${(r.timeline || '').replace(/"/g, '""')}"`,
      r.website_visits ?? '',
      r.emails_opened ?? '',
      `"${(r.reject_reason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `rejected_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(filename, csvContent);
    setExportNotice(`Exported ${rejectedLeads.length} rejected leads to ${filename}`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleExportDuplicatesCSV = () => {
    const headers = ['lead_id', 'name', 'email', 'created_date', 'kept_lead_id', 'reject_reason'];
    const rows = duplicateLeads.map((d) => [
      d.lead_id,
      `"${(d.name || '').replace(/"/g, '""')}"`,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      d.created_date,
      d.kept_lead_id || '',
      `"${(d.reject_reason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `duplicate_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(filename, csvContent);
    setExportNotice(`Exported ${duplicateLeads.length} duplicate leads to ${filename}`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs header for Processed / Rejected / Duplicates */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveSubTab('processed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'processed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Processed Leads ({processedLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rejected')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'rejected'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <span>Rejected Leads ({rejectedLeads.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('duplicates')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'duplicates'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5 text-amber-500" />
            <span>Duplicates Removed ({duplicateLeads.length})</span>
          </button>
        </div>

        {/* Primary Export Button */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'processed' && (
            <button
              onClick={handleExportProcessedCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors shadow-2xs whitespace-nowrap"
              title="Download current filtered leads as a CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>Export CSV ({sortedProcessed.length} Leads)</span>
            </button>
          )}

          {activeSubTab === 'rejected' && (
            <button
              onClick={handleExportRejectedCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors shadow-2xs whitespace-nowrap"
              title="Download rejected leads with reasons as a CSV file"
            >
              <Download className="w-3.5 h-3.5 text-red-400" />
              <span>Export Rejected Leads CSV ({rejectedLeads.length})</span>
            </button>
          )}

          {activeSubTab === 'duplicates' && (
            <button
              onClick={handleExportDuplicatesCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors shadow-2xs whitespace-nowrap"
              title="Download duplicate records as a CSV file"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Duplicate Leads CSV ({duplicateLeads.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-md text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Processed Leads View */}
      {activeSubTab === 'processed' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search processed leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Grades</option>
                <option value="Hot">Hot (≥70)</option>
                <option value="Warm">Warm (40-69)</option>
                <option value="Cold">Cold (&lt;40)</option>
              </select>

              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Regions</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1 px-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <button
                onClick={handleExportProcessedCSV}
                className="py-1 px-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 font-medium flex items-center gap-1.5 transition-colors ml-1"
                title="Download currently filtered leads as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Filtered CSV</span>
              </button>
            </div>
          </div>

          {/* High-Density Data Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold select-none">
                    <th className="py-2.5 px-3">Lead ID</th>
                    <th className="py-2.5 px-3">Name & Organization</th>
                    <th
                      onClick={() => handleSort('lead_score')}
                      className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Score & Grade</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('budget')}
                      className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Budget (INR)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Owner Assigned</th>
                    <th className="py-2.5 px-3">Region</th>
                    <th className="py-2.5 px-3">Follow-up Due</th>
                    <th className="py-2.5 px-3">SLA Flag</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sortedProcessed.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        No processed leads found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    sortedProcessed.map((lead) => (
                      <tr
                        key={lead.lead_id}
                        onClick={() => setSelectedLeadId(lead.lead_id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          lead.sla_breached ? 'bg-red-50/20 dark:bg-red-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {lead.lead_id}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {lead.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {lead.company} · {lead.email}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          <span className={getGradeColor(lead.grade)}>{lead.lead_score}</span>
                          <span className="text-[10px] text-slate-400 uppercase ml-1">
                            · {lead.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                          {formatINR(lead.budget)}
                        </td>
                        <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.lead_id, e.target.value as LeadStatus)}
                            className="text-[11px] font-medium py-0.5 px-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                          >
                            {VALID_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium">
                          {lead.owner}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                          {lead.region}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          {lead.follow_up_due || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          {lead.sla_breached ? (
                            <span className="font-mono tabular-nums font-bold text-red-600 dark:text-red-400">
                              Breached (+{lead.days_overdue}d)
                            </span>
                          ) : (
                            <span className="text-slate-400">OK</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLeadId(lead.lead_id);
                            }}
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                          >
                            <ChevronRight className="w-4 h-4" />
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
      )}

      {/* Rejected Leads View (Module 1 Output) */}
      {activeSubTab === 'rejected' && (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-lg text-xs text-red-800 dark:text-red-300">
            <strong>Module 1: Input Validation & Cleaning (rejected_leads.csv)</strong>
            <p className="mt-0.5 text-[11px] text-red-700 dark:text-red-400">
              Rows failed validation against required schema (10-digit Indian mobile, valid email, valid date, non-negative budget/size, or allowed source).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold select-none">
                    <th className="py-2.5 px-3">Lead ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Budget</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Rejection Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
                  {rejectedLeads.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {r.lead_id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans">
                        {r.name || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {r.email || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {r.phone || '<blank>'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans">
                        {r.source || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {r.budget !== undefined ? String(r.budget) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {r.created_date || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-red-600 dark:text-red-400 font-sans">
                        {r.reject_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Leads View (Module 2 Output) */}
      {activeSubTab === 'duplicates' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-amber-800 dark:text-amber-300">
            <strong>Module 2: Duplicate Detection (duplicate_leads.csv)</strong>
            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
              Leads sharing the same email address. As per DIT-P06 business rules, the earliest created record is retained; later duplicate rows are removed.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold select-none">
                    <th className="py-2.5 px-3">Duplicate Lead ID</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email (Duplicate Key)</th>
                    <th className="py-2.5 px-3">Duplicate Created Date</th>
                    <th className="py-2.5 px-3">Original Lead Retained</th>
                    <th className="py-2.5 px-3">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
                  {duplicateLeads.map((dup, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {dup.lead_id}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans">
                        {dup.name}
                      </td>
                      <td className="py-2.5 px-3 text-amber-700 dark:text-amber-400">
                        {dup.email}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {dup.created_date}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400 font-semibold font-sans">
                        {dup.kept_lead_id} (Earliest Record)
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">
                        {dup.reject_reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
