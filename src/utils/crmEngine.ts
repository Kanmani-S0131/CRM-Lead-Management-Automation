import {
  Lead,
  RejectedLead,
  DuplicateLead,
  LeadGrade,
  LeadStatus,
  Region,
  SalesRep,
  PipelineStats,
  GradeSummary,
  SourceSummary,
  OwnerSummary,
  ScoreBreakdown,
} from '../types/crm';

// --- CONFIG & BUSINESS RULES (matching config.py) ---
export const REQUIRED_COLUMNS = [
  'lead_id',
  'name',
  'email',
  'phone',
  'source',
  'region',
  'created_date',
];

export const OPTIONAL_DEFAULTS = {
  company: 'Unknown',
  industry: 'Unknown',
  status: 'New' as LeadStatus,
  budget: 0,
  company_size: 1,
  timeline: '6+ Months',
  website_visits: 0,
  emails_opened: 0,
};

export const VALID_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
export const OPEN_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified'];
export const SLA_STATUSES: LeadStatus[] = ['New'];
export const REGIONS: Region[] = ['North', 'South', 'East', 'West'];

export const SOURCE_POINTS: Record<string, number> = {
  Referral: 25,
  Webinar: 20,
  Website: 15,
  'Trade Show': 15,
  'Social Media': 8,
  'Cold Call': 5,
};

export const BUDGET_TIERS: [number, number][] = [
  [1_000_000, 25],
  [500_000, 20],
  [100_000, 10],
  [0, 5],
];

export const SIZE_TIERS: [number, number][] = [
  [200, 15],
  [50, 10],
  [11, 6],
  [0, 3],
];

export const TIMELINE_POINTS: Record<string, number> = {
  '0-1 Months': 20,
  '1-3 Months': 12,
  '3-6 Months': 6,
  '6+ Months': 2,
};

export const ENGAGEMENT_MAX = 15;
export const HOT_MIN = 70;
export const WARM_MIN = 40;
export const SLA_DAYS: Record<LeadGrade, number> = {
  Hot: 1,
  Warm: 3,
  Cold: 7,
};

export interface RepConfig {
  name: string;
  level: 'Senior' | 'Junior';
  email: string;
}

export const REPS: Record<Region, RepConfig[]> = {
  North: [
    { name: 'Arjun Rao', level: 'Senior', email: 'arjun.rao@leadpulse.in' },
    { name: 'Meena Iyer', level: 'Junior', email: 'meena.iyer@leadpulse.in' },
    { name: 'Karan Singh', level: 'Junior', email: 'karan.singh@leadpulse.in' },
  ],
  South: [
    { name: 'Lakshmi Nair', level: 'Senior', email: 'lakshmi.nair@leadpulse.in' },
    { name: 'Vikram Raj', level: 'Junior', email: 'vikram.raj@leadpulse.in' },
    { name: 'Divya S', level: 'Junior', email: 'divya.s@leadpulse.in' },
  ],
  East: [
    { name: 'Sourav Das', level: 'Senior', email: 'sourav.das@leadpulse.in' },
    { name: 'Priya Roy', level: 'Junior', email: 'priya.roy@leadpulse.in' },
    { name: 'Ankit Ghosh', level: 'Junior', email: 'ankit.ghosh@leadpulse.in' },
  ],
  West: [
    { name: 'Rohan Mehta', level: 'Senior', email: 'rohan.mehta@leadpulse.in' },
    { name: 'Neha Patil', level: 'Junior', email: 'neha.patil@leadpulse.in' },
    { name: 'Sameer Shah', level: 'Junior', email: 'sameer.shah@leadpulse.in' },
  ],
};

