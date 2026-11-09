export type ParticipantSource = 'Registered' | 'Invited' | 'Walk-in' | 'Captured at event';
export type AttendanceStatus = 'Registered' | 'Attended' | 'No-show' | 'Captured';
export type CrmTransferStatus = 'Not Sent' | 'Sent';

export interface Participant {
  participant_id: number;
  participant_code?: string;
  activity_id: number;
  activity_title?: string;
  full_name: string;
  company_name?: string;
  position?: string;
  email?: string;
  phone?: string;
  participant_source: ParticipantSource;
  registration_date?: string;
  attendance_status: AttendanceStatus;
  feedback_score?: number; // 1 to 5
  feedback_comment?: string;
  consent_follow_up: boolean;
  consent_date?: string;
  consent_withdrawn_date?: string | null;

  // Internal Core CRM Lead reference (created via Create Lead action)
  lead_id?: number | null;
  lead_code?: string | null; // e.g. 'LD-2026-0100' or 'LEAD-2026-0100'
  lead_created_date?: string | null;
  lead_created_by?: string | null;

  // Compatibility fields
  crm_transfer_status?: CrmTransferStatus;
  crm_lead_id?: string;
  sent_date?: string;
  sent_by?: string;
}


