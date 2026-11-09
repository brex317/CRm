import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketingService } from '../../services/marketing.service';
import { ActivityReport, ReportType } from '../../models/activity-report.model';
import { ToastService } from '../../../../core/services/toast.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-activity-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  template: `
    <div class="space-y-6" (click)="closeActiveMenu()">
      
      <!-- =====================================================================
           FULLSCREEN REPORT DETAIL VIEW (Replaces cramped drawer)
           ===================================================================== -->
      @if (selectedDetailReport(); as rep) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Action Bar & Back Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-3">
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i class="mi text-base">arrow_back</i> Back to Activity Reports
              </button>
              <div class="h-6 w-px bg-[var(--ln)]"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-wider text-[var(--mu)] uppercase">CRM / ACTIVITY REPORTS</span>
                  <span class="text-xs font-mono font-bold text-[var(--pr)]">{{ rep.report_code || ('REP-2026-' + (rep.report_id < 10 ? '00' : (rep.report_id < 100 ? '0' : '')) + rep.report_id) }}</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-[var(--hd)] tracking-tight mt-0.5">{{ rep.activity_title }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              @if (rep.status === 'Draft') {
                <button (click)="submitReport(rep)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <i class="mi text-base">send</i> Submit for Review
                </button>
              }
              @if (rep.status === 'Submitted') {
                <button (click)="reviewReport(rep)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <i class="mi text-base">verified</i> Review &amp; Approve
                </button>
              }
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Close Detail View">
                <i class="mi text-base">close</i> Close
              </button>
            </div>
          </div>

          <!-- Badges & Status Banner -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="cat-pill text-xs font-bold px-3 py-1">{{ rep.report_type }}</span>
            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--hd)] border border-[var(--ln)]">
              {{ rep.report_code || ('REP-2026-' + (rep.report_id < 10 ? '00' : (rep.report_id < 100 ? '0' : '')) + rep.report_id) }}
            </span>
            <span class="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ISO Ref: {{ rep.form_reference || 'RRT/CD/FR/041' }}
            </span>
            @if (rep.status === 'Reviewed') {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> REVIEWED &amp; APPROVED
              </span>
            } @else {
              <span class="status-pill pending text-xs px-3 py-1">
                <i class="mi text-sm">schedule</i> {{ rep.status }}
              </span>
            }
          </div>

          <!-- 4 Fullscreen Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">{{ rep.attendance_or_reach ? (rep.attendance_or_reach | number) : '0' }}</div>
                <div class="kpi-card-lbl">Audience Reach / Attendees</div>
              </div>
              <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
                <i class="mi text-2xl">groups</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{{ rep.report_type }}</div>
                <div class="kpi-card-lbl">Report Classification</div>
              </div>
              <div class="kpi-icon-badge bg-purple-50 dark:bg-[#2a1a4a] text-purple-600 dark:text-purple-400">
                <i class="mi text-2xl">analytics</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black" [class.text-[var(--ok)]]="rep.status === 'Reviewed'">
                  {{ rep.status }}
                </div>
                <div class="kpi-card-lbl">Evaluation Status</div>
              </div>
              <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
                <i class="mi text-2xl">verified</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black font-mono">{{ rep.prepared_date }}</div>
                <div class="kpi-card-lbl">Filing Date</div>
              </div>
              <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
                <i class="mi text-2xl">calendar_today</i>
              </div>
            </div>
          </div>

          <!-- Main 2-Column Fullscreen Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Summary, Lessons & CAPA -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Executive Summary Card -->
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">subject</i> Executive Evaluation Summary
                </h3>
                <p class="text-sm text-[var(--hd)] leading-relaxed bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] font-medium">
                  {{ rep.summary }}
                </p>
              </div>

              <!-- Lessons Learned & Corrective Actions (CAPA) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="erp-card-container p-6">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-3 flex items-center gap-2">
                    <i class="mi text-base text-amber-500">lightbulb</i> Lessons Learned
                  </h3>
                  <p class="text-xs text-[var(--tx)] bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] leading-relaxed font-medium">
                    {{ rep.lessons_learned || 'Standard commercial execution protocol maintained with positive feedback.' }}
                  </p>
                </div>

                <div class="erp-card-container p-6">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-3 flex items-center gap-2">
                    <i class="mi text-base text-[var(--pr)]">build_circle</i> Corrective Actions (CAPA)
                  </h3>
                  <p class="text-xs text-[var(--tx)] bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] leading-relaxed font-medium">
                    {{ rep.improvement_actions || 'No corrective actions required. Operational benchmarks fulfilled.' }}
                  </p>
                </div>
              </div>

            </div>

            <!-- Right 1 Col: Audit & Governance Trail -->
            <div class="space-y-6">
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">shield</i> Governance &amp; Approvals
                </h3>
                <div class="space-y-3.5">
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Prepared By</span>
                    <b class="text-xs text-[var(--hd)]">{{ rep.prepared_by }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Filing Date</span>
                    <b class="text-xs font-mono text-[var(--hd)]">{{ rep.prepared_date }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Reviewed By</span>
                    <b class="text-xs" [class.text-[var(--ok)]]="rep.reviewed_by" [class.text-[var(--mu)]]="!rep.reviewed_by">
                      {{ rep.reviewed_by || 'Pending Review' }}
                    </b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Sign-off Status</span>
                    <span class="status-pill text-xs" [ngClass]="rep.status === 'Reviewed' ? 'active' : 'pending'">
                      {{ rep.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Panel -->
              <div class="erp-card-container p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-slate-900/40">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--hd)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">assignment_turned_in</i> Evaluation Operations
                </h3>
                <p class="text-xs text-[var(--tx)] mb-4 leading-relaxed">
                  Sign-off on CAPA recommendations and mark this activity report as finalized.
                </p>
                <div class="flex flex-col gap-2">
                  @if (rep.status !== 'Reviewed') {
                    <button (click)="reviewReport(rep)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                      <i class="mi text-base">check_circle</i> Complete &amp; Sign-off Report
                    </button>
                  }
                  <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-medium flex items-center justify-center gap-1.5">
                    <i class="mi text-base">arrow_back</i> Back to Reports List
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      } @else {

      <!-- Page Title & Header matching Image 1 & 2 -->
      <div>
        <span class="text-xs font-bold tracking-wider text-[var(--mu)] uppercase block mb-1">CRM</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--hd)] tracking-tight">Marketing Management</h1>
        <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Activity Reports</h2>
        <p class="text-xs text-[var(--tx)] mt-1">
          Evaluation reports, participant reach, and corrective action plans (CAPA).
        </p>
      </div>

      <!-- 3 KPI Metric Cards matching Image 1 & 2 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Reports Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ totalCount() }}</div>
            <div class="kpi-card-lbl">Total activity reports</div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- Reviewed Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ reviewedCount() }}</div>
            <div class="kpi-card-lbl">Reviewed &amp; Approved</div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">check_circle</i>
          </div>
        </div>

        <!-- Pending Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ pendingCount() }}</div>
            <div class="kpi-card-lbl">Draft &amp; In Review</div>
          </div>
          <div class="kpi-icon-badge bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400">
            <i class="mi text-2xl">block</i>
          </div>
        </div>

      </div>

      <!-- Main Enclosing ERP Card Container matching Image 1 & 2 & 3a2c9fd4 -->
      <div class="erp-card-container">
        
        <!-- Toolbar: Search, Filter Select, Toggle Switch, Primary Button, Refresh Button -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-5">
          
          <div class="flex flex-wrap items-center gap-3 flex-1">
            <div class="erp-search-field flex-1 min-w-[240px]">
              <label>Search</label>
              <input 
                #repSearchInput
                [value]="searchQuery()" 
                (input)="onSearch($event)" 
                (keydown.escape)="clearSearch()"
                placeholder="Name, type, effective period..." />
              @if (searchQuery()) {
                <button type="button" (click)="clearSearch()" class="erp-search-clear mr-1" title="Clear search">
                  <i class="mi text-sm">close</i>
                </button>
              }
              <button type="button" (click)="repSearchInput.focus()" class="erp-search-btn pr-3" title="Search">
                <i class="mi text-lg">search</i>
              </button>
            </div>

            <div class="ff min-w-[150px]">
              <label>Report Type</label>
              <select [value]="selectedType()" (change)="onTypeChange($event)">
                <option value="All">All</option>
                <option value="Workshop">Workshop</option>
                <option value="Event">Event</option>
                <option value="Digital Monthly">Digital Monthly</option>
              </select>
            </div>

            <label class="toggle-switch">
              <div class="toggle-track" [class.active]="includeDrafts()" (click)="toggleIncludeDrafts()">
                <div class="toggle-thumb"></div>
              </div>
              <span>Include draft</span>
            </label>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            <!-- Opens Right Side Drawer matching Image 1 -->
            <button (click)="openDrawer()" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
              <i class="mi text-base">add</i> New report
            </button>

            <button (click)="refresh()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Refresh">
              <i class="mi text-base text-[var(--mu)]">refresh</i> Refresh
            </button>
          </div>

        </div>

        <!-- NESTED Table View matching Screenshot 3a2c9fd4 -->
        @if (paginatedReports().length > 0) {
          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>REPORT REF</th>
                  <th>ACTIVITY</th>
                  <th>TYPE</th>
                  <th>PREPARED BY</th>
                  <th>DATE</th>
                  <th>ATTENDEES</th>
                  <th>STATUS</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (rep of paginatedReports(); track rep.report_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs whitespace-nowrap">{{ rep.report_code || ('RPT-2026-' + (rep.report_id < 10 ? '00' : (rep.report_id < 100 ? '0' : '')) + rep.report_id) }}</b>
                    </td>
                    <td>
                      <span class="text-[var(--hd)] hover:text-[var(--pr)] cursor-pointer text-sm font-semibold whitespace-nowrap" (click)="openDetailDrawer(rep)">
                        {{ rep.activity_title }}
                      </span>
                    </td>
                    <td>
                      <span class="cat-pill">{{ rep.report_type }}</span>
                    </td>
                    <td class="text-xs text-[var(--hd)] font-medium whitespace-nowrap">
                      {{ rep.prepared_by }}
                    </td>
                    <td class="text-xs text-[var(--tx)] whitespace-nowrap">{{ rep.prepared_date }}</td>
                    <td class="font-bold text-xs text-[var(--hd)]">
                      {{ rep.attendance_or_reach ? (rep.attendance_or_reach | number) : '—' }}
                    </td>
                    <td>
                      @if (rep.status === 'Reviewed') {
                        <span class="status-pill active">
                          <i class="mi text-sm">check_circle</i> REVIEWED
                        </span>
                      } @else if (rep.status === 'Submitted') {
                        <span class="status-pill pending">
                          <i class="mi text-sm">schedule</i> SUBMITTED
                        </span>
                      } @else {
                        <span class="status-pill inactive">
                          <i class="mi text-sm">block</i> DRAFT
                        </span>
                      }
                    </td>

                    <!-- 3-Dots Action Cell -->
                    <td class="text-right relative whitespace-nowrap" (click)="$event.stopPropagation()">
                      <button 
                        (click)="toggleMenu(rep.report_id, $event)" 
                        class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
                        title="Row Actions"
                        aria-label="Actions">
                        <i class="mi text-xl text-[var(--mu)] hover:text-[var(--hd)]">more_vert</i>
                      </button>

                      @if (activeMenuId() === rep.report_id) {
                        <div class="action-popover">
                          <button (click)="openDetailDrawer(rep)" class="action-item">
                            <i class="mi">visibility</i>
                            <span>View Details</span>
                          </button>

                          @if (rep.status === 'Draft') {
                            <button (click)="submitReport(rep)" class="action-item">
                              <i class="mi text-blue-600">send</i>
                              <span>Submit Report</span>
                            </button>
                          }

                          @if (rep.status === 'Submitted') {
                            <button (click)="reviewReport(rep)" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">verified</i>
                              <span>Mark Reviewed</span>
                            </button>
                          }

                          <div class="action-divider"></div>

                          <button (click)="deleteReport(rep)" class="action-item danger">
                            <i class="mi">delete</i>
                            <span>Delete Report</span>
                          </button>
                        </div>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <!-- Empty State matching Image 2 -->
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <i class="mi text-3xl">assignment_late</i>
            </div>
            <b class="text-base font-bold text-[var(--hd)] mb-1">No Data Found</b>
            <p class="text-xs text-[var(--mu)]">No reports match your filters.</p>
          </div>
        }

        <!-- Pagination Controls matching Image 2 & 31662825 with Popover -->
        <app-table-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="filteredReports().length"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        />

      </div>
      }

      <!-- =====================================================================
           RIGHT SIDE DRAWER (CREATE / EDIT) Matching Image 1
           ===================================================================== -->
      @if (showCreateDrawer()) {
        <div class="drawer-backdrop" (click)="closeDrawer()">
          <div class="drawer-panel" (click)="$event.stopPropagation()">
            
            <div class="p-6 border-b border-[var(--ln)] flex items-start justify-between">
              <div>
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Add activity report</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Activity Report</h2>
                <p class="text-xs text-[var(--tx)] mt-1 max-w-md">
                  Enter post-activity evaluation, attendance reach, and CAPA improvement actions.
                </p>
              </div>
              <button (click)="closeDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="reportForm" (ngSubmit)="onCreateSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div class="drawer-field has-floating-label">
                <label>Activity Title *</label>
                <input formControlName="activity_title" placeholder="e.g. Agro-Industrial Initiative 002 - Bulk Milling" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Report Type *</label>
                  <select formControlName="report_type">
                    <option value="Workshop">Workshop</option>
                    <option value="Event">Event</option>
                    <option value="Digital Monthly">Digital Monthly</option>
                  </select>
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Prepared date*</label>
                  <input type="date" formControlName="prepared_date" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Prepared By *</label>
                  <input formControlName="prepared_by" placeholder="e.g. Lead Facilitator" />
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Attendance / Reach</label>
                  <input type="number" formControlName="attendance_or_reach" placeholder="e.g. 120" />
                </div>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Executive Evaluation Summary *</label>
                <textarea formControlName="summary" placeholder="Executive summary of outcomes..."></textarea>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Lessons Learned</label>
                <textarea formControlName="lessons_learned" placeholder="Key insights and takeaways..."></textarea>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Improvement Actions (CAPA)</label>
                <textarea formControlName="improvement_actions" placeholder="Corrective actions for next iteration..."></textarea>
              </div>

            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <span class="text-xs text-[var(--mu)]">Save changes</span>
              <div class="flex items-center gap-2.5">
                <button (click)="closeDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
                <button (click)="onCreateSubmit()" [disabled]="reportForm.invalid" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
              </div>
            </div>

          </div>
        </div>
      }



    </div>
  `
})
export class ActivityReportsComponent {
  private marketingService = inject(MarketingService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  reports = this.marketingService.reports;

  searchQuery = signal<string>('');
  selectedType = signal<string>('All');
  includeDrafts = signal<boolean>(true);

  // Pagination state matching Image 2
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Popover 3-dots active menu ID
  activeMenuId = signal<number | null>(null);

  // Side Drawer signals matching Image 1
  showCreateDrawer = signal<boolean>(false);
  selectedDetailReport = signal<ActivityReport | null>(null);

  // Computed KPI Metrics matching Image 1 & 2
  totalCount = computed(() => this.reports().length);
  reviewedCount = computed(() => this.reports().filter(r => r.status === 'Reviewed').length);
  pendingCount = computed(() => this.reports().filter(r => r.status !== 'Reviewed').length);

  reportForm: FormGroup = this.fb.group({
    activity_title: ['', Validators.required],
    report_type: ['Workshop', Validators.required],
    prepared_date: [new Date().toISOString().slice(0, 10), Validators.required],
    prepared_by: ['Berihu Esayas', Validators.required],
    attendance_or_reach: [0],
    summary: ['', Validators.required],
    lessons_learned: [''],
    improvement_actions: ['']
  });

  filteredReports = computed(() => {
    let list = this.reports();
    if (!this.includeDrafts()) {
      list = list.filter(r => r.status !== 'Draft');
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(r =>
        r.activity_title?.toLowerCase().includes(q) ||
        (r.report_code && r.report_code.toLowerCase().includes(q)) ||
        r.summary.toLowerCase().includes(q) ||
        (r.prepared_by && r.prepared_by.toLowerCase().includes(q)) ||
        (r.reviewed_by && r.reviewed_by.toLowerCase().includes(q)) ||
        (r.lessons_learned && r.lessons_learned.toLowerCase().includes(q)) ||
        (r.improvement_actions && r.improvement_actions.toLowerCase().includes(q)) ||
        r.status.toLowerCase().includes(q) ||
        r.report_type.toLowerCase().includes(q)
      );
    }
    if (this.selectedType() !== 'All') {
      list = list.filter(r => r.report_type === this.selectedType());
    }
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredReports().length / this.pageSize())));

  paginatedReports = computed(() => {
    const list = this.filteredReports();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginationText = computed(() => {
    const total = this.filteredReports().length;
    if (total === 0) return '0 of 0';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return `${start} - ${end} of ${total}`;
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onTypeChange(event: Event): void {
    this.selectedType.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleIncludeDrafts(): void {
    this.includeDrafts.update(v => !v);
    this.currentPage.set(1);
  }

  refresh(): void {
    this.toast.info('Reports refreshed.');
  }

  copyToClipboard(text: string, label: string): void {
    this.closeActiveMenu();
    if (!text) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        this.toast.success(`Copied ${label} "${text}" to clipboard`);
      }).catch(() => {
        this.toast.info(`Copied ${label} "${text}"`);
      });
    } else {
      this.toast.info(`Copied ${label} "${text}"`);
    }
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenuId() === id) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(id);
    }
  }

  closeActiveMenu(): void {
    this.activeMenuId.set(null);
  }

  openDrawer(): void {
    this.closeActiveMenu();
    this.reportForm.reset({
      activity_title: '',
      report_type: 'Workshop',
      prepared_date: new Date().toISOString().slice(0, 10),
      prepared_by: 'Berihu Esayas',
      attendance_or_reach: 0,
      summary: '',
      lessons_learned: '',
      improvement_actions: ''
    });
    this.showCreateDrawer.set(true);
  }

  closeDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  openDetailDrawer(rep: ActivityReport): void {
    this.closeActiveMenu();
    this.selectedDetailReport.set(rep);
  }

  closeDetailDrawer(): void {
    this.selectedDetailReport.set(null);
  }

  onCreateSubmit(): void {
    if (this.reportForm.invalid) return;
    const formVal = this.reportForm.value;
    this.marketingService.createReport({
      activity_id: 1,
      activity_title: formVal.activity_title,
      report_type: formVal.report_type as ReportType,
      prepared_date: formVal.prepared_date,
      prepared_by: formVal.prepared_by,
      attendance_or_reach: formVal.attendance_or_reach,
      summary: formVal.summary,
      lessons_learned: formVal.lessons_learned,
      improvement_actions: formVal.improvement_actions,
      form_reference: formVal.report_type === 'Workshop' ? 'RRT/CD/FR/041' : 'RRT/CD/FR/043',
      status: 'Draft'
    });
    this.toast.success(`Report saved.`);
    this.closeDrawer();
  }

  submitReport(rep: ActivityReport): void {
    this.closeActiveMenu();
    this.marketingService.submitReport(rep.report_id);
    this.toast.info(`Report submitted.`);
  }

  reviewReport(rep: ActivityReport): void {
    this.closeActiveMenu();
    this.marketingService.reviewReport(rep.report_id, 'Berihu Esayas');
    this.toast.success(`Report reviewed.`);
  }

  deleteReport(rep: ActivityReport): void {
    this.closeActiveMenu();
    if (confirm(`Delete report for "${rep.activity_title}"?`)) {
      this.marketingService.deleteReport(rep.report_id);
      this.toast.info(`Deleted report.`);
    }
  }
}