// --- VALIDATION (matching validators.py) ---
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function cleanPhone(value: any): string | null {
  if (value === null || value === undefined || value === '') return null;
  let digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function isBlank(v: any): boolean {
  return v === null || v === undefined || String(v).trim() === '';
}

function parseNum(v: any, defaultVal: number): { val: number; ok: boolean } {
  if (isBlank(v)) return { val: defaultVal, ok: true };
  const n = Number(v);
  return isNaN(n) ? { val: defaultVal, ok: false } : { val: n, ok: true };
}

export function validateRow(rec: Record<string, any>): { clean: any | null; reason: string | null } {
  const reasons: string[] = [];
  for (const c of REQUIRED_COLUMNS) {
    if (isBlank(rec[c])) {
      reasons.push(`Missing ${c}`);
    }
  }
  if (reasons.length > 0) {
    return { clean: null, reason: reasons.join('; ') };
  }

  const out: Record<string, any> = {
    lead_id: String(rec.lead_id).trim(),
    name: String(rec.name).trim(),
  };

  const email = String(rec.email).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    reasons.push('Invalid email');
  }
  out.email = email;

  const phone = cleanPhone(rec.phone);
  if (phone === null) {
    reasons.push('Invalid phone');
  }
  out.phone = phone;

  // Title case helper
  const toTitleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

  const rawSource = String(rec.source).trim();
  const matchedSource = Object.keys(SOURCE_POINTS).find(
    (k) => k.toLowerCase() === rawSource.toLowerCase()
  );
  if (!matchedSource) {
    reasons.push(`Unknown source '${rec.source}'`);
    out.source = rawSource;
  } else {
    out.source = matchedSource;
  }

  const rawRegion = toTitleCase(String(rec.region).trim()) as Region;
  if (!REGIONS.includes(rawRegion)) {
    reasons.push(`Unknown region '${rec.region}'`);
    out.region = rawRegion;
  } else {
    out.region = rawRegion;
  }

  // Validate created_date
  const createdDateStr = String(rec.created_date).trim();
  const parsedDate = new Date(createdDateStr);
  if (isNaN(parsedDate.getTime()) || createdDateStr === 'not-a-date') {
    reasons.push('Invalid created_date');
    out.created_date = createdDateStr;
  } else {
    out.created_date = createdDateStr.slice(0, 10);
  }

  const d = OPTIONAL_DEFAULTS;
  out.company = isBlank(rec.company) ? d.company : String(rec.company).trim();
  out.industry = isBlank(rec.industry) ? d.industry : String(rec.industry).trim();

  const rawStatus = isBlank(rec.status) ? d.status : (toTitleCase(String(rec.status).trim()) as LeadStatus);
  if (!VALID_STATUSES.includes(rawStatus)) {
    reasons.push(`Unknown status '${rec.status}'`);
    out.status = rawStatus;
  } else {
    out.status = rawStatus;
  }

  const rawTimeline = isBlank(rec.timeline) ? d.timeline : String(rec.timeline).trim();
  if (!TIMELINE_POINTS[rawTimeline]) {
    reasons.push(`Unknown timeline '${rec.timeline}'`);
    out.timeline = rawTimeline;
  } else {
    out.timeline = rawTimeline;
  }

  for (const col of ['budget', 'company_size', 'website_visits', 'emails_opened'] as const) {
    const { val, ok } = parseNum(rec[col], d[col]);
    if (!ok || val < 0) {
      reasons.push(`Invalid ${col}`);
    }
    out[col] = val;
  }

  return reasons.length > 0
    ? { clean: null, reason: reasons.join('; ') }
    : { clean: out, reason: null };
}

export function validateLeads(rawRows: Record<string, any>[]): {
  valid: any[];
  rejected: RejectedLead[];
} {
  const valid: any[] = [];
  const rejected: RejectedLead[] = [];

  for (const rec of rawRows) {
    const { clean, reason } = validateRow(rec);
    if (clean === null) {
      rejected.push({
        lead_id: String(rec.lead_id || 'UNKNOWN'),
        name: String(rec.name || ''),
        email: String(rec.email || ''),
        phone: String(rec.phone || ''),
        source: String(rec.source || ''),
        region: String(rec.region || ''),
        created_date: String(rec.created_date || ''),
        company: String(rec.company || ''),
        industry: String(rec.industry || ''),
        status: String(rec.status || ''),
        budget: rec.budget,
        company_size: rec.company_size,
        timeline: String(rec.timeline || ''),
        website_visits: rec.website_visits,
        emails_opened: rec.emails_opened,
        reject_reason: reason || 'Validation failed',
      });
    } else {
      valid.push(clean);
    }
  }

  return { valid, rejected };
}

// --- DEDUPLICATION (matching dedupe.py) ---
export function removeDuplicates(validRows: any[]): {
  unique: any[];
  duplicates: DuplicateLead[];
} {
  if (validRows.length === 0) {
    return { unique: [], duplicates: [] };
  }

  // Stable sort by created_date, then lead_id
  const sorted = [...validRows].sort((a, b) => {
    const dateCmp = a.created_date.localeCompare(b.created_date);
    if (dateCmp !== 0) return dateCmp;
    return a.lead_id.localeCompare(b.lead_id);
  });

  const seenEmails = new Map<string, string>(); // email -> first lead_id
  const unique: any[] = [];
  const duplicates: DuplicateLead[] = [];

  for (const row of sorted) {
    if (seenEmails.has(row.email)) {
      duplicates.push({
        lead_id: row.lead_id,
        name: row.name,
        email: row.email,
        created_date: row.created_date,
        kept_lead_id: seenEmails.get(row.email),
        reject_reason: 'Duplicate email',
      });
    } else {
      seenEmails.set(row.email, row.lead_id);
      unique.push(row);
    }
  }

  return { unique, duplicates };
}

