import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeadService } from '../../services/lead.service';
import { Lead, LeadStatus } from '../../models/lead.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  templateUrl: './lead-list.component.html'
})
export class LeadListComponent {
  private leadService = inject(LeadService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private confirmDialog = inject(ConfirmDialogService);

  leads = this.leadService.leads;
  totalLeads = this.leadService.totalLeads;
  qualifiedCount = this.leadService.qualifiedCount;
  activeCount = this.leadService.activeCount;
  overdueCount = this.leadService.overdueCount;

  // Search, Filters & Pagination
  searchQuery = signal<string>('');
  selectedStatus = signal<string>('All');
  selectedSource = signal<string>('All');
  selectedOwner = signal<string>('All');
  includeInactive = signal<boolean>(false);
  activeMenuId = signal<number | null>(null);

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Modals & Drawers state
  isDrawerOpen = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedLeadForAction = signal<Lead | null>(null);

  isAssignModalOpen = signal<boolean>(false);
  isFollowUpModalOpen = signal<boolean>(false);
  isQualifyModalOpen = signal<boolean>(false);
  isDisqualifyModalOpen = signal<boolean>(false);
  isConvertModalOpen = signal<boolean>(false);
  isReopenModalOpen = signal<boolean>(false);

  // Reactive Forms
  leadForm: FormGroup;
  assignForm: FormGroup;
  followUpForm: FormGroup;
  qualifyForm: FormGroup;
  disqualifyForm: FormGroup;
  convertForm: FormGroup;
  reopenForm: FormGroup;

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
    this.leadForm = this.fb.group({
      lead_name: ['', Validators.required],
      company_name: ['', Validators.required],
      contact_person: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      interested_in: ['', Validators.required],
      industry: ['Agribusiness & FMCG'],
      city: ['Addis Ababa'],
      country: ['Ethiopia'],
      source_channel: ['Direct inquiry', Validators.required],
      source_detail: [''],
      priority: ['Medium'],
      assigned_to_name: ['Berihu Esayas (Commercial Director)'],
      follow_up_date: [new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], Validators.required],
      estimated_value: [1500000, [Validators.min(0)]],
      currency: ['ETB'],
      note: ['']
    });

    this.assignForm = this.fb.group({
      assigned_to_name: ['', Validators.required],
      reason: ['', Validators.required]
    });

    this.followUpForm = this.fb.group({
      follow_up_date: ['', Validators.required],
      note: ['']
    });

