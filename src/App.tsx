/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { TopNav } from './components/TopNav';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadsTable } from './components/LeadsTable';
import { SlaMonitor } from './components/SlaMonitor';
import { ScoringMatrix } from './components/ScoringMatrix';
import { TeamRouting } from './components/TeamRouting';
import { AnalyticsView } from './components/AnalyticsView';
import { PipelineRunnerView } from './components/PipelineRunnerView';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { IngestLeadModal } from './components/IngestLeadModal';
import { UploadCsvModal } from './components/UploadCsvModal';
import { LiveActivityFeed } from './components/LiveActivityFeed';

function CRMApp() {
  const { activeTab } = useCRM();
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors antialiased">
      {/* 3-Zone Top Bar */}
      <TopNav
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'pipeline' && <KanbanBoard />}
        {activeTab === 'leads' && <LeadsTable />}
        {activeTab === 'sla' && <SlaMonitor />}
        {activeTab === 'scoring' && <ScoringMatrix />}
        {activeTab === 'team' && <TeamRouting />}
        {activeTab === 'reports' && <AnalyticsView />}
        {activeTab === 'runner' && <PipelineRunnerView />}
      </main>

      {/* Footer (Clean, unboxed metadata, domain attribution) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              DIT-P06 CRM Lead Management Automation
            </span>
            <span aria-hidden="true">·</span>
            <span>Team T06 (Madhumitha, Kanmani)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>validate → dedupe → score → assign → followup SLA → report</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">Synthetic Dataset 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <LeadDetailDrawer />
      <IngestLeadModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
      />
      <UploadCsvModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <LiveActivityFeed />
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <CRMApp />
    </CRMProvider>
  );
}
