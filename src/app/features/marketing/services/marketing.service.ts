import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MarketingPlan } from '../models/marketing-plan.model';
import { MarketingActivity, ActivityStatus } from '../models/marketing-activity.model';
import { ContentItem, ContentStatus } from '../models/content-item.model';
import { Participant } from '../models/participant.model';
import { MarketingCost } from '../models/marketing-cost.model';
import { ActivityReport } from '../models/activity-report.model';
import {
  INITIAL_MARKETING_PLANS,
  INITIAL_MARKETING_ACTIVITIES,
  INITIAL_CONTENT_ITEMS,
  INITIAL_PARTICIPANTS,
  INITIAL_MARKETING_COSTS,
  INITIAL_ACTIVITY_REPORTS
} from './marketing-mock-data';

export interface MarketingMetrics {
  totalApprovedBudget: number;
  totalAllocatedBudget: number;
  remainingBudget: number;
  totalActualCost: number;
  totalLeadsGenerated: number;
  totalParticipants: number;
  averageAttendanceRate: number;
  activeCampaignsCount: number;
  activeWorkshopsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  // Signals holding in-memory store (mirrors database records)
  private plansSignal = signal<MarketingPlan[]>(INITIAL_MARKETING_PLANS);
  private activitiesSignal = signal<MarketingActivity[]>(INITIAL_MARKETING_ACTIVITIES);
  private contentItemsSignal = signal<ContentItem[]>(INITIAL_CONTENT_ITEMS);
  private participantsSignal = signal<Participant[]>(INITIAL_PARTICIPANTS);
  private costsSignal = signal<MarketingCost[]>(INITIAL_MARKETING_COSTS);
  private reportsSignal = signal<ActivityReport[]>(INITIAL_ACTIVITY_REPORTS);

  // Read-only signals for components
  readonly plans = this.plansSignal.asReadonly();
  readonly activities = this.activitiesSignal.asReadonly();
  readonly contentItems = this.contentItemsSignal.asReadonly();
  readonly participants = this.participantsSignal.asReadonly();
  readonly costs = this.costsSignal.asReadonly();
  readonly reports = this.reportsSignal.asReadonly();

  // Computed summary metrics
  readonly metrics = computed<MarketingMetrics>(() => {
    const plansList = this.plansSignal();
    const activitiesList = this.activitiesSignal();
    const participantsList = this.participantsSignal();
    const costsList = this.costsSignal();

    const totalApprovedBudget = plansList
      .filter(p => p.status === 'Approved')
      .reduce((sum, p) => sum + (p.approved_budget || p.total_planned_budget), 0);

    const totalAllocatedBudget = activitiesList
      .filter(a => a.status !== 'Cancelled' && a.status !== 'Rejected')
      .reduce((sum, a) => sum + a.planned_budget, 0);

    const totalActualCost = costsList
      .filter(c => c.cost_status === 'Actual')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalLeadsGenerated = activitiesList
      .reduce((sum, a) => sum + (a.leads_generated || 0), 0);

    const totalParticipants = participantsList.length;
    const attendedCount = participantsList.filter(p => p.attendance_status === 'Attended' || p.attendance_status === 'Captured').length;
    const averageAttendanceRate = totalParticipants > 0 ? Math.round((attendedCount / totalParticipants) * 100) : 0;

    return {
      totalApprovedBudget,
      totalAllocatedBudget,
      remainingBudget: Math.max(0, totalApprovedBudget - totalAllocatedBudget),
      totalActualCost,
      totalLeadsGenerated,
      totalParticipants,
      averageAttendanceRate,
      activeCampaignsCount: activitiesList.filter(a => a.activity_type === 'Campaign' && a.status === 'In Progress').length,
      activeWorkshopsCount: activitiesList.filter(a => a.activity_type === 'Workshop' && (a.status === 'In Progress' || a.status === 'Approved')).length
    };
  });

  // --- Marketing Plans ---
  getPlans(): Observable<MarketingPlan[]> {
    return of(this.plansSignal());
  }

  getPlanById(id: number): MarketingPlan | undefined {
    return this.plansSignal().find(p => p.plan_id === id);
  }