// --- SCORING (matching scoring.py) ---
function tierPoints(val: number, tiers: [number, number][]): number {
  for (const [threshold, pts] of tiers) {
    if (val >= threshold) return pts;
  }
  return 0;
}

export function computeLeadScore(row: any): { score: number; grade: LeadGrade; breakdown: ScoreBreakdown } {
  const sourcePts = SOURCE_POINTS[row.source] || 0;
  const budgetPts = tierPoints(Number(row.budget || 0), BUDGET_TIERS);
  const sizePts = tierPoints(Number(row.company_size || 0), SIZE_TIERS);
  const engagementPts = Math.min(
    ENGAGEMENT_MAX,
    Number(row.website_visits || 0) * 2 + Number(row.emails_opened || 0)
  );
  const timelinePts = TIMELINE_POINTS[row.timeline] || 0;

  const total = sourcePts + budgetPts + sizePts + engagementPts + timelinePts;
  const grade: LeadGrade = total >= HOT_MIN ? 'Hot' : total >= WARM_MIN ? 'Warm' : 'Cold';

  return {
    score: total,
    grade,
    breakdown: {
      sourcePts,
      budgetPts,
      sizePts,
      engagementPts,
      timelinePts,
      total,
    },
  };
}

export function addScores(rows: any[]): any[] {
  return rows.map((r) => {
    const { score, grade, breakdown } = computeLeadScore(r);
    return {
      ...r,
      lead_score: score,
      grade,
      score_breakdown: breakdown,
    };
  });
}

// --- ASSIGNMENT (matching assignment.py) ---
export function addAssignments(rows: any[]): any[] {
  const counters: Record<string, number> = {};

  return rows.map((row) => {
    if (!OPEN_STATUSES.includes(row.status)) {
      return { ...row, owner: 'N/A (closed)' };
    }

    const level = row.grade === 'Hot' ? 'Senior' : 'Junior';
    const region = row.region as Region;
    const team = REPS[region] || REPS.North;
    const pool = team.filter((r) => r.level === level);
    const effectivePool = pool.length > 0 ? pool : team;

    const key = `${region}_${level}`;
    const idx = counters[key] || 0;
    const chosenRep = effectivePool[idx % effectivePool.length].name;
    counters[key] = idx + 1;

    return {
      ...row,
      owner: chosenRep,
    };
  });
}

// --- FOLLOW-UP & SLA (matching followup.py) ---
export function addFollowup(rows: any[], asOfDateStr: string): Lead[] {
  const asOf = new Date(asOfDateStr);
  asOf.setHours(0, 0, 0, 0);

  return rows.map((row) => {
    const isOpen = OPEN_STATUSES.includes(row.status);
    let followUpDueStr: string | undefined = undefined;
    let slaBreached = false;
    let daysOverdue = 0;

    if (isOpen) {
      const created = new Date(row.created_date);
      created.setHours(0, 0, 0, 0);
      const slaDays = SLA_DAYS[row.grade as LeadGrade] || 3;
      const dueDate = new Date(created.getTime() + slaDays * 24 * 60 * 60 * 1000);
      followUpDueStr = dueDate.toISOString().slice(0, 10);

      // SLA applies to "New" leads
      if (SLA_STATUSES.includes(row.status) && dueDate.getTime() < asOf.getTime()) {
        slaBreached = true;
        const diffMs = asOf.getTime() - dueDate.getTime();
        daysOverdue = Math.floor(diffMs / (24 * 60 * 60 * 1000));
      }
    }

    return {
      ...row,
      follow_up_due: followUpDueStr,
      sla_breached: slaBreached,
      days_overdue: daysOverdue,
      notes: row.notes || [],
      audit_log: row.audit_log || [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'Pipeline Processed',
          details: `Score ${row.lead_score} (${row.grade}) · Assigned to ${row.owner} · Due ${followUpDueStr || 'N/A'}`,
          actor: 'Pipeline Engine',
        },
      ],
    } as Lead;
  });
}

