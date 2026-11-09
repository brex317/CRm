export type CostType =
  | 'Venue'
  | 'Materials'
  | 'Facilitator'
  | 'Booth'
  | 'Sponsorship fee'
  | 'Design'
  | 'Catering'
  | 'Travel'
  | 'Other';

export type CostStatus = 'Estimated' | 'Actual';
export type PaymentStatus = 'Not Submitted' | 'Submitted to Finance' | 'Posted' | 'Paid';

export interface MarketingCost {
  cost_id: number;
  cost_code?: string;
  activity_id: number;
  activity_title?: string;
  cost_type: CostType;
  description: string;
  cost_status: CostStatus;
  amount: number;
  currency: string;
  cost_date: string;
  vendor_name?: string;
  reference_no?: string;
  attachment?: string;
  vendor_id?: number;
  payment_status?: PaymentStatus;
  finance_ref?: string;
  recorded_by: string;
}

