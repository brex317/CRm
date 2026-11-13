import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketingService } from '../../services/marketing.service';
import { MarketingActivity, ActivityType, DeliveryMode } from '../../models/marketing-activity.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-marketing-activities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  template: `
    <div class="space-y-6" (click)="closeActiveMenu()">
      
      <!-- =====================================================================
           FULLSCREEN ACTIVITY DETAIL VIEW (Replaces cramped drawer)
           ===================================================================== -->
      @if (selectedDetailActivity(); as act) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Action Bar & Back Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-3">
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i class="mi text-base">arrow_back</i> Back to Activities
              </button>
              <div class="h-6 w-px bg-[var(--ln)]"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-wider text-[var(--mu)] uppercase">CRM / MARKETING ACTIVITIES</span>
                  <span class="text-xs font-mono font-bold text-[var(--pr)]">{{ act.activity_code }}</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-[var(--hd)] tracking-tight mt-0.5">{{ act.title }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              @if (act.status === 'Draft') {
                <button (click)="submitForApproval(act)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <i class="mi text-base">send</i> Submit for Approval
                </button>
              }
              @if (act.status === 'In Progress') {
                <button (click)="completeActivity(act)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <i class="mi text-base">task_alt</i> Complete Activity
                </button>
              }
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Close Detail View">
                <i class="mi text-base">close</i> Close
              </button>
            </div>
          </div>

          <!-- Badges & Status Banner -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="cat-pill text-xs font-bold px-3 py-1">{{ act.activity_type }}</span>
            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--hd)] border border-[var(--ln)]">
              {{ act.activity_code }}
            </span>
            <span class="cat-pill text-xs px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200">
              {{ act.delivery_mode || 'Physical' }}
            </span>
            @if (act.status === 'In Progress' || act.status === 'Approved') {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> ACTIVE ({{ act.status }})
              </span>
            } @else if (act.status === 'Draft' || act.status === 'Pending Approval') {
              <span class="status-pill pending text-xs px-3 py-1">
                <i class="mi text-sm">schedule</i> {{ act.status }}
              </span>
            } @else {
              <span class="status-pill inactive text-xs px-3 py-1">
                <i class="mi text-sm">done_all</i> {{ act.status }}
              </span>
            }
          </div>

          <!-- 4 Fullscreen Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">ETB {{ act.planned_budget | number }}</div>
                <div class="kpi-card-lbl">Planned Budget</div>
              </div>
              <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
                <i class="mi text-2xl">account_balance_wallet</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-[var(--ok)]">
                  {{ act.actual_cost ? ('ETB ' + (act.actual_cost | number)) : 'ETB 0' }}
                </div>
                <div class="kpi-card-lbl">Actual Incurred Spend</div>
              </div>
              <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
                <i class="mi text-2xl">receipt_long</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">
                  {{ act.planned_leads || '—' }}
                </div>
                <div class="kpi-card-lbl">Planned Lead Target</div>
              </div>
              <div class="kpi-icon-badge bg-purple-50 dark:bg-[#2a1a4a] text-purple-600 dark:text-purple-400">
                <i class="mi text-2xl">track_changes</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {{ act.leads_generated || 0 }}
                </div>
                <div class="kpi-card-lbl">Leads Captured</div>
              </div>
              <div class="kpi-icon-badge bg-indigo-50 dark:bg-[#1e293b] text-indigo-600 dark:text-indigo-400">
                <i class="mi text-2xl">people</i>
              </div>
            </div>
          </div>

          <!-- Main 2-Column Fullscreen Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Objective, Target Audience & Related Records -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Objective & Target Audience Card -->
              <div class="erp-card-container p-6 space-y-4">
                <div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-1 flex items-center gap-2">
                    <i class="mi text-base text-[var(--pr)]">flag</i> Core Objective
                  </h3>
                  <p class="text-sm text-[var(--hd)] leading-relaxed bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] font-medium">
                    {{ act.objective }}
                  </p>
                </div>
                <div>
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-1 flex items-center gap-2">
                    <i class="mi text-base text-purple-600">group</i> Target Audience
                  </h3>
                  <p class="text-xs text-[var(--tx)] bg-[var(--chip-bg)] p-3.5 rounded-xl border border-[var(--ln)]">
                    {{ act.target_audience }}
                  </p>
                </div>
              </div>

              <!-- Associated Participants Table Card -->
              <div class="erp-card-container">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider">Registered Participants &amp; Leads</h3>
                    <span class="text-xs text-[var(--mu)]">Enterprise attendees and CRM contacts from this initiative</span>
                  </div>
                  <span class="cat-pill font-bold">{{ relatedParticipants().length }} Contacts</span>
                </div>

                @if (relatedParticipants().length > 0) {
                  <div class="erp-table-nested">
                    <table class="crm-tbl">
                      <thead>
                        <tr>
                          <th>CODE</th>
                          <th>NAME &amp; CONTACT</th>
                          <th>ORGANIZATION</th>
                          <th>PHONE</th>
                          <th>LEAD</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (p of relatedParticipants(); track p.participant_id) {
                          <tr class="hover:bg-[var(--chip-bg)]">
                            <td class="font-mono text-xs font-bold text-[var(--pr)]">{{ p.participant_code || ('PRT-' + p.participant_id) }}</td>
                            <td class="text-xs text-[var(--hd)] font-semibold whitespace-nowrap">
                              {{ p.full_name }}
                            </td>
                            <td><span class="cat-pill">{{ p.company_name }}</span></td>
                            <td class="text-xs font-medium">{{ p.phone }}</td>
                            <td>
                              @if (p.lead_code || p.lead_id) {
                                <span class="status-pill active"><i class="mi text-xs">how_to_reg</i> {{ p.lead_code || ('LD-' + p.lead_id) }}</span>
                              } @else {
                                <span class="text-xs text-[var(--mu)] italic">—</span>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="p-8 text-center text-xs text-[var(--mu)]">
                    No participants recorded under this initiative yet.
                  </div>
                }
              </div>

            </div>

            <!-- Right 1 Col: Platform, Venue & Governance -->
            <div class="space-y-6">
              
              <div class="erp-card-container p-6 space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">place</i> Channel, Venue &amp; Dates
                </h3>

                <div class="space-y-3">
                  <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] uppercase font-bold text-[var(--mu)] block mb-0.5">Venue or Platform</span>
                    <b class="text-sm text-[var(--hd)]">{{ act.venue_or_platform || 'Main Corporate Hub' }}</b>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                      <span class="text-[10px] uppercase font-bold text-[var(--mu)] block mb-0.5">Start Date</span>
                      <b class="text-xs text-[var(--hd)]">{{ act.start_date }}</b>
                    </div>
                    <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                      <span class="text-[10px] uppercase font-bold text-[var(--mu)] block mb-0.5">End Date</span>
                      <b class="text-xs text-[var(--hd)]">{{ act.end_date }}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div class="erp-card-container p-6 space-y-4">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">shield</i> Governance &amp; Route
                </h3>

                <div class="space-y-3 text-xs">
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-[var(--mu)] font-medium">Activity Owner</span>
                    <b class="text-[var(--hd)] font-semibold">{{ act.owner_name }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-[var(--mu)] font-medium">Linked Plan</span>
                    <b class="text-[var(--hd)] font-semibold truncate max-w-[180px]">{{ act.plan_name || 'Enterprise Strategy' }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-[var(--mu)] font-medium">Approval Route</span>
                    <b class="text-[var(--hd)] font-semibold">{{ act.approval_route || 'Standard Route' }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2">
                    <span class="text-[var(--mu)] font-medium">Strategic Initiative</span>
                    <b class="text-[var(--ok)] font-semibold">{{ act.is_strategic ? 'YES' : 'NO' }}</b>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      } @else {

        <!-- =====================================================================
             MAIN ACTIVITIES TABLE (Displayed when no activity is selected)
             ===================================================================== -->
        <!-- Page Title & Header matching Image 1 & 2 -->
      <div>
        <span class="text-xs font-bold tracking-wider text-[var(--mu)] uppercase block mb-1">CRM</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--hd)] tracking-tight">Marketing Management</h1>
        <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Marketing Activities</h2>
        <p class="text-xs text-[var(--tx)] mt-1">
          Initiatives by campaign type, delivery channel, target budget, and status.
        </p>
      </div>

      <!-- 3 KPI Metric Cards matching Image 1 & 2 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Activities Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ totalCount() }}</div>
            <div class="kpi-card-lbl">Total activities</div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- In Progress & Active Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ activeCount() }}</div>
            <div class="kpi-card-lbl">Active &amp; In Progress</div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">check_circle</i>
          </div>
        </div>

        <!-- Completed / Draft Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ otherCount() }}</div>
            <div class="kpi-card-lbl">Draft &amp; Completed</div>
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
                #actSearchInput
                [value]="searchQuery()" 
                (input)="onSearch($event)" 
                (keydown.escape)="clearSearch()"
                placeholder="Name, type, effective period..." />
              @if (searchQuery()) {
                <button type="button" (click)="clearSearch()" class="erp-search-clear mr-1" title="Clear search">
                  <i class="mi text-sm">close</i>
                </button>
              }
              <button type="button" (click)="actSearchInput.focus()" class="erp-search-btn pr-3" title="Search">
                <i class="mi text-lg">search</i>
              </button>
            </div>

            <div class="ff min-w-[150px]">
              <label>Type</label>
              <select [value]="selectedType()" (change)="onTypeChange($event)">
                <option value="All">All</option>
                <option value="Campaign">Campaign</option>
                <option value="Workshop">Workshop</option>
                <option value="Event">Event</option>
                <option value="Sponsorship">Sponsorship</option>
              </select>
            </div>

            <label class="toggle-switch">
              <div class="toggle-track" [class.active]="includeCompleted()" (click)="toggleIncludeCompleted()">
                <div class="toggle-thumb"></div>
              </div>
              <span>Include completed</span>
            </label>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            <!-- Opens Right Side Drawer matching Image 1 -->
            <button (click)="openDrawer()" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
              <i class="mi text-base">add</i> New activity
            </button>

            <button (click)="refresh()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Refresh">
              <i class="mi text-base text-[var(--mu)]">refresh</i> Refresh
            </button>
          </div>

        </div>

        <!-- NESTED Table View matching Screenshot 3a2c9fd4 -->
        @if (paginatedActivities().length > 0) {
          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>ACTIVITY</th>
                  <th>TYPE</th>
                  <th>DELIVERY</th>
                  <th>DATES</th>
                  <th>BUDGET</th>
                  <th>LEADS</th>
                  <th>STATUS</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (act of paginatedActivities(); track act.activity_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs">{{ act.activity_code }}</b>
                    </td>
                    <td>
                      <span class="text-[var(--hd)] hover:text-[var(--pr)] cursor-pointer text-sm font-semibold whitespace-nowrap" (click)="openDetailDrawer(act)">
                        {{ act.title }}
                      </span>
                    </td>
                    <td>
                      <span class="cat-pill">{{ act.activity_type }}</span>
                    </td>
                    <td class="text-xs text-[var(--tx)]">
                      {{ act.delivery_mode || 'Physical' }}
                    </td>
                    <td class="text-xs text-[var(--tx)] whitespace-nowrap">
                      {{ act.start_date }} &rarr; {{ act.end_date }}
                    </td>
                    <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                      ETB {{ act.planned_budget | number }}
                    </td>
                    <td class="text-xs font-semibold" [class.text-[var(--ok)]]="(act.leads_generated || 0) > 0">
                      {{ act.leads_generated || 0 }}
                    </td>
                    <td>
                      @if (act.status === 'In Progress' || act.status === 'Approved') {
                        <span class="status-pill active">
                          <i class="mi text-sm">check_circle</i> ACTIVE
                        </span>
                      } @else if (act.status === 'Draft' || act.status === 'Pending Approval') {
                        <span class="status-pill pending">
                          <i class="mi text-sm">schedule</i> {{ act.status }}
                        </span>
                      } @else {
                        <span class="status-pill inactive">
                          <i class="mi text-sm">block</i> {{ act.status }}
                        </span>
                      }
                    </td>

                    <!-- 3-Dots Action Cell -->
                    <td class="text-right relative whitespace-nowrap" (click)="$event.stopPropagation()">
                      <button 
                        (click)="toggleMenu(act.activity_id, $event)" 
                        class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
                        title="Row Actions"
                        aria-label="Actions">
                        <i class="mi text-xl text-[var(--mu)] hover:text-[var(--hd)]">more_vert</i>
                      </button>

                      @if (activeMenuId() === act.activity_id) {
                        <div class="action-popover">
                          <button (click)="openDetailDrawer(act)" class="action-item">
                            <i class="mi">visibility</i>
                            <span>View Details</span>
                          </button>

                          @if (act.status === 'Draft') {
                            <button (click)="submitForApproval(act)" class="action-item">
                              <i class="mi text-blue-600">send</i>
                              <span>Submit for Approval</span>
                            </button>
                          }

                          @if (act.status === 'Pending Approval') {
                            <button (click)="approveActivity(act)" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">check_circle</i>
                              <span>Approve Activity</span>
                            </button>
                          }

                          @if (act.status === 'Approved') {
                            <button (click)="startExecution(act)" class="action-item text-purple-600">
                              <i class="mi text-purple-600">play_arrow</i>
                              <span>Start Execution</span>
                            </button>
                          }

                          @if (act.status === 'In Progress') {
                            <button (click)="completeActivity(act)" class="action-item text-emerald-600">
                              <i class="mi text-emerald-600">task_alt</i>
                              <span>Mark Completed</span>
                            </button>
                          }

                          <div class="action-divider"></div>

                          <button (click)="deleteActivity(act)" class="action-item danger">
                            <i class="mi">delete</i>
                            <span>Delete Activity</span>
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
            <p class="text-xs text-[var(--mu)]">No marketing activities match your filters.</p>
          </div>
        }

        <!-- Pagination Controls matching Image 2 & 31662825 with Popover -->
        <app-table-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="filteredActivities().length"
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
            
            <div class="p-6 border-b border-[var(--ln)] flex items-start justify-between">
              <div>
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Add marketing activity</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Marketing Activity</h2>
                <p class="text-xs text-[var(--tx)] mt-1 max-w-md">
                  Configure initiative parameters, delivery channel, target budget, and audience.
                </p>
              </div>
              <button (click)="closeDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="activityForm" (ngSubmit)="onCreateSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div class="drawer-field has-floating-label">
                <label>Activity Title *</label>
                <input formControlName="title" placeholder="e.g. Agro-Industrial Initiative 001" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Type *</label>
                  <select formControlName="activity_type">
                    <option value="Campaign">Campaign</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Event">Event</option>
                    <option value="Sponsorship">Sponsorship</option>
                  </select>
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Delivery Mode *</label>
                  <select formControlName="delivery_mode">
                    <option value="Physical">Physical</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Digital">Digital</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <!-- Start date* and End date* side by side matching Image 1 -->
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

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Planned Budget (ETB) *</label>
                  <input type="number" formControlName="planned_budget" placeholder="e.g. 250000" />
                </div>
                <div class="drawer-field has-floating-label">
                  <label>Target Leads</label>
                  <input type="number" formControlName="planned_leads" placeholder="e.g. 50" />
                </div>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Venue or Platform</label>
                <input formControlName="venue_or_platform" placeholder="e.g. Millennium Hall / LinkedIn" />
              </div>

              <div class="drawer-field has-floating-label">
                <label>Commercial Objective *</label>
                <textarea formControlName="objective" placeholder="Purpose and commercial objective of this activity..."></textarea>
              </div>

            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <span class="text-xs text-[var(--mu)]">Save changes</span>
              <div class="flex items-center gap-2.5">
                <button (click)="closeDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
                <button (click)="onCreateSubmit()" [disabled]="activityForm.invalid" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
              </div>
            </div>

          </div>
        </div>
      }

    }

    </div>
  `
})
export class MarketingActivitiesComponent {
  private marketingService = inject(MarketingService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  activities = this.marketingService.activities;
  participants = this.marketingService.participants;

  relatedParticipants = computed(() => {
    const act = this.selectedDetailActivity();
    if (!act) return [];
    return this.participants().filter(p => p.activity_id === act.activity_id);
  });

  searchQuery = signal<string>('');
  selectedType = signal<string>('All');
  includeCompleted = signal<boolean>(false);

  // Pagination state matching Image 2
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Popover 3-dots active menu ID
  activeMenuId = signal<number | null>(null);

  // Side Drawer signals matching Image 1
  showCreateDrawer = signal<boolean>(false);
  selectedDetailActivity = signal<MarketingActivity | null>(null);

  // Computed KPI Metrics matching Image 1 & 2
  totalCount = computed(() => this.activities().length);
  activeCount = computed(() => this.activities().filter(a => a.status === 'In Progress' || a.status === 'Approved').length);
  otherCount = computed(() => this.activities().filter(a => a.status !== 'In Progress' && a.status !== 'Approved').length);

  activityForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    activity_type: ['Workshop', Validators.required],
    delivery_mode: ['Physical', Validators.required],
    start_date: [new Date().toISOString().slice(0, 10), Validators.required],
    end_date: ['2026-12-31', Validators.required],
    planned_budget: [250000, [Validators.required, Validators.min(100)]],
    planned_leads: [20],
    venue_or_platform: [''],
    objective: ['', Validators.required]
  });

  filteredActivities = computed(() => {
    let list = this.activities();
    if (!this.includeCompleted()) {
      list = list.filter(a => a.status !== 'Completed' && a.status !== 'Closed');
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.activity_code.toLowerCase().includes(q) ||
        a.objective.toLowerCase().includes(q) ||
        (a.owner_name && a.owner_name.toLowerCase().includes(q)) ||
        (a.target_audience && a.target_audience.toLowerCase().includes(q)) ||
        (a.venue_or_platform && a.venue_or_platform.toLowerCase().includes(q)) ||
        a.activity_type.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        (a.delivery_mode && a.delivery_mode.toLowerCase().includes(q))
      );
    }
    if (this.selectedType() !== 'All') {
      list = list.filter(a => a.activity_type === this.selectedType());
    }
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredActivities().length / this.pageSize())));

  paginatedActivities = computed(() => {
    const list = this.filteredActivities();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginationText = computed(() => {
    const total = this.filteredActivities().length;
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

  toggleIncludeCompleted(): void {
    this.includeCompleted.update(v => !v);
    this.currentPage.set(1);
  }

  refresh(): void {
    this.toast.info('Marketing activities refreshed.');
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
    this.activityForm.reset({
      title: '',
      activity_type: 'Workshop',
      delivery_mode: 'Physical',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: '2026-12-31',
      planned_budget: 250000,
      planned_leads: 20,
      venue_or_platform: '',
      objective: ''
    });
    this.showCreateDrawer.set(true);
  }

  closeDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  openDetailDrawer(act: MarketingActivity): void {
    this.closeActiveMenu();
    this.selectedDetailActivity.set(act);
  }

  closeDetailDrawer(): void {
    this.selectedDetailActivity.set(null);
  }

  onCreateSubmit(): void {
    if (this.activityForm.invalid) return;
    const formVal = this.activityForm.value;
    this.marketingService.createActivity({
      plan_id: 1,
      title: formVal.title,
      activity_type: formVal.activity_type as ActivityType,
      delivery_mode: formVal.delivery_mode as DeliveryMode,
      start_date: formVal.start_date,
      end_date: formVal.end_date,
      planned_budget: Number(formVal.planned_budget),
      planned_leads: Number(formVal.planned_leads || 0),
      venue_or_platform: formVal.venue_or_platform,
      objective: formVal.objective,
      owner_id: 1,
      owner_name: 'Berihu Esayas',
      status: 'Draft'
    });
    this.toast.success(`Activity "${formVal.title}" saved.`);
    this.closeDrawer();
  }

  submitForApproval(act: MarketingActivity): void {
    this.closeActiveMenu();
    this.marketingService.updateActivityStatus(act.activity_id, 'Pending Approval');
    this.toast.info(`Activity ${act.activity_code} submitted.`);
  }

  approveActivity(act: MarketingActivity): void {
    this.closeActiveMenu();
    this.marketingService.updateActivityStatus(act.activity_id, 'Approved');
    this.toast.success(`Activity ${act.activity_code} approved.`);
  }

  startExecution(act: MarketingActivity): void {
    this.closeActiveMenu();
    this.marketingService.updateActivityStatus(act.activity_id, 'In Progress');
    this.toast.info(`Activity in progress.`);
  }

  completeActivity(act: MarketingActivity): void {
    this.closeActiveMenu();
    this.marketingService.updateActivityStatus(act.activity_id, 'Completed');
    this.toast.success(`Activity marked completed.`);
  }

  async deleteActivity(act: MarketingActivity): Promise<void> {
    this.closeActiveMenu();
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Activity',
      message: 'Do you want to delete this marketing activity record?',
      recordName: `${act.activity_code} • ${act.title}`,
      confirmText: 'Delete Activity',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      this.marketingService.deleteActivity(act.activity_id);
      this.toast.info(`Deleted activity ${act.activity_code}.`);
    }
  }
}