// --- END-TO-END PIPELINE RUNNER (matching pipeline.py) ---
export function runCompletePipeline(
  rawRows: Record<string, any>[],
  asOfDateStr: string = '2026-11-02'
): {
  processed: Lead[];
  rejected: RejectedLead[];
  duplicates: DuplicateLead[];
  stats: PipelineStats;
} {
  const { valid, rejected } = validateLeads(rawRows);
  const { unique, duplicates } = removeDuplicates(valid);
  const scored = addScores(unique);
  const assigned = addAssignments(scored);
  const processed = addFollowup(assigned, asOfDateStr);

  const hotCount = processed.filter((l) => l.grade === 'Hot').length;
  const warmCount = processed.filter((l) => l.grade === 'Warm').length;
  const coldCount = processed.filter((l) => l.grade === 'Cold').length;
  const slaBreachedCount = processed.filter((l) => l.sla_breached).length;

  const stats: PipelineStats = {
    input_rows: rawRows.length,
    valid: valid.length,
    rejected: rejected.length,
    duplicates: duplicates.length,
    processed: processed.length,
    sla_breached_count: slaBreachedCount,
    hot_leads_count: hotCount,
    warm_leads_count: warmCount,
    cold_leads_count: coldCount,
  };

  return { processed, rejected, duplicates, stats };
}

// --- SUMMARIES & REPORTS (matching reports.py) ---
export function buildSummaries(processed: Lead[]): {
  byGrade: GradeSummary[];
  bySource: SourceSummary[];
  byOwner: OwnerSummary[];
  slaBreaches: Lead[];
} {
  // By Grade
  const gradeMap: Record<LeadGrade, { count: number; totalScore: number; totalBudget: number }> = {
    Hot: { count: 0, totalScore: 0, totalBudget: 0 },
    Warm: { count: 0, totalScore: 0, totalBudget: 0 },
    Cold: { count: 0, totalScore: 0, totalBudget: 0 },
  };

  processed.forEach((l) => {
    if (gradeMap[l.grade]) {
      gradeMap[l.grade].count += 1;
      gradeMap[l.grade].totalScore += l.lead_score;
      gradeMap[l.grade].totalBudget += l.budget || 0;
    }
  });

  const byGrade: GradeSummary[] = (['Hot', 'Warm', 'Cold'] as LeadGrade[]).map((grade) => {
    const d = gradeMap[grade];
    return {
      grade,
      leads: d.count,
      avg_score: d.count > 0 ? Math.round((d.totalScore / d.count) * 10) / 10 : 0,
      total_budget: d.totalBudget,
    };
  });

  // By Source
  const sourceMap: Record<string, { count: number; totalScore: number; hot: number; converted: number }> = {};
  processed.forEach((l) => {
    if (!sourceMap[l.source]) {
      sourceMap[l.source] = { count: 0, totalScore: 0, hot: 0, converted: 0 };
    }
    sourceMap[l.source].count += 1;
    sourceMap[l.source].totalScore += l.lead_score;
    if (l.grade === 'Hot') sourceMap[l.source].hot += 1;
    if (l.status === 'Converted') sourceMap[l.source].converted += 1;
  });

  const bySource: SourceSummary[] = Object.entries(sourceMap).map(([source, d]) => ({
    source,
    leads: d.count,
    avg_score: d.count > 0 ? Math.round((d.totalScore / d.count) * 10) / 10 : 0,
    hot_leads: d.hot,
    converted: d.converted,
    conversion_rate_pct: d.count > 0 ? Math.round((d.converted / d.count) * 1000) / 10 : 0,
  }));

  // By Owner
  const ownerMap: Record<string, { open: number; hot: number; breaches: number }> = {};
  processed
    .filter((l) => l.owner !== 'N/A (closed)')
    .forEach((l) => {
      if (!ownerMap[l.owner]) {
        ownerMap[l.owner] = { open: 0, hot: 0, breaches: 0 };
      }
      ownerMap[l.owner].open += 1;
      if (l.grade === 'Hot') ownerMap[l.owner].hot += 1;
      if (l.sla_breached) ownerMap[l.owner].breaches += 1;
    });

  // Attach metadata to rep
  const allRepsList: { name: string; region: Region; level: string }[] = [];
  (Object.keys(REPS) as Region[]).forEach((reg) => {
    REPS[reg].forEach((r) => {
      allRepsList.push({ name: r.name, region: reg, level: r.level });
    });
  });

  const byOwner: OwnerSummary[] = allRepsList.map((r) => {
    const d = ownerMap[r.name] || { open: 0, hot: 0, breaches: 0 };
    return {
      owner: r.name,
      region: r.region,
      level: r.level,
      open_leads: d.open,
      hot_leads: d.hot,
      sla_breaches: d.breaches,
    };
  });

  // SLA Breaches sorted by days_overdue descending
  const slaBreaches = processed
    .filter((l) => l.sla_breached)
    .sort((a, b) => b.days_overdue - a.days_overdue);

  return { byGrade, bySource, byOwner, slaBreaches };
}