    this.qualifyForm = this.fb.group({
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

    this.disqualifyForm = this.fb.group({
      unqualified_reason: ['Out of territory or not served', Validators.required],
      unqualified_note: ['', Validators.required]
    });

    this.convertForm = this.fb.group({
      deal_name: ['', Validators.required],
      expected_value: [0, Validators.required]
    });

    this.reopenForm = this.fb.group({
      reopen_reason: ['', Validators.required]
    });
  }

  // Filtered Leads
  filteredLeads = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const st = this.selectedStatus();
    const src = this.selectedSource();
    const own = this.selectedOwner();
    const incInactive = this.includeInactive();

    return this.leads().filter(l => {
      // Inactive toggle: if false, exclude 'Unqualified'
      if (!incInactive && l.status === 'Unqualified' && st !== 'Unqualified') {
        return false;
      }

      if (st !== 'All' && l.status !== st) return false;
      if (src !== 'All' && l.source_channel !== src) return false;
      if (own !== 'All' && l.assigned_to_name !== own) return false;

      if (!q) return true;

      return (
        l.lead_code.toLowerCase().includes(q) ||
        l.lead_name.toLowerCase().includes(q) ||
        l.contact_person.toLowerCase().includes(q) ||
        l.company_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.interested_in.toLowerCase().includes(q)
      );
    });
  });

  paginatedLeads = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredLeads().slice(start, start + this.pageSize());
  });

  // Action Menu Helpers
  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuId.update(current => (current === id ? null : id));
  }

  closeActiveMenu(): void {
    this.activeMenuId.set(null);
  }

  onSearch(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onStatusChange(event: Event): void {
    this.selectedStatus.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onSourceChange(event: Event): void {
    this.selectedSource.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  toggleInactive(): void {
    this.includeInactive.update(v => !v);
  }

  onPageChange(newPage: number): void {
    this.currentPage.set(newPage);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  // Navigation
  viewLead(lead: Lead): void {
    this.closeActiveMenu();
    this.router.navigate(['/leads', lead.lead_id]);
  }

  // Create / Edit Drawer
  openCreateDrawer(): void {
    this.isEditMode.set(false);
    this.selectedLeadForAction.set(null);
    this.leadForm.reset({
      lead_name: '',
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      interested_in: '',
      industry: 'Agribusiness & FMCG',
      city: 'Addis Ababa',
      country: 'Ethiopia',
      source_channel: 'Direct inquiry',
      source_detail: '',
      priority: 'Medium',
      assigned_to_name: 'Berihu Esayas (Commercial Director)',
      follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimated_value: 1500000,
      currency: 'ETB',
      note: ''
    });
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(lead: Lead): void {
    this.closeActiveMenu();
    this.isEditMode.set(true);
    this.selectedLeadForAction.set(lead);
    this.leadForm.patchValue({
      lead_name: lead.lead_name,
      company_name: lead.company_name,
      contact_person: lead.contact_person,
      email: lead.email,
      phone: lead.phone,
      interested_in: lead.interested_in,
      industry: lead.industry || 'Agribusiness & FMCG',
      city: lead.city || 'Addis Ababa',
      country: lead.country || 'Ethiopia',
      source_channel: lead.source_channel,
      source_detail: lead.source_detail || '',
      priority: lead.priority,
      assigned_to_name: lead.assigned_to_name || 'Berihu Esayas (Commercial Director)',
      follow_up_date: lead.follow_up_date,
      estimated_value: lead.estimated_value || 0,
      currency: lead.currency || 'ETB',
      note: lead.note || ''
    });
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  submitLeadForm(): void {
    if (this.leadForm.invalid) {
      this.leadForm.markAllAsTouched();
      this.toast.error('Please fill in all required fields.');
      return;
    }

    const val = this.leadForm.value;
    if (this.isEditMode() && this.selectedLeadForAction()) {
      const id = this.selectedLeadForAction()!.lead_id;
      this.leadService.updateLead(id, val);
      this.toast.success('Lead updated successfully.');
    } else {
      this.leadService.createLead(val);
      this.toast.success('New lead registered into Lead Management.');
    }

    this.closeDrawer();
  }

  // Assign Owner Modal
  openAssignModal(lead: Lead): void {
    this.closeActiveMenu();
    this.selectedLeadForAction.set(lead);
    this.assignForm.patchValue({
      assigned_to_name: lead.assigned_to_name || this.teamMembers[0],
      reason: ''
    });
    this.isAssignModalOpen.set(true);
  }

  submitAssign(): void {
    const lead = this.selectedLeadForAction();
    if (!lead || this.assignForm.invalid) return;
    const { assigned_to_name, reason } = this.assignForm.value;
    this.leadService.assignLead(lead.lead_id, assigned_to_name, reason);
    this.toast.success(`Lead assigned to ${assigned_to_name}.`);
    this.isAssignModalOpen.set(false);
  }

  // Schedule Follow-Up Modal
  openFollowUpModal(lead: Lead): void {
    this.closeActiveMenu();
    this.selectedLeadForAction.set(lead);
    this.followUpForm.patchValue({
      follow_up_date: lead.follow_up_date || new Date().toISOString().split('T')[0],
      note: ''
    });
    this.isFollowUpModalOpen.set(true);
  }

  submitFollowUp(): void {
    const lead = this.selectedLeadForAction();
    if (!lead || this.followUpForm.invalid) return;
    const { follow_up_date, note } = this.followUpForm.value;
    this.leadService.setFollowUp(lead.lead_id, follow_up_date, note);
    this.toast.success(`Follow-up scheduled for ${follow_up_date}.`);
    this.isFollowUpModalOpen.set(false);
  }

  // Qualify (BANT) Modal
  openQualifyModal(lead: Lead): void {
    this.closeActiveMenu();
    this.selectedLeadForAction.set(lead);
    const q = lead.qualification;
    this.qualifyForm.patchValue({
      assessed_by: q?.assessed_by || 'Berihu Esayas (Commercial Director)',
      budget_criterion: q?.budget_criterion || 'Confirmed',
      budget_evidence: q?.budget_evidence || 'Commercial capital budget confirmed for FY2026.',
      authority_criterion: q?.authority_criterion || 'Confirmed',
      authority_evidence: q?.authority_evidence || `${lead.contact_person} holds primary procurement sign-off.`,
      need_criterion: q?.need_criterion || 'Confirmed',
      need_evidence: q?.need_evidence || `Urgent commercial requirement for ${lead.interested_in}.`,
      timeline_criterion: q?.timeline_criterion || 'Confirmed',
      timeline_evidence: q?.timeline_evidence || 'Expected purchasing commencement within 30-60 days.',
      qualification_outcome: q?.qualification_outcome || 'Qualified',
      evidence_summary: q?.evidence_summary || 'Enterprise requirement verified with high conversion probability.'
    });
    this.isQualifyModalOpen.set(true);
  }

  submitQualify(): void {
    const lead = this.selectedLeadForAction();
    if (!lead || this.qualifyForm.invalid) return;
    const val = this.qualifyForm.value;
    this.leadService.qualifyLead(lead.lead_id, {
      ...val,
      assessment_status: 'Final',
      assessed_date: new Date().toISOString().split('T')[0]
    });
    this.toast.success(`Lead status updated to ${val.qualification_outcome} via BANT evaluation.`);
    this.isQualifyModalOpen.set(false);
  }

  // Disqualify Modal
  openDisqualifyModal(lead: Lead): void {
    this.closeActiveMenu();
    this.selectedLeadForAction.set(lead);
    this.disqualifyForm.patchValue({
      unqualified_reason: 'Out of territory or not served',
      unqualified_note: ''
    });
    this.isDisqualifyModalOpen.set(true);
  }

  submitDisqualify(): void {
    const lead = this.selectedLeadForAction();
    if (!lead || this.disqualifyForm.invalid) return;
    const { unqualified_reason, unqualified_note } = this.disqualifyForm.value;
    this.leadService.disqualifyLead(lead.lead_id, unqualified_reason, unqualified_note);
    this.toast.info(`Lead moved to Unqualified (${unqualified_reason}).`);
    this.isDisqualifyModalOpen.set(false);
  }

  // Convert Modal
  openConvertModal(lead: Lead): void {
    this.closeActiveMenu();
    this.selectedLeadForAction.set(lead);
    this.convertForm.patchValue({
      deal_name: `${lead.company_name} - ${lead.interested_in}`,
      expected_value: lead.estimated_value || 2500000
    });
    this.isConvertModalOpen.set(true);
  }

  submitConvert(): void {
    const lead = this.selectedLeadForAction();
    if (!lead || this.convertForm.invalid) return;
    const { deal_name, expected_value } = this.convertForm.value;
    const res = this.leadService.convertLead(lead.lead_id, deal_name, expected_value);
    this.toast.success(`Lead converted successfully! Customer (${res.customerCode}) and Opportunity (${res.opportunityCode}) created.`);
    this.isConvertModalOpen.set(false);
  }

  // Reopen Modal
  openReopenModal(lead: Lead): void {
    this.closeActiveMenu();
    this.selectedLeadForAction.set(lead);
    this.reopenForm.patchValue({
      reopen_reason: 'Prospect re-engaged with expanded order volume.'
    });
    this.isReopenModalOpen.set(true);
  }

  submitReopen(): void {
    const lead = this.selectedLeadForAction();
    if (!lead || this.reopenForm.invalid) return;
    const { reopen_reason } = this.reopenForm.value;
    this.leadService.reopenLead(lead.lead_id, reopen_reason);
    this.toast.success('Lead reopened and restored to Contacted status.');
    this.isReopenModalOpen.set(false);
  }

  isFollowUpOverdue(dateStr: string, status: LeadStatus): boolean {
    if (status === 'Converted' || status === 'Unqualified') return false;
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
  }

  isFollowUpToday(dateStr: string, status: LeadStatus): boolean {
    if (status === 'Converted' || status === 'Unqualified') return false;
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  }

  async deleteLead(lead: Lead): Promise<void> {
    this.activeMenuId.set(null);
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Lead Record',
      message: 'Do you want to delete this lead record?',
      recordName: `${lead.lead_code} • ${lead.lead_name} (${lead.company_name})`,
      confirmText: 'Delete Lead',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      this.leadService.deleteLead(lead.lead_id);
      this.toast.info(`Deleted lead ${lead.lead_code}.`);
    }
  }
}
