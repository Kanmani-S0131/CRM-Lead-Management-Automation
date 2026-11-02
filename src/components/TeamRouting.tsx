import React from 'react';
import { useCRM } from '../context/CRMContext';
import { REPS, REGIONS } from '../utils/crmEngine';
import { Region } from '../types/crm';
import { Users, Shield, MapPin, Award, AlertTriangle, CheckCircle } from 'lucide-react';

export const TeamRouting: React.FC = () => {
  const { summaries, processedLeads } = useCRM();

  const closedLeadsCount = processedLeads.filter((l) => l.owner === 'N/A (closed)').length;
  const openAssignedCount = processedLeads.filter((l) => l.owner !== 'N/A (closed)').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Module 4: Region-based Round-Robin Assignment Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Strict business rule: <strong>Hot leads</strong> are routed to Senior account executives, while <strong>Warm & Cold leads</strong> rotate among Junior representatives within the same geographic region. Closed leads (Converted/Lost) are marked unassigned.
            </p>
          </div>

          <div className="text-right text-xs">
            <div className="text-slate-500">Open Assigned Leads</div>
            <div className="font-mono tabular-nums text-lg font-bold text-slate-900 dark:text-slate-100">
              {openAssignedCount} active
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              {closedLeadsCount} closed (N/A)
            </div>
          </div>
        </div>

        {/* Logic Explainer Box */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100">1. Hot Leads (Score ≥ 70)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dispatched to Senior tier reps via regional round-robin rotation.
            </p>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100">2. Warm / Cold (&lt; 70)</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rotated between Junior reps in North, South, East, and West teams.
            </p>
          </div>
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100">3. Converted / Lost</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Closed records do not consume sales rep bandwidth: <code className="text-[10px]">N/A (closed)</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Regional Teams Grid (North, South, East, West) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {REGIONS.map((region) => {
          const regionReps = REPS[region];
          const regionLeads = processedLeads.filter((l) => l.region === region && l.owner !== 'N/A (closed)');
          const regionHot = regionLeads.filter((l) => l.grade === 'Hot').length;

          return (
            <div
              key={region}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {region} Region Sales Team
                  </h3>
                </div>
                <div className="text-right text-xs font-mono tabular-nums text-slate-500">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{regionLeads.length}</span> active leads · <span className="text-emerald-600 font-semibold">{regionHot} Hot</span>
                </div>
              </div>

              {/* Reps in this region */}
              <div className="mt-4 space-y-3">
                {regionReps.map((rep) => {
                  const summary = summaries.byOwner.find((o) => o.owner === rep.name);
                  const openCount = summary?.open_leads || 0;
                  const hotCount = summary?.hot_leads || 0;
                  const breachesCount = summary?.sla_breaches || 0;

                  return (
                    <div
                      key={rep.name}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {rep.name}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                            rep.level === 'Senior'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {rep.level} Rep
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                          {rep.email}
                        </div>
                      </div>

                      {/* Rep Metrics */}
                      <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-right">
                        <div>
                          <div className="text-slate-400 text-[10px]">Active</div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{openCount}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">Hot Leads</div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">{hotCount}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">SLA Breaches</div>
                          <div className={`font-bold ${breachesCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                            {breachesCount}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
