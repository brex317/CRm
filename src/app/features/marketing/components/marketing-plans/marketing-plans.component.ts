import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketingService } from '../../services/marketing.service';
import { MarketingPlan, PeriodType } from '../../models/marketing-plan.model';
import { ToastService } from '../../../../core/services/toast.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-marketing-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  template: `
    <div class="space-y-6" (click)="closeActiveMenu()">
      
      <!-- =====================================================================
           FULLSCREEN PLAN DETAIL VIEW (Replaces cramped drawer)
           ===================================================================== -->
      @if (selectedDetailPlan(); as plan) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Action Bar & Back Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-3">
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i class="mi text-base">arrow_back</i> Back to Plans
              </button>
              <div class="h-6 w-px bg-[var(--ln)]"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-wider text-[var(--mu)] uppercase">CRM / MARKETING PLANS</span>
                  <span class="text-xs font-mono font-bold text-[var(--pr)]">{{ plan.plan_code }}</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-[var(--hd)] tracking-tight mt-0.5">{{ plan.plan_name }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              @if (plan.status === 'Draft') {
                <button (click)="submitForApproval(plan)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <i class="mi text-base">send</i> Submit for Approval
                </button>
              }
              @if (plan.status === 'Pending Approval') {
                <button (click)="approvePlan(plan)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <i class="mi text-base">check_circle</i> Approve Budget
                </button>
              }
              @if (plan.status === 'Approved') {
                <button (click)="closePlan(plan)" class="btn bo text-xs py-2 px-3.5 rounded-xl font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5">
                  <i class="mi text-base">lock</i> Close Plan
                </button>
              }
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Close Detail View">
                <i class="mi text-base">close</i> Close
              </button>
            </div>
          </div>

          <!-- Badges & Status Banner -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="cat-pill text-xs font-bold px-3 py-1">{{ plan.period_type }} PLAN</span>
            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--hd)] border border-[var(--ln)]">
              {{ plan.plan_code }}
            </span>
            @if (plan.status === 'Approved') {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> ACTIVE &amp; APPROVED
              </span>
            } @else if (plan.status === 'Draft' || plan.status === 'Pending Approval') {
              <span class="status-pill pending text-xs px-3 py-1">
                <i class="mi text-sm">schedule</i> {{ plan.status }}
              </span>
            } @else {
              <span class="status-pill inactive text-xs px-3 py-1">
                <i class="mi text-sm">block</i> {{ plan.status }}
              </span>
            }
          </div>

          <!-- 4 Fullscreen Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">ETB {{ plan.total_planned_budget | number }}</div>
                <div class="kpi-card-lbl">Total Planned Budget</div>
              </div>
              <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
                <i class="mi text-2xl">account_balance_wallet</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-[var(--ok)]">
                  {{ plan.approved_budget ? ('ETB ' + (plan.approved_budget | number)) : 'Pending' }}
                </div>
                <div class="kpi-card-lbl">Approved Budget Ceiling</div>
              </div>
              <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
                <i class="mi text-2xl">verified</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">
                  {{ relatedActivities().length }}
                </div>
                <div class="kpi-card-lbl">Linked Activities</div>
              </div>
              <div class="kpi-icon-badge bg-purple-50 dark:bg-[#2a1a4a] text-purple-600 dark:text-purple-400">
                <i class="mi text-2xl">campaign</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black font-mono">
                  {{ plan.currency }}
                </div>
                <div class="kpi-card-lbl">Operating Currency</div>
              </div>
              <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
                <i class="mi text-2xl">monetization_on</i>
              </div>
            </div>
          </div>

          <!-- Main 2-Column Fullscreen Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Strategic Objectives & Associated Initiatives -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Objectives Card -->
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">track_changes</i> Strategic Objectives &amp; Scope
                </h3>
                <p class="text-sm text-[var(--hd)] leading-relaxed bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] font-medium">
                  {{ plan.objectives || 'No specific objectives stated for this plan.' }}
                </p>
                @if (plan.notes) {
                  <div class="mt-3 text-xs text-[var(--tx)] flex items-start gap-2">
                    <i class="mi text-base text-[var(--mu)]">info</i>
                    <span>{{ plan.notes }}</span>
                  </div>
                }
              </div>

              <!-- Associated Activities Table -->
              <div class="erp-card-container">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider">Associated Marketing Initiatives</h3>
                    <span class="text-xs text-[var(--mu)]">Campaigns, workshops, and exhibitions tied to this budget container</span>
                  </div>
                  <span class="cat-pill font-bold">{{ relatedActivities().length }} Initiatives</span>
                </div>

                @if (relatedActivities().length > 0) {
                  <div class="erp-table-nested">
                    <table class="crm-tbl">
                      <thead>
                        <tr>
                          <th>CODE</th>
                          <th>INITIATIVE TITLE</th>
                          <th>TYPE</th>
                          <th>BUDGET</th>
                          <th>LEADS</th>
                          <th>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (act of relatedActivities(); track act.activity_id) {
                          <tr class="hover:bg-[var(--chip-bg)]">
                            <td class="font-mono text-xs font-bold text-[var(--pr)]">{{ act.activity_code }}</td>
                            <td class="text-xs text-[var(--hd)] font-semibold truncate max-w-xs" [title]="act.title">
                              {{ act.title }}
                            </td>
                            <td><span class="cat-pill">{{ act.activity_type }}</span></td>
                            <td class="font-bold text-xs whitespace-nowrap">ETB {{ act.planned_budget | number }}</td>
                            <td class="text-xs font-bold">{{ act.leads_generated || 0 }}</td>
                            <td>
                              <span class="status-pill" [class.active]="act.status === 'In Progress' || act.status === 'Approved'" [class.pending]="act.status === 'Draft'">
                                {{ act.status }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="p-8 text-center text-xs text-[var(--mu)]">
                    No specific activities linked to this plan yet.
                  </div>
                }
              </div>

            </div>

            <!-- Right 1 Col: Execution Schedule & Governance Card -->
            <div class="space-y-6">
              
              <div class="erp-card-container p-6 space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">event</i> Schedule &amp; Timeline
                </h3>

                <div class="space-y-3">
                  <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] uppercase font-bold text-[var(--mu)] block mb-0.5">Period Type</span>
                    <b class="text-sm text-[var(--hd)]">{{ plan.period_type }} Plan</b>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                      <span class="text-[10px] uppercase font-bold text-[var(--mu)] block mb-0.5">Start Date</span>
                      <b class="text-xs text-[var(--hd)]">{{ plan.start_date }}</b>
                    </div>
                    <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                      <span class="text-[10px] uppercase font-bold text-[var(--mu)] block mb-0.5">End Date</span>
                      <b class="text-xs text-[var(--hd)]">{{ plan.end_date }}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div class="erp-card-container p-6 space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">shield</i> Governance &amp; Ownership
                </h3>

                <div class="space-y-3 text-xs">
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-[var(--mu)] font-medium">Plan Owner</span>
                    <b class="text-[var(--hd)] font-semibold">{{ plan.owner_name }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-[var(--mu)] font-medium">Approved By</span>
                    <b class="text-[var(--hd)] font-semibold">{{ plan.approved_by || 'Pending Approval' }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-[var(--mu)] font-medium">Approval Date</span>
                    <b class="text-[var(--hd)] font-semibold">{{ plan.approved_date || '—' }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-[var(--mu)] font-medium">Compliance Directive</span>
                    <b class="font-mono text-[var(--hd)]">RRT/CD/WI/01</b>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      } @else {

        <!-- =====================================================================
             MAIN PLANS TABLE & KPI CARDS (Displayed when no plan is selected)
             ===================================================================== -->
        <!-- Page Title & Header matching Image 1 & 2 -->
      <div>
        <span class="text-xs font-bold tracking-wider text-[var(--mu)] uppercase block mb-1">CRM</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--hd)] tracking-tight">Marketing Management</h1>
        <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Marketing Plans</h2>
        <p class="text-xs text-[var(--tx)] mt-1">
          Daily rates and budget ceiling allocations by period, objective, and approval status.
        </p>
      </div>

      <!-- 3 KPI Metric Cards matching Image 1 & 2 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Plans Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ totalCount() }}</div>
            <div class="kpi-card-lbl">Total marketing plans</div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- Active / Approved Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ approvedCount() }}</div>
            <div class="kpi-card-lbl">Active &amp; Approved</div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">check_circle</i>
          </div>
        </div>

        <!-- Pending / Inactive Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ pendingCount() }}</div>
            <div class="kpi-card-lbl">Pending &amp; Draft</div>
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
            <!-- Search Box with Floating Label matching ERP Screenshot 586af6cc & b387844a -->
            <div class="erp-search-field flex-1 min-w-[240px]">
              <label>Search</label>
              <input 
                #planSearchInput
                [value]="searchQuery()" 
                (input)="onSearch($event)" 
                (keydown.escape)="clearSearch()"
                placeholder="Name, type, effective period..." />
              @if (searchQuery()) {
                <button type="button" (click)="clearSearch()" class="erp-search-clear mr-1" title="Clear search">
                  <i class="mi text-sm">close</i>
                </button>
              }
              <button type="button" (click)="planSearchInput.focus()" class="erp-search-btn pr-3" title="Search">
                <i class="mi text-lg">search</i>
              </button>
            </div>

            <!-- Filter Dropdown with Floating Label -->
            <div class="ff min-w-[150px]">
              <label>Period</label>
              <select [value]="selectedPeriod()" (change)="onPeriodChange($event)">
                <option value="All">All</option>
                <option value="Year">Year</option>
                <option value="Quarter">Quarter</option>
                <option value="Month">Month</option>
              </select>
            </div>

            <!-- Include Closed Toggle Switch -->
            <label class="toggle-switch">
              <div class="toggle-track" [class.active]="includeClosed()" (click)="toggleIncludeClosed()">
                <div class="toggle-thumb"></div>
              </div>
              <span>Include closed</span>
            </label>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            <!-- Primary + New Button (Opens Right Drawer!) -->
            <button (click)="openDrawer()" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
              <i class="mi text-base">add</i> New marketing plan
            </button>

            <!-- Secondary Refresh Button -->
            <button (click)="refresh()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Refresh">
              <i class="mi text-base text-[var(--mu)]">refresh</i> Refresh
            </button>
          </div>

        </div>

        <!-- NESTED Table View matching Screenshot 3a2c9fd4 -->
        @if (paginatedPlans().length > 0) {
          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>PLAN CODE</th>
                  <th>PLAN NAME</th>
                  <th>PERIOD</th>
                  <th>DATES</th>
                  <th>PLANNED BUDGET</th>
                  <th>APPROVED CEILING</th>
                  <th>STATUS</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (plan of paginatedPlans(); track plan.plan_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)]">{{ plan.plan_code }}</b>
                    </td>
                    <td>
                      <span class="text-[var(--hd)] hover:text-[var(--pr)] cursor-pointer text-sm font-semibold whitespace-nowrap" (click)="openDetailDrawer(plan)">
                        {{ plan.plan_name }}
                      </span>
                    </td>
                    <td>
                      <span class="cat-pill">{{ plan.period_type }}</span>
                    </td>
                    <td class="text-xs text-[var(--tx)] whitespace-nowrap">
                      {{ plan.start_date }} &rarr; {{ plan.end_date }}
                    </td>
                    <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                      ETB {{ plan.total_planned_budget | number }}
                    </td>
                    <td class="text-xs whitespace-nowrap">
                      @if (plan.approved_budget) {
                        <b class="text-[var(--ok)]">ETB {{ plan.approved_budget | number }}</b>
                      } @else {
                        <span class="text-[var(--mu)] italic">Pending</span>
                      }
                    </td>
                    <td>
                      @if (plan.status === 'Approved') {
                        <span class="status-pill active">
                          <i class="mi text-sm">check_circle</i> ACTIVE
                        </span>
                      } @else if (plan.status === 'Draft' || plan.status === 'Pending Approval') {
                        <span class="status-pill pending">
                          <i class="mi text-sm">schedule</i> {{ plan.status }}
                        </span>
                      } @else {
                        <span class="status-pill inactive">
                          <i class="mi text-sm">block</i> {{ plan.status }}
                        </span>
                      }
                    </td>

                    <!-- 3-Dots Action Cell -->
                    <td class="text-right relative whitespace-nowrap" (click)="$event.stopPropagation()">
                      <button 
                        (click)="toggleMenu(plan.plan_id, $event)" 
                        class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
                        title="Row Actions"
                        aria-label="Actions">
                        <i class="mi text-xl text-[var(--mu)] hover:text-[var(--hd)]">more_vert</i>
                      </button>

                      @if (activeMenuId() === plan.plan_id) {
                        <div class="action-popover">
                          <button (click)="openDetailDrawer(plan)" class="action-item">
                            <i class="mi">visibility</i>
                            <span>View Details</span>
                          </button>

                          @if (plan.status === 'Draft') {
                            <button (click)="submitForApproval(plan)" class="action-item">
                              <i class="mi text-blue-600">send</i>
                              <span>Submit for Approval</span>
                            </button>
                          }

                          @if (plan.status === 'Pending Approval') {
                            <button (click)="approvePlan(plan)" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">check_circle</i>
                              <span>Approve Plan Budget</span>
                            </button>
                          }

                          @if (plan.status === 'Approved') {
                            <button (click)="closePlan(plan)" class="action-item">
                              <i class="mi text-slate-500">lock</i>
                              <span>Close Plan</span>
                            </button>
                          }

                          <div class="action-divider"></div>

                          <button (click)="deletePlan(plan)" class="action-item danger">
                            <i class="mi">delete</i>
                            <span>Delete Plan</span>
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
              <i class="mi text-3xl">folder_off</i>
            </div>
            <b class="text-base font-bold text-[var(--hd)] mb-1">No Data Found</b>
            <p class="text-xs text-[var(--mu)]">No marketing plans match your filters.</p>
          </div>
        }

        <!-- Pagination Controls matching Image 2 & 31662825 with Popover -->
        <app-table-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="filteredPlans().length"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        />

      </div>

      <!-- =====================================================================
           RIGHT SIDE DRAWER (CREATE / EDIT) Matching Image 1
           ===================================================================== -->
      @if (showCreateDrawer()) {
        <div class="drawer-backdrop" (click)="closeDrawer()">
          <div class="drawer-panel" (click)="$event.stopPropagation()">
            
            <!-- Drawer Header matching Image 1 -->
            <div class="p-6 border-b border-[var(--ln)] flex items-start justify-between">
              <div>
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Add marketing plan</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Marketing Plan</h2>
                <p class="text-xs text-[var(--tx)] mt-1 max-w-md">
                  Establish an annual or quarterly budget container and strategic objectives.
                </p>
              </div>
              <button (click)="closeDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <!-- Drawer Form Body matching Image 1 -->
            <form [formGroup]="planForm" (ngSubmit)="onCreateSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div class="drawer-field has-floating-label">
                <label>Plan Name *</label>
                <input formControlName="plan_name" placeholder="e.g. Annual Strategic Commercial Marketing" />
              </div>

              <div class="drawer-field has-floating-label">
                <label>Period Type *</label>
                <select formControlName="period_type">
                  <option value="Year">Year</option>
                  <option value="Quarter">Quarter</option>
                  <option value="Month">Month</option>
                </select>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Plan Owner *</label>
                <input formControlName="owner_name" placeholder="e.g. Samuel Tilahun" />
              </div>

              <div class="drawer-field has-floating-label">
                <label>Planned Budget (ETB) *</label>
                <input type="number" formControlName="total_planned_budget" placeholder="e.g. 15000000" />
              </div>

              <!-- Date Range matching Start date* and End date* in Image 1 -->
              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Start date*</label>
                  <input type="date" formControlName="start_date" />
                </div>
                <div class="drawer-field has-floating-label">
                  <label>End date*</label>
                  <input type="date" formControlName="end_date" />
                </div>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Strategic Objectives *</label>
                <textarea formControlName="objectives" placeholder="Expand B2B enterprise market share across Milling, Agribusiness, and Packaging..."></textarea>
              </div>

            </form>

            <!-- Drawer Sticky Footer matching Image 1 -->
            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <span class="text-xs text-[var(--mu)]">Save changes</span>
              <div class="flex items-center gap-2.5">
                <button (click)="closeDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
                <button (click)="onCreateSubmit()" [disabled]="planForm.invalid" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
              </div>
            </div>

          </div>
        </div>
      }

    }

    </div>
  `
})
export class MarketingPlansComponent {
  private marketingService = inject(MarketingService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  plans = this.marketingService.plans;
  activities = this.marketingService.activities;

  relatedActivities = computed(() => {
    const plan = this.selectedDetailPlan();
    if (!plan) return [];
    return this.activities().filter(a => a.plan_id === plan.plan_id);
  });

  searchQuery = signal<string>('');
  selectedPeriod = signal<string>('All');
  includeClosed = signal<boolean>(false);

  // Pagination state matching Image 2
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Popover 3-dots active menu ID
  activeMenuId = signal<number | null>(null);

  // Side Drawer signals matching Image 1
  showCreateDrawer = signal<boolean>(false);
  selectedDetailPlan = signal<MarketingPlan | null>(null);

  // Computed KPI Metrics matching Image 1 & 2
  totalCount = computed(() => this.plans().length);
  approvedCount = computed(() => this.plans().filter(p => p.status === 'Approved').length);
  pendingCount = computed(() => this.plans().filter(p => p.status !== 'Approved').length);

  planForm: FormGroup = this.fb.group({
    plan_name: ['', Validators.required],
    period_type: ['Quarter', Validators.required],
    start_date: [new Date().toISOString().slice(0, 10), Validators.required],
    end_date: ['2026-12-31', Validators.required],
    total_planned_budget: [1000000, [Validators.required, Validators.min(1000)]],
    owner_name: ['Berihu Esayas', Validators.required],
    objectives: ['']
  });

  filteredPlans = computed(() => {
    let list = this.plans();
    if (!this.includeClosed()) {
      list = list.filter(p => p.status !== 'Closed');
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        p.plan_name.toLowerCase().includes(q) ||
        p.plan_code.toLowerCase().includes(q) ||
        (p.objectives && p.objectives.toLowerCase().includes(q)) ||
        (p.owner_name && p.owner_name.toLowerCase().includes(q)) ||
        p.period_type.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q)
      );
    }
    if (this.selectedPeriod() !== 'All') {
      list = list.filter(p => p.period_type === this.selectedPeriod());
    }
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPlans().length / this.pageSize())));

  paginatedPlans = computed(() => {
    const list = this.filteredPlans();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginationText = computed(() => {
    const total = this.filteredPlans().length;
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

  onPeriodChange(event: Event): void {
    this.selectedPeriod.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleIncludeClosed(): void {
    this.includeClosed.update(v => !v);
    this.currentPage.set(1);
  }

  refresh(): void {
    this.toast.info('Marketing plans refreshed.');
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenuId() === id) {
      this.activeMenuId.set(null);
    } else {
      this.activeMenuId.set(id);
    }
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

  closeActiveMenu(): void {
    this.activeMenuId.set(null);
  }

  openDrawer(): void {
    this.closeActiveMenu();
    this.planForm.reset({
      plan_name: '',
      period_type: 'Quarter',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: '2026-12-31',
      total_planned_budget: 1000000,
      owner_name: 'Berihu Esayas',
      objectives: ''
    });
    this.showCreateDrawer.set(true);
  }

  closeDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  openDetailDrawer(plan: MarketingPlan): void {
    this.closeActiveMenu();
    this.selectedDetailPlan.set(plan);
  }

  closeDetailDrawer(): void {
    this.selectedDetailPlan.set(null);
  }

  onCreateSubmit(): void {
    if (this.planForm.invalid) return;
    const formVal = this.planForm.value;
    this.marketingService.createPlan({
      plan_name: formVal.plan_name,
      period_type: formVal.period_type as PeriodType,
      start_date: formVal.start_date,
      end_date: formVal.end_date,
      total_planned_budget: Number(formVal.total_planned_budget),
      currency: 'ETB',
      owner_id: 1,
      owner_name: formVal.owner_name,
      status: 'Draft',
      objectives: formVal.objectives
    });
    this.toast.success(`Plan "${formVal.plan_name}" saved.`);
    this.closeDrawer();
  }

  submitForApproval(plan: MarketingPlan): void {
    this.closeActiveMenu();
    this.marketingService.updatePlan(plan.plan_id, { status: 'Pending Approval' });
    this.toast.info(`Plan ${plan.plan_code} submitted for sign-off.`);
  }

  approvePlan(plan: MarketingPlan): void {
    this.closeActiveMenu();
    const today = new Date().toISOString().slice(0, 10);
    this.marketingService.updatePlan(plan.plan_id, {
      status: 'Approved',
      approved_budget: plan.total_planned_budget,
      approved_by: 'Berihu Esayas',
      approved_date: today
    });
    this.toast.success(`Plan ${plan.plan_code} approved.`);
  }

  closePlan(plan: MarketingPlan): void {
    this.closeActiveMenu();
    this.marketingService.updatePlan(plan.plan_id, { status: 'Closed' });
    this.toast.info(`Plan ${plan.plan_code} closed.`);
  }

  deletePlan(plan: MarketingPlan): void {
    this.closeActiveMenu();
    if (confirm(`Delete plan ${plan.plan_code}?`)) {
      this.marketingService.deletePlan(plan.plan_id);
      this.toast.info(`Deleted plan ${plan.plan_code}.`);
    }
  }
}
