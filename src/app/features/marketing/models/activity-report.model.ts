export type ReportType = 'Digital Monthly' | 'Workshop' | 'Event';
export type ReportStatus = 'Draft' | 'Submitted' | 'Reviewed';

export interface ActivityReport {
  report_id: number;
  report_code?: string;
  activity_id: number;
  activity_title?: string;
  report_type: ReportType;
  period_start?: string;
  period_end?: string;
  summary: string;
  outcomes?: string;
  attendance_or_reach?: number;
  impressions?: number;
  clicks?: number;
  engagements?: number;
  actual_cost_to_date?: number;
  feedback_summary?: string;
  lessons_learned?: string;
  improvement_actions?: string;
  prepared_by: string;
  prepared_date: string;
  reviewed_by?: string;
  status: ReportStatus;
  form_reference?: string; // e.g. RRT/CD/FR/041, RRT/CD/FR/043
  attachment?: string;
}

