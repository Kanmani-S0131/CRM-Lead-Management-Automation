import React from 'react';
import { useCRM } from '../context/CRMContext';
import { Download, FileSpreadsheet, BarChart2, TrendingUp, Users, AlertCircle } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { summaries, processedLeads, stats } = useCRM();

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const totalBudget = summaries.byGrade.reduce((acc, g) => acc + g.total_budget, 0);

  const handleDownloadExcelSimulation = () => {
    // Generate clean CSV format containing the 4 report sheets
    let reportText = '=== DIT-P06 LEAD MANAGEMENT AUTOMATION REPORT ===\n\n';
    reportText += 'SHEET 1: BY GRADE\nGrade,Leads,Avg Score,Total Budget\n';
    summaries.byGrade.forEach((g) => {
      reportText += `${g.grade},${g.leads},${g.avg_score},${g.total_budget}\n`;
    });

    reportText += '\nSHEET 2: BY SOURCE\nSource,Leads,Avg Score,Hot Leads,Converted,Conversion Rate %\n';
    summaries.bySource.forEach((s) => {
      reportText += `"${s.source}",${s.leads},${s.avg_score},${s.hot_leads},${s.converted},${s.conversion_rate_pct}%\n`;
    });

    reportText += '\nSHEET 3: BY OWNER\nOwner,Region,Level,Open Leads,Hot Leads,SLA Breaches\n';
    summaries.byOwner.forEach((o) => {
      reportText += `"${o.owner}",${o.region},${o.level},${o.open_leads},${o.hot_leads},${o.sla_breaches}\n`;
    });

    reportText += '\nSHEET 4: OVERDUE SLA BREACHES\nLead ID,Name,Region,Grade,Owner,Follow-up Due,Days Overdue\n';
    summaries.slaBreaches.forEach((b) => {
      reportText += `${b.lead_id},"${b.name}",${b.region},${b.grade},"${b.owner}",${b.follow_up_due},+${b.days_overdue} days\n`;
    });

    const blob = new Blob([reportText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lead_summary_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Module 6: Output Files & Executive Summary Reports
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Mirror of <code className="text-[11px] font-mono">reports.build_summaries()</code> generating aggregated multi-sheet breakdowns: By Grade, By Source, By Owner, and Overdue SLA Breaches.
            </p>
          </div>

          <button
            onClick={handleDownloadExcelSimulation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download lead_summary.csv</span>
          </button>
        </div>

        {/* High-level KPIs */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-500">Total Pipeline Value</div>
            <div className="font-mono tabular-nums text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatINR(totalBudget)}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Processed Clean Leads</div>
            <div className="font-mono tabular-nums text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {processedLeads.length} records
            </div>
          </div>
          <div>
            <div className="text-slate-500">Hot Lead Yield</div>
            <div className="font-mono tabular-nums text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.hot_leads_count} ({Math.round((stats.hot_leads_count / Math.max(1, processedLeads.length)) * 100)}%)
            </div>
          </div>
          <div>
            <div className="text-slate-500">Overdue SLA Rate</div>
            <div className="font-mono tabular-nums text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
              {stats.sla_breached_count} breaches
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Tables (By Grade & By Source) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sheet 1: By Grade */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Summary Sheet 1: By Grade
            </h3>
            <span className="font-mono text-[11px] text-slate-400">df.groupby("grade")</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2 px-3">Grade</th>
                  <th className="py-2 px-3 text-right">Leads</th>
                  <th className="py-2 px-3 text-right">Avg Score</th>
                  <th className="py-2 px-3 text-right">Total Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
                {summaries.byGrade.map((g) => (
                  <tr key={g.grade} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold font-sans">
                      <span className={g.grade === 'Hot' ? 'text-emerald-600 font-bold' : g.grade === 'Warm' ? 'text-amber-600 font-semibold' : 'text-slate-500'}>
                        {g.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {g.leads}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {g.avg_score}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(g.total_budget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sheet 2: By Source */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
              Summary Sheet 2: By Source
            </h3>
            <span className="font-mono text-[11px] text-slate-400">df.groupby("source")</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="py-2 px-3">Source Channel</th>
                  <th className="py-2 px-3 text-right">Leads</th>
                  <th className="py-2 px-3 text-right">Avg Score</th>
                  <th className="py-2 px-3 text-right">Hot</th>
                  <th className="py-2 px-3 text-right">Converted</th>
                  <th className="py-2 px-3 text-right">Conv %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
                {summaries.bySource.map((s) => (
                  <tr key={s.source} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold font-sans text-slate-800 dark:text-slate-200">
                      {s.source}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 dark:text-slate-100 font-bold">
                      {s.leads}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {s.avg_score}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">
                      {s.hot_leads}
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-600 font-semibold">
                      {s.converted}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {s.conversion_rate_pct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sheet 3: By Owner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Summary Sheet 3: By Owner (Sales Rep Performance)
          </h3>
          <span className="font-mono text-[11px] text-slate-400">open_df.groupby("owner")</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="py-2.5 px-3">Owner Rep</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3">Seniority Level</th>
                <th className="py-2.5 px-3 text-right">Open Leads</th>
                <th className="py-2.5 px-3 text-right">Hot Leads Handled</th>
                <th className="py-2.5 px-3 text-right">SLA Breaches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
              {summaries.byOwner.map((o) => (
                <tr key={o.owner} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold font-sans text-slate-900 dark:text-slate-100">
                    {o.owner}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans">
                    {o.region}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={o.level === 'Senior' ? 'text-purple-600 font-bold' : 'text-slate-500'}>
                      {o.level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {o.open_leads}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                    {o.hot_leads}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-red-600 dark:text-red-400">
                    {o.sla_breaches > 0 ? o.sla_breaches : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
