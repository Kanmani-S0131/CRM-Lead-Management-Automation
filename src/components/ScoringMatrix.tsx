import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  SOURCE_POINTS,
  BUDGET_TIERS,
  SIZE_TIERS,
  TIMELINE_POINTS,
  ENGAGEMENT_MAX,
  HOT_MIN,
  WARM_MIN,
  computeLeadScore,
} from '../utils/crmEngine';
import { LeadGrade } from '../types/crm';
import { Calculator, Sparkles, CheckCircle, Sliders } from 'lucide-react';

export const ScoringMatrix: React.FC = () => {
  const { processedLeads } = useCRM();

  // Test Calculator State
  const [calcSource, setCalcSource] = useState('Referral');
  const [calcBudget, setCalcBudget] = useState<number>(1200000);
  const [calcSize, setCalcSize] = useState<number>(250);
  const [calcTimeline, setCalcTimeline] = useState('0-1 Months');
  const [calcVisits, setCalcVisits] = useState<number>(6);
  const [calcEmails, setCalcEmails] = useState<number>(5);

  const calcResult = computeLeadScore({
    source: calcSource,
    budget: calcBudget,
    company_size: calcSize,
    timeline: calcTimeline,
    website_visits: calcVisits,
    emails_opened: calcEmails,
  });

  const hotCount = processedLeads.filter((l) => l.grade === 'Hot').length;
  const warmCount = processedLeads.filter((l) => l.grade === 'Warm').length;
  const coldCount = processedLeads.filter((l) => l.grade === 'Cold').length;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Module 3: Lead Scoring Engine & Grade Calibration (Max 100 Pts)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Deterministic 5-factor scoring model combining acquisition source, purchasing budget, organization scale, engagement activity, and timeline urgency.
        </p>

        {/* Grade Distribution Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded">
            <div className="text-emerald-800 dark:text-emerald-400 font-semibold">
              Hot Grade (Score ≥ {HOT_MIN})
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {hotCount} leads ({Math.round((hotCount / Math.max(1, processedLeads.length)) * 100)}%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Assigned to Senior reps · 1 Day SLA
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded">
            <div className="text-amber-800 dark:text-amber-400 font-semibold">
              Warm Grade (Score {WARM_MIN} - {HOT_MIN - 1})
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-amber-700 dark:text-amber-400 mt-0.5">
              {warmCount} leads ({Math.round((warmCount / Math.max(1, processedLeads.length)) * 100)}%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Assigned to Junior reps · 3 Days SLA
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded">
            <div className="text-slate-700 dark:text-slate-300 font-semibold">
              Cold Grade (Score &lt; {WARM_MIN})
            </div>
            <div className="font-mono tabular-nums text-2xl font-bold text-slate-600 dark:text-slate-400 mt-0.5">
              {coldCount} leads ({Math.round((coldCount / Math.max(1, processedLeads.length)) * 100)}%)
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Assigned to Junior reps · 7 Days SLA
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 5 Scoring Factors on Left + Interactive Calculator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 5 Factors */}
        <div className="lg:col-span-2 space-y-4">
          {/* Factor 1: Source */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                1. Acquisition Source (Max 25 Pts)
              </h3>
              <span className="font-mono text-xs text-slate-400">config.SOURCE_POINTS</span>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {Object.entries(SOURCE_POINTS).map(([src, pts]) => (
                <div key={src} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-sans text-slate-700 dark:text-slate-300">{src}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">+{pts} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factor 2: Budget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                2. Purchasing Budget (INR, Max 25 Pts)
              </h3>
              <span className="font-mono text-xs text-slate-400">config.BUDGET_TIERS</span>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {BUDGET_TIERS.map(([thresh, pts], idx) => (
                <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-sans">
                    {thresh >= 1000000 ? '≥ ₹10,00,000' : thresh >= 500000 ? '≥ ₹5,00,000' : thresh >= 100000 ? '≥ ₹1,00,000' : 'Default (≥ 0)'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    +{pts} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factor 3: Company Size */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                3. Company Size (Employees, Max 15 Pts)
              </h3>
              <span className="font-mono text-xs text-slate-400">config.SIZE_TIERS</span>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              {SIZE_TIERS.map(([thresh, pts], idx) => (
                <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 font-sans">
                    {thresh > 0 ? `≥ ${thresh} employees` : '1-10 employees'}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    +{pts} pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factor 4 & 5: Timeline & Engagement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  4. Purchase Timeline (Max 20 Pts)
                </h3>
              </div>
              <div className="mt-3 space-y-1.5 text-xs font-mono">
                {Object.entries(TIMELINE_POINTS).map(([time, pts]) => (
                  <div key={time} className="p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded flex items-center justify-between">
                    <span className="font-sans text-slate-700 dark:text-slate-300">{time}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">+{pts} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  5. Engagement (Max 15 Pts)
                </h3>
              </div>
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded text-xs space-y-2">
                <div className="font-mono text-slate-900 dark:text-slate-100">
                  min(15, visits * 2 + emails_opened)
                </div>
                <div className="text-[11px] text-slate-500">
                  Each website visit grants 2 points; each opened email grants 1 point, capped at 15 points total.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Lead Score Calculator */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Live Scoring Sandbox
                </h3>
              </div>
            </div>

            {/* Live Score Display */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
              <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {calcResult.score}
                <span className="text-xs text-slate-400 font-normal ml-1">/ 100</span>
              </div>
              <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${
                calcResult.grade === 'Hot' ? 'text-emerald-600' : calcResult.grade === 'Warm' ? 'text-amber-600' : 'text-slate-500'
              }`}>
                {calcResult.grade} Grade
              </div>
            </div>

            {/* Inputs */}
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Source</label>
                <select
                  value={calcSource}
                  onChange={(e) => setCalcSource(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {Object.keys(SOURCE_POINTS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Budget (INR)</label>
                <input
                  type="number"
                  step={50000}
                  value={calcBudget}
                  onChange={(e) => setCalcBudget(Number(e.target.value))}
                  className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Company Size</label>
                <input
                  type="number"
                  value={calcSize}
                  onChange={(e) => setCalcSize(Number(e.target.value))}
                  className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Timeline</label>
                <select
                  value={calcTimeline}
                  onChange={(e) => setCalcTimeline(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  {Object.keys(TIMELINE_POINTS).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Visits</label>
                  <input
                    type="number"
                    min={0}
                    value={calcVisits}
                    onChange={(e) => setCalcVisits(Number(e.target.value))}
                    className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">Opened</label>
                  <input
                    type="number"
                    min={0}
                    value={calcEmails}
                    onChange={(e) => setCalcEmails(Number(e.target.value))}
                    className="w-full p-1.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Source ({calcSource}):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+{calcResult.breakdown.sourcePts}</span>
              </div>
              <div className="flex justify-between">
                <span>Budget ({formatINR(calcBudget)}):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+{calcResult.breakdown.budgetPts}</span>
              </div>
              <div className="flex justify-between">
                <span>Company Size ({calcSize}):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+{calcResult.breakdown.sizePts}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeline ({calcTimeline}):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+{calcResult.breakdown.timelinePts}</span>
              </div>
              <div className="flex justify-between">
                <span>Engagement ({calcVisits}v, {calcEmails}e):</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">+{calcResult.breakdown.engagementPts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