  createPlan(plan: Omit<MarketingPlan, 'plan_id' | 'plan_code'>): MarketingPlan {
    const newId = Math.max(...this.plansSignal().map(p => p.plan_id), 0) + 1;
    const newCode = `MKT-${new Date().getFullYear()}-${String(newId).padStart(2, '0')}`;
    const newPlan: MarketingPlan = {
      ...plan,
      plan_id: newId,
      plan_code: newCode
    };
    this.plansSignal.update(plans => [newPlan, ...plans]);
    return newPlan;
  }

  updatePlan(id: number, changes: Partial<MarketingPlan>): void {
    this.plansSignal.update(plans =>
      plans.map(p => p.plan_id === id ? { ...p, ...changes } : p)
    );
  }

  deletePlan(id: number): void {
    this.plansSignal.update(plans => plans.filter(p => p.plan_id !== id));
  }

  // --- Marketing Activities ---
  getActivities(): Observable<MarketingActivity[]> {
    return of(this.activitiesSignal());
  }

  getActivityById(id: number): MarketingActivity | undefined {
    return this.activitiesSignal().find(a => a.activity_id === id);
  }

  createActivity(activity: Omit<MarketingActivity, 'activity_id' | 'activity_code'>): MarketingActivity {
    const newId = Math.max(...this.activitiesSignal().map(a => a.activity_id), 0) + 1;
    const prefix = activity.activity_type === 'Campaign' ? 'CMP'
                 : activity.activity_type === 'Workshop' ? 'WKS'
                 : activity.activity_type === 'Event' ? 'EVT'
                 : 'SPN';
    const newCode = `${prefix}-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`;
    const newActivity: MarketingActivity = {
      ...activity,
      activity_id: newId,
      activity_code: newCode,
      leads_generated: 0,
      actual_cost: 0
    };
    this.activitiesSignal.update(list => [newActivity, ...list]);
    return newActivity;
  }

  updateActivityStatus(id: number, status: ActivityStatus, reason?: string): void {
    const now = new Date().toISOString().slice(0, 10);
    this.activitiesSignal.update(list =>
      list.map(a => {
        if (a.activity_id === id) {
          const updated = { ...a, status };
          if (status === 'Approved') {
            updated.approved_date = now;
            updated.approved_by = 'Berihu Esayas (CCO)';
          } else if (status === 'In Progress' && !updated.actual_start_date) {
            updated.actual_start_date = now;
          } else if (status === 'Completed' && !updated.actual_end_date) {
            updated.actual_end_date = now;
          } else if (status === 'Rejected') {
            updated.rejection_reason = reason || 'Budget or strategic realignment required';
          } else if (status === 'Cancelled') {
            updated.cancellation_reason = reason || 'Operation cancelled by department';
          }
          return updated;
        }
        return a;
      })
    );
  }

  deleteActivity(id: number): void {
    this.activitiesSignal.update(list => list.filter(a => a.activity_id !== id));
  }

  // --- Content Items ---
  getContentItems(): Observable<ContentItem[]> {
    return of(this.contentItemsSignal());
  }

  createContentItem(item: Omit<ContentItem, 'content_id' | 'revision_no'>): ContentItem {
    const newId = Math.max(...this.contentItemsSignal().map(c => c.content_id), 0) + 1;
    const newItem: ContentItem = {
      ...item,
      content_id: newId,
      revision_no: 1
    };
    this.contentItemsSignal.update(list => [newItem, ...list]);
    return newItem;
  }

  updateContentStatus(id: number, status: ContentStatus): void {
    const now = new Date().toISOString().slice(0, 10);
    this.contentItemsSignal.update(list =>
      list.map(c => {
        if (c.content_id === id) {
          const updated = { ...c, status };
          if (status === 'Published') {
            updated.actual_publish_date = now;
          } else if (status === 'Approved') {
            updated.approved_date = now;
            updated.approved_by = 'Hana Girma (SMM)';
          }
          return updated;
        }
        return c;
      })
    );
  }

  updateContentMetrics(id: number, metrics: { impressions?: number; reach?: number; clicks?: number; engagements?: number }): void {
    const now = new Date().toISOString().slice(0, 10);
    this.contentItemsSignal.update(list =>
      list.map(c => c.content_id === id ? { ...c, ...metrics, metrics_updated_on: now } : c)
    );
  }

  deleteContentItem(id: number): void {
    this.contentItemsSignal.update(list => list.filter(c => c.content_id !== id));
  }

