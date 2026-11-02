import React from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Upload,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface TopNavProps {
  onOpenIngestModal: () => void;
  onOpenUploadModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenIngestModal, onOpenUploadModal }) => {
  const {
    activeTab,
    setActiveTab,
    asOfDate,
    setAsOfDate,
    stats,
    isLiveStreamActive,
    setIsLiveStreamActive,
    simulateIncomingLead,
    resetToBenchmarkData,
  } = useCRM();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs tracking-tight">
            T06
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
              LeadPulse CRM
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 whitespace-nowrap hidden sm:inline">
              DIT-P06
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line controls) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
              activeTab === 'pipeline'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pipeline Board
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
              activeTab === 'leads'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Leads Explorer
          </button>
          <button
            onClick={() => setActiveTab('sla')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sla'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>SLA Breaches</span>
            {stats.sla_breached_count > 0 && (
              <span className="font-mono tabular-nums text-[10px] font-bold text-red-600 dark:text-red-400">
                ({stats.sla_breached_count})
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
              activeTab === 'scoring'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Scoring Matrix
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Regional Routing
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('runner')}
            className={`whitespace-nowrap pb-1 border-b-2 transition-colors ${
              activeTab === 'runner'
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pipeline Flow
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenUploadModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap"
            title="Import raw CSV dataset"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={onOpenIngestModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-md transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Ingest Lead</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Pipeline Reconciliation & As-Of Date Reference */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Pipeline Reconciliation Stats (Exact DIT-P06 Math) */}
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
            <span className="font-medium text-slate-900 dark:text-slate-200">
              Pipeline State:
            </span>
            <span>
              Input:{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {stats.input_rows}
              </strong>
            </span>
            <span aria-hidden="true">→</span>
            <span>
              Valid:{' '}
              <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {stats.valid}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Rejected:{' '}
              <strong className="font-mono tabular-nums text-red-600 dark:text-red-400">
                {stats.rejected}
              </strong>
            </span>
            <span aria-hidden="true">→</span>
            <span>
              Clean Processed:{' '}
              <strong className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {stats.processed}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Duplicates:{' '}
              <strong className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {stats.duplicates}
              </strong>
            </span>
          </div>

          {/* Right controls: As-Of Reference Date + Simulation Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="asOfInput" className="text-[11px] font-medium">
                SLA Reference (as_of):
              </label>
              <input
                id="asOfInput"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="text-xs font-mono py-0.5 px-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <button
              onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title={isLiveStreamActive ? 'Pause Inbound Simulation' : 'Start Inbound Simulation'}
            >
              {isLiveStreamActive ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              <span className="hidden md:inline">{isLiveStreamActive ? 'Pause Stream' : 'Live Stream'}</span>
            </button>

            <button
              onClick={simulateIncomingLead}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Inject one synthetic inbound lead"
            >
              <span>+ Inbound Lead</span>
            </button>

            <button
              onClick={resetToBenchmarkData}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded"
              title="Reset to DIT-P06 Benchmark Dataset (126 records)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
