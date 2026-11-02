import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Lead,
  RejectedLead,
  DuplicateLead,
  LeadStatus,
  LeadGrade,
  Region,
  PipelineStats,
  GradeSummary,
  SourceSummary,
  OwnerSummary,
} from '../types/crm';
import {
  generateSyntheticRawLeads,
  runCompletePipeline,
  buildSummaries,
  REPS,
  VALID_STATUSES,
  REGIONS,
  SOURCE_POINTS,
  TIMELINE_POINTS,
  SLA_STATUSES,
  OPEN_STATUSES,
  SLA_DAYS,
  validateRow,
  computeLeadScore,
} from '../utils/crmEngine';

interface LiveActivityEvent {
  id: string;
  timestamp: string;
  leadId: string;
  name: string;
  company: string;
  action: string;
  details: string;
  type: 'ingest' | 'score' | 'assign' | 'sla' | 'status';
}

interface CRMContextType {
  // Data
  rawRows: Record<string, any>[];
  processedLeads: Lead[];
  rejectedLeads: RejectedLead[];
  duplicateLeads: DuplicateLead[];
  stats: PipelineStats;
  summaries: {
    byGrade: GradeSummary[];
    bySource: SourceSummary[];
    byOwner: OwnerSummary[];
    slaBreaches: Lead[];
  };
  asOfDate: string;
  selectedLeadId: string | null;
  selectedLead: Lead | null;
  activeTab: 'pipeline' | 'leads' | 'sla' | 'scoring' | 'team' | 'reports' | 'runner';
  
  // Real-time Simulation
  isLiveStreamActive: boolean;
  streamIntervalSec: number;
  activityStream: LiveActivityEvent[];
  
  // Filters
  searchTerm: string;
  gradeFilter: string;
  regionFilter: string;
  statusFilter: string;
  ownerFilter: string;
  slaFilter: string;

  // Actions
  setActiveTab: (tab: 'pipeline' | 'leads' | 'sla' | 'scoring' | 'team' | 'reports' | 'runner') => void;
  setSelectedLeadId: (id: string | null) => void;
  setAsOfDate: (dateStr: string) => void;
  setIsLiveStreamActive: (active: boolean) => void;
  setStreamIntervalSec: (sec: number) => void;
  setSearchTerm: (term: string) => void;
  setGradeFilter: (val: string) => void;
  setRegionFilter: (val: string) => void;
  setStatusFilter: (val: string) => void;
  setOwnerFilter: (val: string) => void;
  setSlaFilter: (val: string) => void;
  
  updateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  assignLeadOwner: (leadId: string, newOwner: string) => void;
  addLeadNote: (leadId: string, content: string, author?: string) => void;
  ingestSingleLead: (leadData: Record<string, any>) => { success: boolean; message: string; lead?: Lead };
  uploadCsvData: (csvText: string) => void;
  runPipelineAgain: () => void;
  resetToBenchmarkData: () => void;
  simulateIncomingLead: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_KEY_RAW = 'dit_p06_raw_leads_v2';
const STORAGE_KEY_AS_OF = 'dit_p06_as_of_v2';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [asOfDate, setAsOfDateState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_AS_OF) || '2026-11-02';
  });

  const [rawRows, setRawRows] = useState<Record<string, any>[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RAW);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return generateSyntheticRawLeads();
  });

  const [activeTab, setActiveTab] = useState<'pipeline' | 'leads' | 'sla' | 'scoring' | 'team' | 'reports' | 'runner'>('pipeline');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');

  // Live stream
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(false);
  const [streamIntervalSec, setStreamIntervalSec] = useState<number>(10);
  const [activityStream, setActivityStream] = useState<LiveActivityEvent[]>([
    {
      id: 'act_0',
      timestamp: '10:24:00',
      leadId: 'L0001',
      name: 'Aarav Sharma',
      company: 'Zenith Textiles',
      action: 'Pipeline Executed',
      details: 'Scored 85 (Hot) · Assigned to Arjun Rao · SLA Target 1 Day',
      type: 'ingest',
    },
  ]);

  // Run pipeline whenever rawRows or asOfDate changes
  const pipelineResult = useMemo(() => {
    return runCompletePipeline(rawRows, asOfDate);
  }, [rawRows, asOfDate]);

  const { processed: processedLeads, rejected: rejectedLeads, duplicates: duplicateLeads, stats } = pipelineResult;

  const summaries = useMemo(() => {
    return buildSummaries(processedLeads);
  }, [processedLeads]);

  const selectedLead = useMemo(() => {
    return processedLeads.find((l) => l.lead_id === selectedLeadId) || null;
  }, [processedLeads, selectedLeadId]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RAW, JSON.stringify(rawRows));
    } catch {}
  }, [rawRows]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AS_OF, asOfDate);
    } catch {}
  }, [asOfDate]);

  const setAsOfDate = (dateStr: string) => {
    setAsOfDateState(dateStr);
  };

  // Status Updater
  const updateLeadStatus = useCallback((leadId: string, newStatus: LeadStatus) => {
    setRawRows((prev) =>
      prev.map((r) => {
        if (r.lead_id === leadId) {
          return { ...r, status: newStatus };
        }
        return r;
      })
    );

    setActivityStream((prev) => [
      {
        id: `act_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        leadId,
        name: leadId,
        company: 'CRM Lead',
        action: `Status Advanced to ${newStatus}`,
        details: `SLA status updated. Open status: ${OPEN_STATUSES.includes(newStatus) ? 'Yes' : 'Closed'}.`,
        type: 'status',
      },
      ...prev.slice(0, 24),
    ]);
  }, []);

  // Assign Owner
  const assignLeadOwner = useCallback((leadId: string, newOwner: string) => {
    setRawRows((prev) =>
      prev.map((r) => {
        if (r.lead_id === leadId) {
          return { ...r, manual_owner: newOwner };
        }
        return r;
      })
    );
  }, []);

  // Add Note
  const addLeadNote = useCallback((leadId: string, content: string, author: string = 'Current User') => {
    setRawRows((prev) =>
      prev.map((r) => {
        if (r.lead_id === leadId) {
          const notes = r.notes || [];
          return {
            ...r,
            notes: [
              {
                id: `note_${Date.now()}`,
                author,
                timestamp: 'Just now',
                content,
              },
              ...notes,
            ],
          };
        }
        return r;
      })
    );
  }, []);

  // Ingest Single Lead
  const ingestSingleLead = useCallback((leadData: Record<string, any>) => {
    const { clean, reason } = validateRow(leadData);
    if (!clean) {
      return { success: false, message: `Validation Failed: ${reason}` };
    }

    // Check duplicate email
    const isDup = rawRows.some((r) => r.email && r.email.toLowerCase() === clean.email.toLowerCase());

    const newRaw: Record<string, any> = {
      ...leadData,
      lead_id: leadData.lead_id || `L${String(rawRows.length + 1).padStart(4, '0')}`,
      created_date: leadData.created_date || asOfDate,
    };

    setRawRows((prev) => [newRaw, ...prev]);

    const { score, grade } = computeLeadScore(clean);

    setActivityStream((prev) => [
      {
        id: `act_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        leadId: newRaw.lead_id,
        name: newRaw.name,
        company: newRaw.company || 'Unknown',
        action: isDup ? 'Duplicate Ingested (Flagged)' : 'Lead Ingested & Scored',
        details: isDup
          ? `Duplicate email: ${newRaw.email}`
          : `Score ${score} (${grade}) · Region ${newRaw.region}`,
        type: isDup ? 'sla' : 'ingest',
      },
      ...prev.slice(0, 24),
    ]);

    return {
      success: true,
      message: isDup ? 'Lead ingested (Flagged as duplicate)' : 'Lead ingested and processed successfully',
    };
  }, [rawRows, asOfDate]);

  // Upload CSV
  const uploadCsvData = useCallback((csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

      const parsed: Record<string, any>[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const vals = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const row: Record<string, any> = {};
        headers.forEach((h, idx) => {
          row[h] = vals[idx] !== undefined ? vals[idx] : '';
        });
        parsed.push(row);
      }

      setRawRows(parsed);
    } catch (e: any) {
      console.error('CSV parse error', e);
    }
  }, []);

  // Reset to Benchmark Data
  const resetToBenchmarkData = useCallback(() => {
    const benchmark = generateSyntheticRawLeads();
    setRawRows(benchmark);
    setAsOfDateState('2026-11-02');
  }, []);

  // Run pipeline again (force re-render if needed)
  const runPipelineAgain = useCallback(() => {
    setRawRows([...rawRows]);
  }, [rawRows]);

  // Simulate Incoming Lead
  const simulateIncomingLead = useCallback(() => {
    const FIRST = ['Rohan', 'Ananya', 'Aditya', 'Siddharth', 'Tanvi', 'Varun', 'Kriti'];
    const LAST = ['Kapoor', 'Mehta', 'Bose', 'Verma', 'Chopra', 'Mukherjee', 'Sen'];
    const COMPANIES = ['Aura FinTech', 'Zenith Logistics', 'Vertex Healthcare', 'Nova Dynamics'];
    const rndChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const rndInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const first = rndChoice(FIRST);
    const last = rndChoice(LAST);
    const idNum = rawRows.length + 1;
    const phone = `+91 ${rndInt(6, 9)}${Array.from({ length: 9 }, () => rndInt(0, 9)).join('')}`;

    ingestSingleLead({
      lead_id: `L${String(idNum).padStart(4, '0')}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${idNum}@example.com`,
      phone,
      company: rndChoice(COMPANIES),
      industry: 'Technology',
      source: rndChoice(Object.keys(SOURCE_POINTS)),
      region: rndChoice(REGIONS),
      created_date: asOfDate,
      status: 'New',
      budget: rndChoice([500000, 1200000, 250000, 80000]),
      company_size: rndChoice([25, 75, 250, 600]),
      timeline: rndChoice(Object.keys(TIMELINE_POINTS)),
      website_visits: rndInt(1, 8),
      emails_opened: rndInt(1, 6),
    });
  }, [rawRows.length, asOfDate, ingestSingleLead]);

  // Real-time live simulation interval
  useEffect(() => {
    if (!isLiveStreamActive) return;
    const timer = setInterval(() => {
      simulateIncomingLead();
    }, streamIntervalSec * 1000);
    return () => clearInterval(timer);
  }, [isLiveStreamActive, streamIntervalSec, simulateIncomingLead]);

  return (
    <CRMContext.Provider
      value={{
        rawRows,
        processedLeads,
        rejectedLeads,
        duplicateLeads,
        stats,
        summaries,
        asOfDate,
        selectedLeadId,
        selectedLead,
        activeTab,
        isLiveStreamActive,
        streamIntervalSec,
        activityStream,
        searchTerm,
        gradeFilter,
        regionFilter,
        statusFilter,
        ownerFilter,
        slaFilter,
        setActiveTab,
        setSelectedLeadId,
        setAsOfDate,
        setIsLiveStreamActive,
        setStreamIntervalSec,
        setSearchTerm,
        setGradeFilter,
        setRegionFilter,
        setStatusFilter,
        setOwnerFilter,
        setSlaFilter,
        updateLeadStatus,
        assignLeadOwner,
        addLeadNote,
        ingestSingleLead,
        uploadCsvData,
        runPipelineAgain,
        resetToBenchmarkData,
        simulateIncomingLead,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within CRMProvider');
  return context;
};