// --- SYNTHETIC DATASET GENERATOR (matching generate_dataset.py) ---
// Pseudo-random generator with fixed seed 42
class PseudoRandom {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  choices<T>(arr: T[], weights: number[]): T {
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = this.next() * sum;
    for (let i = 0; i < arr.length; i++) {
      if (r < weights[i]) return arr[i];
      r -= weights[i];
    }
    return arr[arr.length - 1];
  }
  randint(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export function generateSyntheticRawLeads(n: number = 120, seed: number = 42): Record<string, any>[] {
  const rnd = new PseudoRandom(seed);
  const FIRST = [
    'Aarav', 'Diya', 'Rahul', 'Sneha', 'Vijay', 'Anita', 'Suresh', 'Kavya', 'Imran', 'Pooja',
    'Nikhil', 'Ritu', 'Manoj', 'Swathi', 'Harish', 'Farah', 'Deepak', 'Tanya', 'Gokul', 'Isha',
  ];
  const LAST = ['Sharma', 'Kumar', 'Nair', 'Reddy', 'Patel', 'Khan', 'Das', 'Iyer', 'Singh', 'Menon'];
  const COMPANIES = [
    'Zenith Textiles', 'BlueOak Logistics', 'Nimbus Foods', 'Orbit Pharma', 'Kaveri Agro',
    'Praxis Software', 'Lotus Retail', 'Vertex Steel', 'Pearl Hospitality', 'Helix Auto',
  ];
  const INDUSTRIES = ['Manufacturing', 'Logistics', 'Retail', 'Healthcare', 'IT Services', 'Hospitality'];

  const rows: Record<string, any>[] = [];
  const baseDate = new Date('2026-10-15');

  const sources = Object.keys(SOURCE_POINTS);
  const timelines = Object.keys(TIMELINE_POINTS);
  const budgets = [30000, 80000, 150000, 400000, 600000, 900000, 1200000, 2500000];
  const sizes = [3, 8, 15, 40, 75, 150, 300, 800];

  for (let i = 1; i <= n; i++) {
    const first = rnd.choice(FIRST);
    const last = rnd.choice(LAST);
    const daysAgo = rnd.randint(0, 60);
    const leadDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const prefix = rnd.choice(['', '+91 ']);
    const firstDigit = rnd.randint(6, 9);
    let remainingDigits = '';
    for (let d = 0; d < 9; d++) remainingDigits += rnd.randint(0, 9);
    const phone = prefix + firstDigit + remainingDigits;

    rows.push({
      lead_id: `L${String(i).padStart(4, '0')}`,
      name: `${first} ${last}`,
      company: rnd.choice(COMPANIES),
      industry: rnd.choice(INDUSTRIES),
      email: `${first}.${last}${i}@example.com`.toLowerCase(),
      phone: phone,
      source: rnd.choice(sources),
      region: rnd.choice(REGIONS),
      created_date: leadDate.toISOString().slice(0, 10),
      status: rnd.choices(VALID_STATUSES, [40, 25, 15, 8, 12]),
      budget: rnd.choice(budgets),
      company_size: rnd.choice(sizes),
      timeline: rnd.choice(timelines),
      website_visits: rnd.randint(0, 9),
      emails_opened: rnd.randint(0, 8),
    });
  }

  // --- Deliberate data-quality issues (matching generate_dataset.py) ---
  // 6 duplicate emails, later date (+3 days)
  for (let k = 0; k < 6; k++) {
    const d = { ...rows[k] };
    d.lead_id = `L${String(n + 1 + k).padStart(4, '0')}`;
    const origDate = new Date(d.created_date);
    origDate.setDate(origDate.getDate() + 3);
    d.created_date = origDate.toISOString().slice(0, 10);
    rows.push(d);
  }

  // 4 bad emails
  for (const k of [10, 11, 12, 13]) {
    rows[k].email = rows[k].email.replace('@', '');
  }

  // 3 missing phones
  for (const k of [20, 21, 22]) {
    rows[k].phone = '';
  }

  // 2 bad dates
  for (const k of [30, 31]) {
    rows[k].created_date = 'not-a-date';
  }

  // 2 negative budgets
  for (const k of [40, 41]) {
    rows[k].budget = -5000;
  }

  // 1 unknown source "Billboard"
  rows[50].source = 'Billboard';

  return rows;
}
