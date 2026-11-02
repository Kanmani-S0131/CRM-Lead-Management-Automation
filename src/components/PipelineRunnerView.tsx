import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  CheckCircle2,
  Play,
  RotateCcw,
  FileText,
  Filter,
  Calculator,
  Users,
  Clock,
  FileSpreadsheet,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

export const PipelineRunnerView: React.FC = () => {
  const { stats, runPipelineAgain, asOfDate } = useCRM();
  const [activeStep, setActiveStep] = useState<number>(6);
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);

  const handleSimulateExecution = () => {
    setIsSimulatingRun(true);
    setActiveStep(1);

    const steps = [2, 3, 4, 5, 6];
    steps.forEach((st, idx) => {
      setTimeout(() => {
        setActiveStep(st);
        if (st === 6) {
          setIsSimulatingRun(false);
          runPipelineAgain();
        }
      }, (idx + 1) * 450);
    });
  };

  const steps = [
    {
      num: 1,
      title: 'Module 1: Validation & Cleaning',
      file: 'validators.py',
      icon: <Filter className="w-4 h-4 text-sky-500" />,
      input: `${stats.input_rows} raw leads`,
      output: `${stats.valid} valid leads, ${stats.rejected} rejected`,
      desc: 'Checks 10-digit Indian phone [6-9]\\d{9}, email regex, created_date, and non-negative budget.',
    },
    {
      num: 2,
      title: 'Module 2: Duplicate Detection',
      file: 'dedupe.py',
      icon: <FileText className="w-4 h-4 text-amber-500" />,
      input: `${stats.valid} valid leads`,
      output: `${stats.processed} unique, ${stats.duplicates} duplicates removed`,
      desc: 'Identifies matching email addresses; retains earliest created_date record, flags later duplicates.',
    },
    {
      num: 3,
      title: 'Module 3: Scoring & Grading',
      file: 'scoring.py',
      icon: <Calculator className="w-4 h-4 text-emerald-500" />,
      input: `${stats.processed} unique leads`,
      output: `${stats.hot_leads_count} Hot, ${stats.warm_leads_count} Warm, ${stats.cold_leads_count} Cold`,
      desc: 'Calculates 0-100 deterministic score: Source (25) + Budget (25) + Size (15) + Timeline (20) + Engagement (15).',
    },
    {
      num: 4,
      title: 'Module 4: Regional Assignment',
      file: 'assignment.py',
      icon: <Users className="w-4 h-4 text-purple-500" />,
      input: `${stats.processed} scored leads`,
      output: 'Assigned across 4 regions (North, South, East, West)',
      desc: 'Hot leads -> Senior reps (round-robin); Warm & Cold -> Junior reps; Converted/Lost -> N/A (closed).',
    },
    {
      num: 5,
      title: 'Module 5: SLA Follow-up Engine',
      file: 'followup.py',
      icon: <Clock className="w-4 h-4 text-red-500" />,
      input: `${stats.processed} assigned leads`,
      output: `${stats.sla_breached_count} SLA breaches flagged (as of ${asOfDate})`,
      desc: 'Sets follow_up_due by grade (Hot 1d, Warm 3d, Cold 7d). Checks status "New" against reference as_of date.',
    },
    {
      num: 6,
      title: 'Module 6: Outputs & Reporting',
      file: 'reports.py',
      icon: <FileSpreadsheet className="w-4 h-4 text-teal-500" />,
      input: 'Processed + Rejected + Duplicates',
      output: 'processed_leads.csv, rejected_leads.csv, lead_summary.xlsx',
      desc: 'Writes CSV outputs and generates multi-sheet summary reports (By Grade, Source, Owner, SLA Breaches).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              End-to-End Pipeline Architecture (<code className="font-mono text-xs">pipeline.py</code>)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Sequential orchestration executing validation, deduplication, scoring, regional assignment, follow-up SLA checks, and reporting with mathematical data reconciliation.
            </p>
          </div>

          <button
            onClick={handleSimulateExecution}
            disabled={isSimulatingRun}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors shadow-2xs disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isSimulatingRun ? 'Executing Pipeline...' : 'Run Pipeline Execution'}</span>
          </button>
        </div>

        {/* Invariant Reconciliation Formula Box */}
        <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono">
          <div className="text-slate-500 text-[11px] mb-1">
            Data Reconciliation Invariants:
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-800 dark:text-slate-200">
            <span>Input ({stats.input_rows})</span>
            <span>=</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Valid ({stats.valid})</span>
            <span>+</span>
            <span className="text-red-600 font-bold">Rejected ({stats.rejected})</span>
            <span className="mx-2 text-slate-400">|</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">Valid ({stats.valid})</span>
            <span>=</span>
            <span className="text-sky-600 font-bold">Clean Processed ({stats.processed})</span>
            <span>+</span>
            <span className="text-amber-600 font-bold">Duplicates ({stats.duplicates})</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Chart */}
      <div className="space-y-3">
        {steps.map((st) => {
          const isCurrent = activeStep === st.num;
          const isDone = activeStep >= st.num;

          return (
            <div
              key={st.num}
              className={`bg-white dark:bg-slate-900 border ${
                isCurrent
                  ? 'border-sky-500 ring-1 ring-sky-400/40'
                  : isDone
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-100 dark:border-slate-800/40 opacity-60'
              } rounded-lg p-4 transition-all shadow-xs`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0">
                    {st.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">0{st.num}.</span>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {st.title}
                      </h3>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                        {st.file}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {st.desc}
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono">
                  <div className="text-[11px] text-slate-400">Input → Output</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {st.output}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
