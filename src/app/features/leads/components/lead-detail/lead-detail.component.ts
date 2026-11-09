import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeadService } from '../../services/lead.service';
import { Lead, LeadStatus, LeadActivity, ActivityType } from '../../models/lead.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './lead-detail.component.html'
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private leadService = inject(LeadService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  leadId = signal<number>(1);
  lead = computed(() => this.leadService.getLeadById(this.leadId()));

  // Active section tab
  activeSection = signal<'all' | 'general' | 'company' | 'product' | 'source' | 'bant' | 'activities' | 'documents' | 'history'>('all');
  selectedActivityFilter = signal<string>('All');

  // Inline forms
  isLogActivityOpen = signal<boolean>(false);
  isBantModalOpen = signal<boolean>(false);
  isConvertModalOpen = signal<boolean>(false);
  isFollowUpModalOpen = signal<boolean>(false);
  isAssignModalOpen = signal<boolean>(false);
  isDisqualifyModalOpen = signal<boolean>(false);
  isReopenModalOpen = signal<boolean>(false);
  isUploadDocModalOpen = signal<boolean>(false);

  activityForm: FormGroup;
  bantForm: FormGroup;
  followUpForm: FormGroup;
  assignForm: FormGroup;
  convertForm: FormGroup;
  disqualifyForm: FormGroup;
  reopenForm: FormGroup;
  docForm: FormGroup;
  noteForm: FormGroup;

  teamMembers = [
    'Berihu Esayas (Commercial Director)',
    'Hana Girma (SMM)',
    'Samuel Tilahun (STL)',
    'Bekele Mengistu (Corporate Accounts)'
  ];

  unqualifiedReasons = [
    'Out of territory or not served',
    'No budget',
    'Not a fit',
    'No response',
    'Chose competitor',
    'Duplicate',
    'Invalid contact data',
    'Not interested',
    'Other'
  ];

  constructor() {
    this.activityForm = this.fb.group({
      activity_type: ['Call', Validators.required],
      subject: ['', Validators.required],
      description: ['', Validators.required],
      outcome: [''],
      activity_date: [new Date().toISOString().replace('T', ' ').substring(0, 16), Validators.required]
    });

    this.bantForm = this.fb.group({
      assessed_by: ['Berihu Esayas (Commercial Director)', Validators.required],
      budget_criterion: ['Confirmed', Validators.required],
      budget_evidence: ['', Validators.required],
      authority_criterion: ['Confirmed', Validators.required],
      authority_evidence: ['', Validators.required],
      need_criterion: ['Confirmed', Validators.required],
      need_evidence: ['', Validators.required],
      timeline_criterion: ['Confirmed', Validators.required],
      timeline_evidence: ['', Validators.required],
      qualification_outcome: ['Qualified', Validators.required],
      evidence_summary: ['', Validators.required]
    });

    this.followUpForm = this.fb.group({
      follow_up_date: ['', Validators.required],
      note: ['']
    });

    this.assignForm = this.fb.group({
      assigned_to_name: ['', Validators.required],
      reason: ['', Validators.required]
    });

    this.convertForm = this.fb.group({
      deal_name: ['', Validators.required],
      expected_value: [0, Validators.required]
    });

    this.disqualifyForm = this.fb.group({
      unqualified_reason: ['Out of territory or not served', Validators.required],
      unqualified_note: ['', Validators.required]
    });

    this.reopenForm = this.fb.group({
      reopen_reason: ['', Validators.required]
    });

    this.docForm = this.fb.group({
      file_name: ['', Validators.required],
      file_type: ['PDF', Validators.required],
      file_size: ['1.5 MB']
    });

    this.noteForm = this.fb.group({
      note: ['']
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.leadId.set(Number(idParam));
      const current = this.lead();
      if (current) {
        this.noteForm.patchValue({ note: current.note || '' });
      }
    }
  }

  setSection(section: 'all' | 'general' | 'company' | 'product' | 'source' | 'bant' | 'activities' | 'documents' | 'history'): void {
    this.activeSection.set(section);
  }

  // Filtered Activities
  filteredActivities = computed(() => {
    const l = this.lead();
    if (!l || !l.activities) return [];
    const f = this.selectedActivityFilter();
    if (f === 'All') return l.activities;
    return l.activities.filter(a => a.activity_type === f);
  });

  saveNote(): void {
    const l = this.lead();
    if (!l) return;
    const text = this.noteForm.value.note;
    this.leadService.saveNote(l.lead_id, text);
    this.toast.success('Internal lead note saved successfully.');
  }

  // Activity submit
  submitActivity(): void {
    const l = this.lead();
    if (!l || this.activityForm.invalid) return;
    const val = this.activityForm.value;
    this.leadService.addActivity(l.lead_id, {
      lead_id: l.lead_id,
      activity_type: val.activity_type as ActivityType,
      subject: val.subject,
      description: val.description,
      outcome: val.outcome,
      activity_date: val.activity_date,
      performed_by: l.assigned_to_name || 'Berihu Esayas',
      status: 'Completed'
    });
    this.toast.success(`${val.activity_type} logged into activity timeline.`);
    this.activityForm.reset({
      activity_type: 'Call',
      subject: '',
      description: '',
      outcome: '',
      activity_date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });
    this.isLogActivityOpen.set(false);
  }

  // BANT Modal
  openBantModal(): void {
    const l = this.lead();
    if (!l) return;
    const q = l.qualification;
    this.bantForm.patchValue({
      assessed_by: q?.assessed_by || 'Berihu Esayas (Commercial Director)',
      budget_criterion: q?.budget_criterion || 'Confirmed',
      budget_evidence: q?.budget_evidence || 'Approved commercial procurement budget verified.',
      authority_criterion: q?.authority_criterion || 'Confirmed',
      authority_evidence: q?.authority_evidence || `${l.contact_person} has decision authority.`,
      need_criterion: q?.need_criterion || 'Confirmed',
      need_evidence: q?.need_evidence || `Operational requirement for ${l.interested_in}.`,
      timeline_criterion: q?.timeline_criterion || 'Confirmed',
      timeline_evidence: q?.timeline_evidence || 'Delivery deadline confirmed for upcoming quarter.',
      qualification_outcome: q?.qualification_outcome || 'Qualified',
      evidence_summary: q?.evidence_summary || 'Enterprise requirement verified with high probability.'
    });
    this.isBantModalOpen.set(true);
  }

  submitBant(): void {
    const l = this.lead();
    if (!l || this.bantForm.invalid) return;
    const val = this.bantForm.value;
    this.leadService.qualifyLead(l.lead_id, {
      ...val,
      assessment_status: 'Final',
      assessed_date: new Date().toISOString().split('T')[0]
    });
    this.toast.success(`BANT qualification finalized! Status updated to ${val.qualification_outcome}.`);
    this.isBantModalOpen.set(false);
  }

  // Convert Modal
  openConvertModal(): void {
    const l = this.lead();
    if (!l) return;
    this.convertForm.patchValue({
      deal_name: `${l.company_name} - ${l.interested_in}`,
      expected_value: l.estimated_value || 2500000
    });
    this.isConvertModalOpen.set(true);
  }

  submitConvert(): void {
    const l = this.lead();
    if (!l || this.convertForm.invalid) return;
    const { deal_name, expected_value } = this.convertForm.value;
    const res = this.leadService.convertLead(l.lead_id, deal_name, expected_value);
    this.toast.success(`Lead successfully converted! Customer (${res.customerCode}) and Opportunity (${res.opportunityCode}) created.`);
    this.isConvertModalOpen.set(false);
  }

  // Follow-up
  openFollowUpModal(): void {
    const l = this.lead();
    if (!l) return;
    this.followUpForm.patchValue({
      follow_up_date: l.follow_up_date,
      note: ''
    });
    this.isFollowUpModalOpen.set(true);
  }

  submitFollowUp(): void {
    const l = this.lead();
    if (!l || this.followUpForm.invalid) return;
    const { follow_up_date, note } = this.followUpForm.value;
    this.leadService.setFollowUp(l.lead_id, follow_up_date, note);
    this.toast.success(`Follow-up scheduled for ${follow_up_date}.`);
    this.isFollowUpModalOpen.set(false);
  }

  // Assign
  openAssignModal(): void {
    const l = this.lead();
    if (!l) return;
    this.assignForm.patchValue({
      assigned_to_name: l.assigned_to_name || this.teamMembers[0],
      reason: ''
    });
    this.isAssignModalOpen.set(true);
  }

  submitAssign(): void {
    const l = this.lead();
    if (!l || this.assignForm.invalid) return;
    const { assigned_to_name, reason } = this.assignForm.value;
    this.leadService.assignLead(l.lead_id, assigned_to_name, reason);
    this.toast.success(`Owner reassigned to ${assigned_to_name}.`);
    this.isAssignModalOpen.set(false);
  }

  // Disqualify
  openDisqualifyModal(): void {
    const l = this.lead();
    if (!l) return;
    this.disqualifyForm.patchValue({
      unqualified_reason: 'Out of territory or not served',
      unqualified_note: ''
    });
    this.isDisqualifyModalOpen.set(true);
  }

  submitDisqualify(): void {
    const l = this.lead();
    if (!l || this.disqualifyForm.invalid) return;
    const { unqualified_reason, unqualified_note } = this.disqualifyForm.value;
    this.leadService.disqualifyLead(l.lead_id, unqualified_reason, unqualified_note);
    this.toast.info(`Lead moved to Unqualified.`);
    this.isDisqualifyModalOpen.set(false);
  }

  // Reopen
  openReopenModal(): void {
    const l = this.lead();
    if (!l) return;
    this.reopenForm.patchValue({
      reopen_reason: 'Prospect re-engaged with revised volume requirement.'
    });
    this.isReopenModalOpen.set(true);
  }

  submitReopen(): void {
    const l = this.lead();
    if (!l || this.reopenForm.invalid) return;
    const { reopen_reason } = this.reopenForm.value;
    this.leadService.reopenLead(l.lead_id, reopen_reason);
    this.toast.success('Lead reopened and restored to Contacted.');
    this.isReopenModalOpen.set(false);
  }

  // Add Document
  openUploadDocModal(): void {
    this.docForm.reset({
      file_name: '',
      file_type: 'PDF',
      file_size: '1.8 MB'
    });
    this.isUploadDocModalOpen.set(true);
  }

  submitDoc(): void {
    const l = this.lead();
    if (!l || this.docForm.invalid) return;
    const val = this.docForm.value;
    const newDoc = {
      doc_id: Date.now(),
      lead_id: l.lead_id,
      file_name: val.file_name,
      file_type: val.file_type,
      file_size: val.file_size || '2.0 MB',
      uploaded_date: new Date().toISOString().split('T')[0],
      uploaded_by: l.assigned_to_name || 'Berihu Esayas'
    };
    l.documents = [newDoc, ...(l.documents || [])];
    this.toast.success(`Document ${val.file_name} attached.`);
    this.isUploadDocModalOpen.set(false);
  }

  isFollowUpOverdue(dateStr: string, status: LeadStatus): boolean {
    if (status === 'Converted' || status === 'Unqualified') return false;
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  }
}

