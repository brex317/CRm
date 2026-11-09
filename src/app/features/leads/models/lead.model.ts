export type LeadStatus = 'New' | 'Contacted' | 'Nurturing' | 'Qualified' | 'Unqualified' | 'Converted';
export type LeadRating = 'Hot' | 'Warm' | 'Cold';
export type LeadPriority = 'High' | 'Medium' | 'Low';
export type SourceChannel =
  | 'Website'
  | 'LinkedIn'
  | 'Social media'
  | 'Advertisement'
  | 'Promotion'
  | 'Workshop'
  | 'Event'
  | 'Campaign'
  | 'Invitation'
  | 'Referral'
  | 'Partner'
  | 'Direct inquiry'
  | 'Import'
  | 'Other';

export type ConsentStatus = 'Given' | 'Not given' | 'Withdrawn';
export type BantCriterion = 'Confirmed' | 'Partial' | 'Not confirmed' | 'Not applicable';
export type QualificationOutcome = 'Qualified' | 'Nurturing' | 'Unqualified';

export interface LeadQualification {
  qualification_id: number;
  lead_id: number;
  assessment_status: 'Draft' | 'Final';
  assessed_by: string;
  assessed_date: string;
  budget_criterion: BantCriterion;
  budget_evidence: string;
  authority_criterion: BantCriterion;
  authority_evidence: string;
  need_criterion: BantCriterion;
  need_evidence: string;
  timeline_criterion: BantCriterion;
  timeline_evidence: string;
  qualification_outcome: QualificationOutcome;
  evidence_summary: string;
}

export type ActivityType = 'Call' | 'Meeting' | 'Email' | 'Task' | 'Follow-up' | 'Discussion';

export interface LeadActivity {
  activity_id: number;
  lead_id: number;
  activity_type: ActivityType;
  subject: string;
  description: string;
  activity_date: string;
  performed_by: string;
  status: 'Completed' | 'Pending';
  outcome?: string;
}

export interface LeadDocument {
  doc_id: number;
  lead_id: number;
  file_name: string;
  file_type: string;
  file_size: string;
  uploaded_date: string;
  uploaded_by: string;
}

export interface LeadHistoryItem {
  history_id: number;
  lead_id: number;
  event_type: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  change_reason?: string;
  changed_by: string;
  changed_at: string;
}

export interface Lead {
  lead_id: number;
  lead_code: string; // LD-YYYY-NNNN
  lead_name: string; // Prospect title e.g. "ABC Construction, Packaging Supply"
  interested_in: string; // Main product/service
  product_code?: string;
  interest_notes?: string;

  // Company Information
  company_name: string;
  industry?: string;
  no_of_employees?: number;
  annual_revenue?: number;
  currency: string;

  // Contact Person
  contact_person: string;
  job_title?: string;
  email: string;
  phone: string;

  // Address
  country: string;
  city?: string;
  state?: string;
  street?: string;
  zip_code?: string;

  // Lead Source
  source_channel: SourceChannel;
  source_detail?: string;
  marketing_activity_id?: number;
  marketing_activity_name?: string;
  partner_name?: string;
  referrer_name?: string;

  // Status & Governance
  status: LeadStatus;
  rating?: LeadRating;
  priority: LeadPriority;
  unqualified_reason?: string;
  unqualified_note?: string;

  // Ownership & Dates
  assigned_to_id?: number;
  assigned_to_name?: string;
  assigned_date?: string;
  follow_up_date: string;
  first_contact_date?: string;
  last_activity_date?: string;
  note?: string;
  estimated_value?: number;

  // Consent
  consent_status: ConsentStatus;
  consent_date?: string;

  // Conversion links
  converted_date?: string;
  customer_id?: number;
  customer_code?: string;
  contact_id?: number;
  contact_code?: string;
  opportunity_id?: number;
  opportunity_code?: string;

  is_deleted?: boolean;

  // Child collections
  qualification?: LeadQualification;
  activities?: LeadActivity[];
  documents?: LeadDocument[];
  history?: LeadHistoryItem[];
}

