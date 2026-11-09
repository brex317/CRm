export type PeriodType = 'Year' | 'Quarter' | 'Month';
export type PlanStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Closed';

export interface MarketingPlan {
  plan_id: number;
  plan_code: string;
  plan_name: string;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  total_planned_budget: number;
  approved_budget?: number;
  currency: string;
  owner_id: number;
  owner_name: string;
  status: PlanStatus;
  approved_by?: string;
  approved_date?: string;
  objectives?: string;
  notes?: string;

  // Calculated properties
  activities_count?: number;
  total_allocated_budget?: number;
  remaining_budget?: number;
  budget_used_percentage?: number;
}