  // --- Participants & Core CRM "Create Lead" ---
  getParticipants(): Observable<Participant[]> {
    return of(this.participantsSignal());
  }

  createParticipant(participant: Omit<Participant, 'participant_id' | 'crm_transfer_status'>): Participant {
    const newId = Math.max(...this.participantsSignal().map(p => p.participant_id), 0) + 1;
    const newParticipant: Participant = {
      ...participant,
      participant_id: newId,
      participant_code: `RARAS-${100000 + newId}`,
      lead_id: null,
      lead_code: null,
      lead_created_date: null,
      lead_created_by: null,
      crm_transfer_status: 'Not Sent'
    };
    this.participantsSignal.update(list => [newParticipant, ...list]);
    return newParticipant;
  }

  /**
   * Mark participant as Attended.
   * If the participant has consent and valid contact details, it automatically creates
   * a qualified Lead in Lead Management (Section 2.6).
   */
  markAttended(participantId: number): { success: boolean; leadCode?: string; message: string } {
    const participant = this.participantsSignal().find(p => p.participant_id === participantId);
    if (!participant) {
      return { success: false, message: 'Participant not found.' };
    }

    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const currentUser = 'Berihu Esayas (Commercial Director)';

    let generatedLeadCode: string | null = participant.lead_code || null;
    let generatedLeadId: number | null = participant.lead_id || null;
    let leadCreated = false;

    // Auto-create lead upon attendance if eligible per Section 2.6
    if (!participant.lead_id && !participant.lead_code && participant.consent_follow_up && !participant.consent_withdrawn_date && (participant.email || participant.phone)) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      generatedLeadCode = `LEAD-${new Date().getFullYear()}-${randomNum}`;
      generatedLeadId = randomNum;
      leadCreated = true;
    }

    this.participantsSignal.update(list =>
      list.map(p => {
        if (p.participant_id === participantId) {
          return {
            ...p,
            attendance_status: 'Attended',
            lead_id: generatedLeadId,
            lead_code: generatedLeadCode,
            lead_created_date: leadCreated ? timestamp : p.lead_created_date,
            lead_created_by: leadCreated ? currentUser : p.lead_created_by,
            crm_transfer_status: generatedLeadCode ? 'Sent' : p.crm_transfer_status,
            crm_lead_id: generatedLeadCode || p.crm_lead_id
          };
        }
        return p;
      })
    );

    if (leadCreated && generatedLeadCode) {
      this.activitiesSignal.update(list =>
        list.map(a => {
          if (a.activity_id === participant.activity_id) {
            return {
              ...a,
              leads_generated: (a.leads_generated || 0) + 1
            };
          }
          return a;
        })
      );

      return {
        success: true,
        leadCode: generatedLeadCode,
        message: `${participant.full_name} marked Attended. Lead ${generatedLeadCode} created in Lead Management.`
      };
    }

