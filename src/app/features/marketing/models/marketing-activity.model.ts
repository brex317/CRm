export type ActivityType = 'Campaign' | 'Workshop' | 'Event' | 'Sponsorship' | 'Exhibition' | 'Content' | 'Other';
export type ActivityStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'In Progress' | 'Completed' | 'Closed' | 'Rejected' | 'Cancelled';
export type DeliveryMode = 'Physical' | 'Virtual' | 'Digital' | 'Hybrid';

export interface MarketingActivity {
  activity_id: number;
  activity_code: string;
  plan_id: number;
  plan_name?: string;
  activity_type: ActivityType;
  title: string;
  objective: string;
  target_audience?: string;
  owner_id: number;
  owner_name: string;
  start_date: string;
  end_date: string;
  actual_start_date?: string;
  actual_end_date?: string;
  delivery_mode?: DeliveryMode;
  venue_or_platform?: string;
  planned_budget: number;
  planned_leads?: number;
  budget_exception?: boolean;
  exception_reason?: string;
  exception_approved_by?: string;
  status: ActivityStatus;
  approval_route?: string;
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
  cancellation_reason?: string;
  is_strategic?: boolean;
  promotion_ref_id?: number;

  // Workshop & Event specifics
  expected_attendees?: number;
  facilitators?: string;
  agenda?: string;

  // Event & Sponsorship specifics
  organizer_name?: string;
  contract_ref?: string;
  contract_attachment?: string;
  sponsorship_fee?: number;

  // Compliance
  compliance_deviation?: boolean;
  deviation_note?: string;

  // Calculated summary
  actual_cost?: number;
  variance_amount?: number;
  variance_pct?: number;
  leads_generated?: number;
  participants_count?: number;
  content_count?: number;
}

