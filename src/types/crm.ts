export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Lost';

export type LeadGrade = 'Hot' | 'Warm' | 'Cold';

export type Region = 'North' | 'South' | 'East' | 'West';

export type LeadSource =
  | 'Referral'
  | 'Webinar'
  | 'Website'
  | 'Trade Show'
  | 'Social Media'
  | 'Cold Call';

export type TimelineOption = '0-1 Months' | '1-3 Months' | '3-6 Months' | '6+ Months';

export interface ScoreBreakdown {
  sourcePts: number;
  budgetPts: number;
  sizePts: number;
  engagementPts: number;
  timelinePts: number;
  total: number;
}

export interface LeadAuditLog {
  timestamp: string;
  action: string;
  details: string;
  actor: 'Pipeline Engine' | 'Sales Rep' | 'User';
}

export interface LeadNote {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface Lead {
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  source: LeadSource | string;
  region: Region | string;
  created_date: string; // ISO date string YYYY-MM-DD
  status: LeadStatus;
  budget: number;
  company_size: number;
  timeline: TimelineOption | string;
  website_visits: number;
  emails_opened: number;
  
  // Pipeline-generated fields
  lead_score: number;
  grade: LeadGrade;
  owner: string;
  follow_up_due?: string; // ISO date string
  sla_breached: boolean;
  days_overdue: number;
  reject_reason?: string;
  score_breakdown?: ScoreBreakdown;
  
  // Interactive UI fields
  notes?: LeadNote[];
  audit_log?: LeadAuditLog[];
}

export interface RejectedLead {
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  region: string;
  created_date: string;
  company: string;
  industry: string;
  status: string;
  budget: any;
  company_size: any;
  timeline: string;
  website_visits: any;
  emails_opened: any;
  reject_reason: string;
}

export interface DuplicateLead {
  lead_id: string;
  name: string;
  email: string;
  created_date: string;
  kept_lead_id?: string;
  reject_reason: string;
}

export interface SalesRep {
  name: string;
  region: Region;
  level: 'Senior' | 'Junior';
  email: string;
  activeLeadsCount: number;
  hotLeadsCount: number;
  slaBreachesCount: number;
}

export interface PipelineStats {
  input_rows: number;
  valid: number;
  rejected: number;
  duplicates: number;
  processed: number;
  sla_breached_count: number;
  hot_leads_count: number;
  warm_leads_count: number;
  cold_leads_count: number;
}

export interface GradeSummary {
  grade: LeadGrade;
  leads: number;
  avg_score: number;
  total_budget: number;
}

export interface SourceSummary {
  source: string;
  leads: number;
  avg_score: number;
  hot_leads: number;
  converted: number;
  conversion_rate_pct: number;
}

export interface OwnerSummary {
  owner: string;
  region: Region | string;
  level: string;
  open_leads: number;
  hot_leads: number;
  sla_breaches: number;
}
