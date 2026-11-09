import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Lead, LeadStatus, LeadQualification, LeadActivity, LeadHistoryItem } from '../models/lead.model';
import { INITIAL_LEADS } from './lead-mock-data';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private leadsSignal = signal<Lead[]>(INITIAL_LEADS);

  readonly leads = this.leadsSignal.asReadonly();

  // Computed summary indicators
  readonly totalLeads = computed(() => this.leads().length);
  readonly qualifiedCount = computed(() => this.leads().filter(l => l.status === 'Qualified').length);
  readonly activeCount = computed(() => this.leads().filter(l => l.status !== 'Converted' && l.status !== 'Unqualified').length);
  readonly contactedCount = computed(() => this.leads().filter(l => l.status === 'Contacted').length);
  readonly nurturingCount = computed(() => this.leads().filter(l => l.status === 'Nurturing').length);
  readonly convertedCount = computed(() => this.leads().filter(l => l.status === 'Converted').length);
  readonly unqualifiedCount = computed(() => this.leads().filter(l => l.status === 'Unqualified').length);
  readonly pendingFollowUpCount = computed(() => this.leads().filter(l => l.status !== 'Converted' && l.status !== 'Unqualified' && !!l.follow_up_date).length);
  readonly overdueCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.leads().filter(l => l.status !== 'Converted' && l.status !== 'Unqualified' && l.follow_up_date && l.follow_up_date < today).length;
  });

  getLeads(): Observable<Lead[]> {
    return of(this.leadsSignal());
  }

  getLeadById(id: number): Lead | undefined {
    return this.leadsSignal().find(l => l.lead_id === id);
  }

  createLead(data: Omit<Lead, 'lead_id' | 'lead_code'>): Lead {
    const maxId = Math.max(...this.leadsSignal().map(l => l.lead_id), 0);
    const newId = maxId + 1;
    const year = new Date().getFullYear();
    const codeSeq = String(newId).padStart(4, '0');
    const newLead: Lead = {
      ...data,
      lead_id: newId,
      lead_code: `LD-${year}-${codeSeq}`,
      status: 'New',
      priority: data.priority || 'Medium',
      consent_status: data.consent_status || 'Not given',
      follow_up_date: data.follow_up_date || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activities: [],
      documents: [],
      history: [
        {
          history_id: Date.now(),
          lead_id: newId,
          event_type: 'Created',
          changed_by: 'Berihu Esayas (Commercial Director)',
          changed_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
          change_reason: 'Lead registered into CRM'
        }
      ]
    };

    this.leadsSignal.update(leads => [newLead, ...leads]);
    return newLead;
  }

  updateLead(id: number, changes: Partial<Lead>): void {
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        return {
          ...l,
          ...changes,
          last_activity_date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      })
    );
  }

  assignLead(id: number, ownerName: string, reason: string): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        const oldOwner = l.assigned_to_name || 'Unassigned';
        const historyItem: LeadHistoryItem = {
          history_id: Date.now(),
          lead_id: id,
          event_type: 'Owner',
          old_value: oldOwner,
          new_value: ownerName,
          change_reason: reason || 'Lead assigned',
          changed_by: 'Berihu Esayas (Commercial Director)',
          changed_at: now
        };
        return {
          ...l,
          assigned_to_name: ownerName,
          assigned_date: now,
          history: [historyItem, ...(l.history || [])]
        };
      })
    );
  }

  setFollowUp(id: number, followUpDate: string, note?: string): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        const historyItem: LeadHistoryItem = {
          history_id: Date.now(),
          lead_id: id,
          event_type: 'Follow-up',
          old_value: l.follow_up_date,
          new_value: followUpDate,
          change_reason: note || 'Next contact scheduled',
          changed_by: 'Berihu Esayas (Commercial Director)',
          changed_at: now
        };
        const newActivity: LeadActivity = {
          activity_id: Date.now(),
          lead_id: id,
          activity_type: 'Follow-up',
          subject: 'Follow-up Scheduled',
          description: note || `Scheduled next contact for ${followUpDate}`,
          activity_date: followUpDate,
          performed_by: l.assigned_to_name || 'Commercial Director',
          status: 'Pending'
        };
        return {
          ...l,
          follow_up_date: followUpDate,
          activities: [newActivity, ...(l.activities || [])],
          history: [historyItem, ...(l.history || [])]
        };
      })
    );
  }

  qualifyLead(id: number, assessment: Omit<LeadQualification, 'qualification_id' | 'lead_id'>): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        const fullQual: LeadQualification = {
          ...assessment,
          qualification_id: Date.now(),
          lead_id: id
        };

        const targetStatus: LeadStatus = assessment.qualification_outcome === 'Qualified'
          ? 'Qualified'
          : assessment.qualification_outcome === 'Nurturing'
            ? 'Nurturing'
            : 'Unqualified';

        const historyItem: LeadHistoryItem = {
          history_id: Date.now(),
          lead_id: id,
          event_type: 'Assessment',
          old_value: l.status,
          new_value: targetStatus,
          change_reason: `BANT Evaluation finalized with outcome: ${assessment.qualification_outcome}`,
          changed_by: assessment.assessed_by || 'Berihu Esayas',
          changed_at: now
        };

        return {
          ...l,
          status: targetStatus,
          rating: targetStatus === 'Qualified' ? (l.rating || 'Hot') : l.rating,
          qualification: fullQual,
          history: [historyItem, ...(l.history || [])]
        };
      })
    );
  }

  disqualifyLead(id: number, reason: string, note?: string): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        const historyItem: LeadHistoryItem = {
          history_id: Date.now(),
          lead_id: id,
          event_type: 'Status',
          old_value: l.status,
          new_value: 'Unqualified',
          change_reason: `Disqualified: ${reason}. ${note || ''}`,
          changed_by: 'Berihu Esayas (Commercial Director)',
          changed_at: now
        };
        return {
          ...l,
          status: 'Unqualified',
          unqualified_reason: reason,
          unqualified_note: note,
          history: [historyItem, ...(l.history || [])]
        };
      })
    );
  }

  reopenLead(id: number, reason: string): void {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        const historyItem: LeadHistoryItem = {
          history_id: Date.now(),
          lead_id: id,
          event_type: 'Reopened',
          old_value: 'Unqualified',
          new_value: 'Contacted',
          change_reason: `Reopened: ${reason}`,
          changed_by: 'Berihu Esayas (Commercial Director)',
          changed_at: now
        };
        return {
          ...l,
          status: 'Contacted',
          unqualified_reason: undefined,
          unqualified_note: undefined,
          history: [historyItem, ...(l.history || [])]
        };
      })
    );
  }

  convertLead(id: number, dealName?: string, expectedValue?: number): { customerCode: string; contactCode: string; opportunityCode: string } {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const rand = Math.floor(1000 + Math.random() * 9000);
    const customerCode = `CUST-2026-${rand}`;
    const contactCode = `CONT-2026-${rand + 1}`;
    const opportunityCode = `OPP-2026-${rand + 2}`;

    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== id) return l;
        const historyItem: LeadHistoryItem = {
          history_id: Date.now(),
          lead_id: id,
          event_type: 'Converted',
          old_value: l.status,
          new_value: 'Converted',
          change_reason: `Converted to Customer (${customerCode}), Contact (${contactCode}), and Opportunity (${opportunityCode}). Deal: ${dealName || l.lead_name}`,
          changed_by: 'Berihu Esayas (Commercial Director)',
          changed_at: now
        };
        return {
          ...l,
          status: 'Converted',
          converted_date: now,
          customer_code: customerCode,
          contact_code: contactCode,
          opportunity_code: opportunityCode,
          estimated_value: expectedValue || l.estimated_value,
          history: [historyItem, ...(l.history || [])]
        };
      })
    );

    return { customerCode, contactCode, opportunityCode };
  }

  addActivity(leadId: number, act: Omit<LeadActivity, 'activity_id'>): void {
    const newAct: LeadActivity = {
      ...act,
      activity_id: Date.now()
    };
    this.leadsSignal.update(leads =>
      leads.map(l => {
        if (l.lead_id !== leadId) return l;
        const isFirstContact = (act.activity_type === 'Call' || act.activity_type === 'Meeting' || act.activity_type === 'Email') && l.status === 'New';
        return {
          ...l,
          status: isFirstContact ? 'Contacted' : l.status,
          first_contact_date: isFirstContact ? act.activity_date : l.first_contact_date,
          last_activity_date: act.activity_date,
          activities: [newAct, ...(l.activities || [])]
        };
      })
    );
  }

  saveNote(leadId: number, noteText: string): void {
    this.leadsSignal.update(leads =>
      leads.map(l => l.lead_id === leadId ? { ...l, note: noteText } : l)
    );
  }
}