    return {
      success: true,
      message: `${participant.full_name} marked Attended.`
    };
  }

  markNoShow(participantId: number): { success: boolean; message: string } {
    const participant = this.participantsSignal().find(p => p.participant_id === participantId);
    if (!participant) {
      return { success: false, message: 'Participant not found.' };
    }

    this.participantsSignal.update(list =>
      list.map(p => p.participant_id === participantId ? { ...p, attendance_status: 'No-show' } : p)
    );

    return {
      success: true,
      message: `${participant.full_name} marked as No-show.`
    };
  }

  /**
   * Section 2.6: Create Lead
   * Marketing calls the Lead creation function inside Core CRM with the person's details,
   * the source channel (Workshop or Event), and the parent activity.
   */
  createLead(participantId: number): { success: boolean; leadCode?: string; message: string } {
    const participant = this.participantsSignal().find(p => p.participant_id === participantId);
    if (!participant) {
      return { success: false, message: 'Participant not found.' };
    }

    if (participant.consent_withdrawn_date) {
      return { 
        success: false, 
        message: `Cannot create lead: Follow-up consent was withdrawn on ${participant.consent_withdrawn_date}.` 
      };
    }

    if (!participant.consent_follow_up) {
      return { 
        success: false, 
        message: 'Cannot create lead: Follow-up commercial consent was not granted.' 
      };
    }

    if (participant.attendance_status !== 'Attended' && participant.attendance_status !== 'Captured') {
      return {
        success: false,
        message: `Cannot create lead: Attendance must be "Attended" or "Captured" (current: ${participant.attendance_status}).`
      };
    }

    if (!participant.email && !participant.phone) {
      return { 
        success: false, 
        message: 'Cannot create lead: At least an official email or contact phone is required.' 
      };
    }

    if (participant.lead_id || participant.lead_code) {
      return { 
        success: false, 
        message: `A Lead has already been created for this participant (${participant.lead_code || participant.crm_lead_id}).` 
      };
    }

    // Generate Lead Code (spec format: LD-YYYY-NNNN or LEAD-YYYY-NNNN)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedLeadCode = `LEAD-${new Date().getFullYear()}-${randomNum}`;
    const generatedLeadId = randomNum;
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const currentUser = 'Berihu Esayas (Commercial Director)';

    this.participantsSignal.update(list =>
      list.map(p => {
        if (p.participant_id === participantId) {
          return {
            ...p,
            lead_id: generatedLeadId,
            lead_code: generatedLeadCode,
            lead_created_date: timestamp,
            lead_created_by: currentUser,
            crm_transfer_status: 'Sent',
            crm_lead_id: generatedLeadCode,
            sent_date: timestamp,
            sent_by: currentUser
          };
        }
        return p;
      })
    );

    // Increment leads generated count on parent activity
    this.activitiesSignal.update(list =>
      list.map(a => {
        if (a.activity_id === participant.activity_id) {
          return {
            ...a,
            leads_generated: (a.leads_generated || 0) + 1
          };
        }
        return a;
      })
    );

    return {
      success: true,
      leadCode: generatedLeadCode,
      message: `Lead ${generatedLeadCode} successfully created for ${participant.full_name} in Core CRM.`
    };
  }

  // Backwards-compatible alias for any callers
  sendToCrm(participantId: number): { success: boolean; leadId?: string; message: string } {
    const res = this.createLead(participantId);
    return {
      success: res.success,
      leadId: res.leadCode,
      message: res.message
    };
  }

  deleteParticipant(id: number): void {
    this.participantsSignal.update(list => list.filter(p => p.participant_id !== id));
  }

  // --- Marketing Costs ---
  getCosts(): Observable<MarketingCost[]> {
    return of(this.costsSignal());
  }

  createCost(cost: Omit<MarketingCost, 'cost_id'>): MarketingCost {
    const newId = Math.max(...this.costsSignal().map(c => c.cost_id), 0) + 1;
    const newCost: MarketingCost = {
      ...cost,
      cost_id: newId
    };
    this.costsSignal.update(list => [newCost, ...list]);

    // Recalculate actual cost for parent activity
    this.recalculateActivityCost(cost.activity_id);
    return newCost;
  }

  deleteCost(id: number): void {
    const target = this.costsSignal().find(c => c.cost_id === id);
    this.costsSignal.update(list => list.filter(c => c.cost_id !== id));
    if (target) {
      this.recalculateActivityCost(target.activity_id);
    }
  }

  private recalculateActivityCost(activityId: number): void {
    const total = this.costsSignal()
      .filter(c => c.activity_id === activityId && c.cost_status === 'Actual')
      .reduce((sum, c) => sum + c.amount, 0);

    this.activitiesSignal.update(list =>
      list.map(a => a.activity_id === activityId ? { ...a, actual_cost: total } : a)
    );
  }

  // --- Activity Reports ---
  getReports(): Observable<ActivityReport[]> {
    return of(this.reportsSignal());
  }

  createReport(report: Omit<ActivityReport, 'report_id'>): ActivityReport {
    const newId = Math.max(...this.reportsSignal().map(r => r.report_id), 0) + 1;
    const newReport: ActivityReport = {
      ...report,
      report_id: newId
    };
    this.reportsSignal.update(list => [newReport, ...list]);
    return newReport;
  }

  submitReport(id: number): void {
    this.reportsSignal.update(list =>
      list.map(r => r.report_id === id ? { ...r, status: 'Submitted' } : r)
    );
  }

  reviewReport(id: number, reviewer: string = 'Berihu Esayas (CCO)'): void {
    this.reportsSignal.update(list =>
      list.map(r => r.report_id === id ? { ...r, status: 'Reviewed', reviewed_by: reviewer } : r)
    );
  }

  deleteReport(id: number): void {
    this.reportsSignal.update(list => list.filter(r => r.report_id !== id));
  }
}
