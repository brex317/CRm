import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketingService } from '../../services/marketing.service';
import { Participant, ParticipantSource, AttendanceStatus } from '../../models/participant.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-participants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  template: `
    <div class="space-y-6" (click)="closeActiveMenu()">
      
      <!-- =====================================================================
           FULLSCREEN PARTICIPANT DETAIL VIEW (Replaces cramped drawer)
           ===================================================================== -->
      @if (selectedDetailParticipant(); as p) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Action Bar & Back Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-3">
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i class="mi text-base">arrow_back</i> Back to Participants
              </button>
              <div class="h-6 w-px bg-[var(--ln)]"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-wider text-[var(--mu)] uppercase">CRM / PARTICIPANTS</span>
                  <span class="text-xs font-mono font-bold text-[var(--pr)]">{{ p.participant_code || ('PT-2026-' + (p.participant_id < 10 ? '00' : (p.participant_id < 100 ? '0' : '')) + p.participant_id) }}</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-[var(--hd)] tracking-tight mt-0.5">{{ p.full_name }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button (click)="openFeedbackDrawer(p)" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
                <i class="mi text-base">star_rate</i> Record Feedback
              </button>
              @if (p.attendance_status === 'Registered') {
                <button (click)="markAttended(p)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm" title="Mark participant as Attended &amp; generate lead in Lead Management">
                  <i class="mi text-base">how_to_reg</i> Mark Attended
                </button>
                <button (click)="markNoShow(p)" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Mark as No-show">
                  <i class="mi text-base">block</i> No-Show
                </button>
              } @else if (p.attendance_status === 'No-show') {
                <button (click)="markAttended(p)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm" title="Mark participant as Attended &amp; generate lead in Lead Management">
                  <i class="mi text-base">how_to_reg</i> Mark Attended
                </button>
              } @else if (p.lead_code) {
                <span class="status-pill active text-xs px-3 py-1.5 font-mono">
                  <i class="mi text-sm">check_circle</i> Lead: {{ p.lead_code }}
                </span>
              }
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Close Detail View">
                <i class="mi text-base">close</i> Close
              </button>
            </div>
          </div>

          <!-- Badges & Status Banner -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="cat-pill text-xs font-bold px-3 py-1">{{ p.participant_source }}</span>
            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--hd)] border border-[var(--ln)]">
              {{ p.participant_code || ('PT-2026-' + (p.participant_id < 10 ? '00' : (p.participant_id < 100 ? '0' : '')) + p.participant_id) }}
            </span>
            @if (p.lead_code || p.lead_id) {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> LEAD CREATED: {{ p.lead_code }}
              </span>
            } @else if (p.attendance_status === 'Attended') {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> ATTENDED
              </span>
            } @else if (p.attendance_status === 'Registered') {
              <span class="status-pill pending text-xs px-3 py-1">
                <i class="mi text-sm">schedule</i> REGISTERED (PENDING ATTENDANCE)
              </span>
            } @else {
              <span class="status-pill inactive text-xs px-3 py-1">
                <i class="mi text-sm">block</i> {{ p.attendance_status }}
              </span>
            }
          </div>

          <!-- 4 Fullscreen Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">{{ p.attendance_status }}</div>
                <div class="kpi-card-lbl">Attendance Verification</div>
              </div>
              <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
                <i class="mi text-2xl">how_to_reg</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-amber-500">
                  {{ p.feedback_score ? (p.feedback_score + ' / 5') : 'Unrated' }}
                </div>
                <div class="kpi-card-lbl">Satisfaction Score</div>
              </div>
              <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
                <i class="mi text-2xl">star</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black" [class.text-[var(--ok)]]="p.consent_follow_up">
                  {{ p.consent_follow_up ? 'Granted' : 'Refused' }}
                </div>
                <div class="kpi-card-lbl">Commercial Consent</div>
              </div>
              <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
                <i class="mi text-2xl">shield</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black" [class.text-[var(--pr)]]="p.lead_code || p.lead_id">
                  {{ (p.lead_code || p.lead_id) ? 'Linked' : 'Pending' }}
                </div>
                <div class="kpi-card-lbl">Core CRM Lead</div>
              </div>
              <div class="kpi-icon-badge bg-purple-50 dark:bg-[#2a1a4a] text-purple-600 dark:text-purple-400">
                <i class="mi text-2xl">how_to_reg</i>
              </div>
            </div>
          </div>

          <!-- Main 2-Column Fullscreen Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Contact & Organization Profile, Feedback Card -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Organization & Contact Details -->
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">badge</i> Participant &amp; Corporate Profile
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Company / Organization</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-[var(--pr)]">business</i> {{ p.company_name || 'Individual / Enterprise' }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Designation / Role</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-purple-600">work</i> {{ p.position || 'Representative' }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Official Email</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-emerald-600">email</i> {{ p.email || '—' }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Contact Phone</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-amber-600">phone</i> {{ p.phone || '—' }}
                    </b>
                  </div>
                </div>
              </div>

              <!-- Feedback & Qualitative Notes -->
              <div class="erp-card-container p-6">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] flex items-center gap-2">
                    <i class="mi text-base text-amber-500">reviews</i> Attendee Feedback &amp; Review
                  </h3>
                  <button (click)="openFeedbackDrawer(p)" class="btn bo text-xs py-1 px-3 rounded-lg font-semibold flex items-center gap-1">
                    <i class="mi text-sm">edit</i> Edit
                  </button>
                </div>
                <div class="bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)]">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="flex text-amber-500">
                      @for (star of [1,2,3,4,5]; track star) {
                        <i class="mi text-base">{{ star <= (p.feedback_score || 0) ? 'star' : 'star_border' }}</i>
                      }
                    </div>
                    <span class="text-xs font-bold text-[var(--hd)]">{{ p.feedback_score ? p.feedback_score + ' / 5.0' : 'Not yet rated' }}</span>
                  </div>
                  <p class="text-sm text-[var(--hd)] italic leading-relaxed">
                    "{{ p.feedback_comment || 'No qualitative comments recorded for this attendee.' }}"
                  </p>
                </div>
              </div>

            </div>

            <!-- Right 1 Col: Event Association & CRM Sync Status -->
            <div class="space-y-6">
              
              <!-- Event Association -->
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">event</i> Activity Association
                </h3>
                <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Marketing Activity</span>
                  <b class="text-sm text-[var(--hd)] block">{{ p.activity_title || 'General Marketing Workshop' }}</b>
                  <div class="mt-2 flex items-center gap-2 text-xs text-[var(--tx)]">
                    <i class="mi text-sm text-[var(--mu)]">how_to_reg</i>
                    <span>Channel: {{ p.participant_source }}</span>
                  </div>
                </div>
              </div>

              <!-- Attendance & Lead Lifecycle Card -->
              <div class="erp-card-container p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-slate-900/40">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--hd)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">how_to_reg</i> Attendance &amp; Lead Management
                </h3>
                <p class="text-xs text-[var(--tx)] mb-4 leading-relaxed">
                  When a participant attends a workshop or event, an active sales lead is automatically created in Lead Management.
                </p>

                @if (p.lead_code || p.lead_id) {
                  <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs mb-3 flex items-start gap-2.5">
                    <i class="mi text-lg text-emerald-600 flex-shrink-0 mt-0.5">check_circle</i>
                    <div>
                      <b class="block font-mono text-xs">Lead Created: {{ p.lead_code }}</b>
                      <span class="text-[11px] text-[var(--tx)] block mt-0.5">
                        Created on {{ p.lead_created_date || 'recently' }} by {{ p.lead_created_by || 'Commercial Director' }}.
                      </span>
                    </div>
                  </div>
                } @else if (p.attendance_status === 'Registered') {
                  <div class="flex flex-col gap-2">
                    <button (click)="markAttended(p)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm">
                      <i class="mi text-base">how_to_reg</i> Mark Attended (Create Lead)
                    </button>
                    <button (click)="markNoShow(p)" class="btn bo text-xs py-2 px-3.5 rounded-xl font-medium flex items-center justify-center gap-1.5">
                      <i class="mi text-base">block</i> Mark No-Show
                    </button>
                  </div>
                } @else {
                  <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-[var(--mu)] mb-3">
                    Attendance status: <b class="text-[var(--hd)]">{{ p.attendance_status }}</b>
                  </div>
                  <button (click)="markAttended(p)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <i class="mi text-base">how_to_reg</i> Mark Attended (Create Lead)
                  </button>
                }

                <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-medium flex items-center justify-center gap-1.5 w-full mt-3">
                  <i class="mi text-base">arrow_back</i> Back to Participants List
                </button>
              </div>

            </div>

          </div>

        </div>
      } @else {

      <!-- Page Title & Header matching Image 1 & 2 -->
      <div>
        <span class="text-xs font-bold tracking-wider text-[var(--mu)] uppercase block mb-1">CRM</span>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--hd)] tracking-tight">Marketing Management</h1>
        <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Participants</h2>
        <p class="text-xs text-[var(--tx)] mt-1">
          Registered and attended workshop contacts, feedback scores, and qualified Core CRM leads.
        </p>
      </div>

      <!-- 3 KPI Metric Cards matching Image 1 & 2 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Participants Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ totalCount() }}</div>
            <div class="kpi-card-lbl">Total participants</div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- Attended / Leads Created Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ leadsCreatedCount() }}</div>
            <div class="kpi-card-lbl">Attended &amp; Lead Created</div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">check_circle</i>
          </div>
        </div>

        <!-- Registered / Pending Attendance Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ registeredCount() }}</div>
            <div class="kpi-card-lbl">Registered (Pending Attendance)</div>
          </div>
          <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
            <i class="mi text-2xl">schedule</i>
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
                #ptSearchInput
                [value]="searchQuery()" 
                (input)="onSearch($event)" 
                (keydown.escape)="clearSearch()"
                placeholder="Name, type, effective period..." />
              @if (searchQuery()) {
                <button type="button" (click)="clearSearch()" class="erp-search-clear mr-1" title="Clear search">
                  <i class="mi text-sm">close</i>
                </button>
              }
              <button type="button" (click)="ptSearchInput.focus()" class="erp-search-btn pr-3" title="Search">
                <i class="mi text-lg">search</i>
              </button>
            </div>

            <div class="ff min-w-[150px]">
              <label>Attendance</label>
              <select [value]="selectedAttendance()" (change)="onAttendanceChange($event)">
                <option value="All">All</option>
                <option value="Attended">Attended</option>
                <option value="Registered">Registered</option>
                <option value="Captured">Captured</option>
                <option value="No-show">No-show</option>
              </select>
            </div>

            <label class="toggle-switch">
              <div class="toggle-track" [class.active]="includeNoShows()" (click)="toggleIncludeNoShows()">
                <div class="toggle-thumb"></div>
              </div>
              <span>Include inactive</span>
            </label>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            <!-- Opens Right Side Drawer matching Image 1 -->
            <button (click)="openDrawer()" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
              <i class="mi text-base">add</i> New participant
            </button>

            <button (click)="refresh()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Refresh">
              <i class="mi text-base text-[var(--mu)]">refresh</i> Refresh
            </button>
          </div>

        </div>

        <!-- NESTED Table View matching Screenshot 3a2c9fd4 -->
        @if (paginatedParticipants().length > 0) {
          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>EMPLOYEE / PARTICIPANT</th>
                  <th>COMPANY</th>
                  <th>JOB TITLE</th>
                  <th>PHONE NUMBER</th>
                  <th>STATUS</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (p of paginatedParticipants(); track p.participant_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs whitespace-nowrap">{{ p.participant_code || ('RARAS-' + (100000 + p.participant_id)) }}</b>
                    </td>
                    <td>
                      <span class="text-[var(--hd)] hover:text-[var(--pr)] cursor-pointer text-sm font-semibold whitespace-nowrap" (click)="openDetailDrawer(p)">
                        {{ p.full_name }}
                      </span>
                    </td>
                    <td class="text-xs text-[var(--hd)] font-medium whitespace-nowrap">
                      {{ p.company_name }}
                    </td>
                    <td class="text-xs text-[var(--tx)] font-medium whitespace-nowrap">
                      {{ p.position || '—' }}
                    </td>
                    <td class="text-xs text-[var(--tx)] font-medium whitespace-nowrap">
                      {{ p.phone || '—' }}
                    </td>
                    <td>
                      @if (p.lead_code || p.lead_id) {
                        <span class="status-pill active" title="Attended &amp; Lead Created ({{ p.lead_code }})">
                          <i class="mi text-sm">check_circle</i> LEAD CREATED
                        </span>
                      } @else if (p.attendance_status === 'Attended') {
                        <span class="status-pill active">
                          <i class="mi text-sm">check_circle</i> ATTENDED
                        </span>
                      } @else if (p.attendance_status === 'Registered') {
                        <span class="status-pill pending">
                          <i class="mi text-sm">schedule</i> REGISTERED
                        </span>
                      } @else if (p.attendance_status === 'Captured') {
                        <span class="status-pill active">
                          <i class="mi text-sm">how_to_reg</i> CAPTURED
                        </span>
                      } @else {
                        <span class="status-pill inactive">
                          <i class="mi text-sm">block</i> NO-SHOW
                        </span>
                      }
                    </td>

                    <!-- 3-Dots Action Cell -->
                    <td class="text-right relative whitespace-nowrap" (click)="$event.stopPropagation()">
                      <button 
                        (click)="toggleMenu(p.participant_id, $event)" 
                        class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
                        title="Row Actions"
                        aria-label="Actions">
                        <i class="mi text-xl text-[var(--mu)] hover:text-[var(--hd)]">more_vert</i>
                      </button>

                      @if (activeMenuId() === p.participant_id) {
                        <div class="action-popover">
                          <button (click)="openDetailDrawer(p)" class="action-item">
                            <i class="mi">visibility</i>
                            <span>View Details</span>
                          </button>

                          @if (p.attendance_status === 'Registered') {
                            <button (click)="markAttended(p)" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">how_to_reg</i>
                              <span>Mark Attended (Create Lead)</span>
                            </button>
                            <button (click)="markNoShow(p)" class="action-item text-[var(--mu)]">
                              <i class="mi">block</i>
                              <span>Mark No-Show</span>
                            </button>
                          } @else if (p.attendance_status === 'No-show') {
                            <button (click)="markAttended(p)" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">how_to_reg</i>
                              <span>Mark Attended (Create Lead)</span>
                            </button>
                          }

                          <button (click)="openFeedbackDrawer(p)" class="action-item">
                            <i class="mi">star_rate</i>
                            <span>Record Feedback</span>
                          </button>

                          <div class="action-divider"></div>

                          <button (click)="deleteParticipant(p)" class="action-item danger">
                            <i class="mi">delete</i>
                            <span>Delete Participant</span>
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
              <i class="mi text-3xl">person_off</i>
            </div>
            <b class="text-base font-bold text-[var(--hd)] mb-1">No Data Found</b>
            <p class="text-xs text-[var(--mu)]">No participants match your filters.</p>
          </div>
        }

        <!-- Pagination Controls matching Image 2 & 31662825 with Popover -->
        <app-table-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="filteredParticipants().length"
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
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Add participant</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Participant</h2>
                <p class="text-xs text-[var(--tx)] mt-1 max-w-md">
                  Capture attendee information, verified company, and commercial follow-up consent.
                </p>
              </div>
              <button (click)="closeDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="participantForm" (ngSubmit)="onCreateSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div class="drawer-field has-floating-label">
                <label>Full Name *</label>
                <input formControlName="full_name" placeholder="e.g. berihu Esayas" />
              </div>

              <div class="drawer-field has-floating-label">
                <label>Company / Organization *</label>
                <input formControlName="company_name" placeholder="e.g. Ethiopian Agro Enterprise" />
              </div>

              <div class="drawer-field has-floating-label">
                <label>Job Title / Position</label>
                <input formControlName="position" placeholder="e.g. Senior Accountant" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Email Address</label>
                  <input type="email" formControlName="email" placeholder="e.g. name@company.com" />
                </div>
                <div class="drawer-field has-floating-label">
                  <label>Phone Number</label>
                  <input formControlName="phone" placeholder="e.g. 0934752834" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Source *</label>
                  <select formControlName="participant_source">
                    <option value="Registered">Registered</option>
                    <option value="Invited">Invited</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Captured at event">Captured at event</option>
                  </select>
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Attendance Status *</label>
                  <select formControlName="attendance_status">
                    <option value="Attended">Attended</option>
                    <option value="Registered">Registered</option>
                    <option value="Captured">Captured</option>
                    <option value="No-show">No-show</option>
                  </select>
                </div>
              </div>

              <div class="p-3.5 rounded-xl border border-[var(--ln)] bg-[var(--bg)]/50 flex items-center gap-3">
                <input type="checkbox" id="consentCb" formControlName="consent_follow_up" class="w-4 h-4 text-[var(--pr)] rounded" />
                <label for="consentCb" class="text-xs text-[var(--hd)] cursor-pointer select-none">
                  Explicit follow-up consent granted (Required for CRM hand-off).
                </label>
              </div>

            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <span class="text-xs text-[var(--mu)]">Save changes</span>
              <div class="flex items-center gap-2.5">
                <button (click)="closeDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
                <button (click)="onCreateSubmit()" [disabled]="participantForm.invalid" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
              </div>
            </div>

          </div>
        </div>
      }



      <!-- =====================================================================
           RIGHT SIDE DRAWER (RECORD FEEDBACK)
           ===================================================================== -->
      @if (showFeedbackDrawer()) {
        <div class="drawer-backdrop" (click)="closeFeedbackDrawer()">
          <div class="drawer-panel max-w-md" (click)="$event.stopPropagation()">
            
            <div class="p-6 border-b border-[var(--ln)] flex items-start justify-between">
              <div>
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Attendee feedback</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Record Feedback</h2>
              </div>
              <button (click)="closeFeedbackDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="feedbackForm" (ngSubmit)="onFeedbackSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              <div class="drawer-field">
                <select formControlName="feedback_score">
                  <option [value]="5">5 - Excellent</option>
                  <option [value]="4">4 - Good</option>
                  <option [value]="3">3 - Average</option>
                  <option [value]="2">2 - Needs Improvement</option>
                  <option [value]="1">1 - Poor</option>
                </select>
              </div>

              <div class="drawer-field">
                <textarea formControlName="feedback_comment" placeholder="Feedback notes and takeaways..."></textarea>
              </div>
            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <button (click)="closeFeedbackDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
              <button (click)="onFeedbackSubmit()" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save Feedback</button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class ParticipantsComponent {
  private marketingService = inject(MarketingService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  participants = this.marketingService.participants;

  searchQuery = signal<string>('');
  selectedAttendance = signal<string>('All');
  includeNoShows = signal<boolean>(false);

  // Pagination state matching Image 2
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Popover 3-dots active menu ID
  activeMenuId = signal<number | null>(null);

  // Side Drawer signals matching Image 1
  showCreateDrawer = signal<boolean>(false);
  selectedDetailParticipant = signal<Participant | null>(null);
  showFeedbackDrawer = signal<boolean>(false);
  selectedParticipantForFeedback = signal<Participant | null>(null);

  // Computed KPI Metrics matching Image 1 & 2
  totalCount = computed(() => this.participants().length);
  attendedCount = computed(() => this.participants().filter(p => p.attendance_status === 'Attended' || p.attendance_status === 'Captured').length);
  leadsCreatedCount = computed(() => this.participants().filter(p => !!p.lead_code || !!p.lead_id).length);
  registeredCount = computed(() => this.participants().filter(p => p.attendance_status === 'Registered').length);
  pendingCount = computed(() => this.participants().filter(p => p.attendance_status !== 'Attended' && p.attendance_status !== 'Captured').length);

  participantForm: FormGroup = this.fb.group({
    full_name: ['', Validators.required],
    company_name: ['', Validators.required],
    position: [''],
    email: ['', [Validators.email]],
    phone: [''],
    participant_source: ['Registered', Validators.required],
    attendance_status: ['Attended', Validators.required],
    consent_follow_up: [true]
  });

  feedbackForm: FormGroup = this.fb.group({
    feedback_score: [5, Validators.required],
    feedback_comment: ['']
  });

  filteredParticipants = computed(() => {
    let list = this.participants();
    if (!this.includeNoShows()) {
      list = list.filter(p => p.attendance_status !== 'No-show');
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        p.full_name.toLowerCase().includes(q) ||
        (p.participant_code && p.participant_code.toLowerCase().includes(q)) ||
        (p.company_name && p.company_name.toLowerCase().includes(q)) ||
        (p.position && p.position.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.phone && p.phone.toLowerCase().includes(q)) ||
        (p.crm_lead_id && p.crm_lead_id.toLowerCase().includes(q)) ||
        (p.activity_title && p.activity_title.toLowerCase().includes(q)) ||
        p.participant_source.toLowerCase().includes(q) ||
        p.attendance_status.toLowerCase().includes(q)
      );
    }
    if (this.selectedAttendance() !== 'All') {
      list = list.filter(p => p.attendance_status === this.selectedAttendance());
    }
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredParticipants().length / this.pageSize())));

  paginatedParticipants = computed(() => {
    const list = this.filteredParticipants();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginationText = computed(() => {
    const total = this.filteredParticipants().length;
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

  onAttendanceChange(event: Event): void {
    this.selectedAttendance.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleIncludeNoShows(): void {
    this.includeNoShows.update(v => !v);
    this.currentPage.set(1);
  }

  refresh(): void {
    this.toast.info('Participants refreshed.');
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
    this.participantForm.reset({
      full_name: '',
      company_name: '',
      position: '',
      email: '',
      phone: '',
      participant_source: 'Registered',
      attendance_status: 'Attended',
      consent_follow_up: true
    });
    this.showCreateDrawer.set(true);
  }

  closeDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  openDetailDrawer(p: Participant): void {
    this.closeActiveMenu();
    this.selectedDetailParticipant.set(p);
  }

  closeDetailDrawer(): void {
    this.selectedDetailParticipant.set(null);
  }

  openFeedbackDrawer(p: Participant): void {
    this.closeActiveMenu();
    this.selectedParticipantForFeedback.set(p);
    this.feedbackForm.patchValue({
      feedback_score: p.feedback_score || 5,
      feedback_comment: p.feedback_comment || ''
    });
    this.showFeedbackDrawer.set(true);
  }

  closeFeedbackDrawer(): void {
    this.showFeedbackDrawer.set(false);
    this.selectedParticipantForFeedback.set(null);
  }

  onCreateSubmit(): void {
    if (this.participantForm.invalid) return;
    const formVal = this.participantForm.value;
    const newP = this.marketingService.createParticipant({
      activity_id: 1,
      full_name: formVal.full_name,
      company_name: formVal.company_name,
      position: formVal.position,
      email: formVal.email,
      phone: formVal.phone,
      participant_source: formVal.participant_source as ParticipantSource,
      attendance_status: formVal.attendance_status as AttendanceStatus,
      consent_follow_up: Boolean(formVal.consent_follow_up),
      activity_title: 'Ethiopian Food Manufacturing Industry Workshop'
    });
    if (newP.attendance_status === 'Attended' && newP.consent_follow_up) {
      this.marketingService.markAttended(newP.participant_id);
      this.toast.success(`Participant "${formVal.full_name}" registered & marked Attended. Lead created in Lead Management.`);
    } else {
      this.toast.success(`Participant "${formVal.full_name}" registered.`);
    }
    this.closeDrawer();
  }

  markAttended(p: Participant): void {
    this.closeActiveMenu();
    const result = this.marketingService.markAttended(p.participant_id);
    if (result.success) {
      this.toast.success(result.message);
      if (this.selectedDetailParticipant()?.participant_id === p.participant_id) {
        const updated = this.marketingService.participants().find(item => item.participant_id === p.participant_id);
        if (updated) {
          this.selectedDetailParticipant.set(updated);
        }
      }
    } else {
      this.toast.error(result.message);
    }
  }

  markNoShow(p: Participant): void {
    this.closeActiveMenu();
    const result = this.marketingService.markNoShow(p.participant_id);
    if (result.success) {
      this.toast.info(result.message);
      if (this.selectedDetailParticipant()?.participant_id === p.participant_id) {
        const updated = this.marketingService.participants().find(item => item.participant_id === p.participant_id);
        if (updated) {
          this.selectedDetailParticipant.set(updated);
        }
      }
    }
  }

  isEligibleForLead(p: Participant | null | undefined): boolean {
    if (!p) return false;
    if (p.lead_id || p.lead_code) return false;
    if (p.consent_withdrawn_date) return false;
    if (!p.consent_follow_up) return false;
    if (p.attendance_status !== 'Attended' && p.attendance_status !== 'Captured') return false;
    return Boolean(p.email || p.phone);
  }

  createLead(p: Participant): void {
    this.markAttended(p);
  }

  sendToCrm(p: Participant): void {
    this.createLead(p);
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

  onFeedbackSubmit(): void {
    const p = this.selectedParticipantForFeedback();
    if (!p) return;
    const formVal = this.feedbackForm.value;
    p.feedback_score = Number(formVal.feedback_score);
    p.feedback_comment = formVal.feedback_comment;
    this.toast.success(`Feedback saved for ${p.full_name}.`);
    this.closeFeedbackDrawer();
  }

  async deleteParticipant(p: Participant): Promise<void> {
    this.closeActiveMenu();
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Participant',
      message: 'Do you want to delete this participant record?',
      recordName: `${p.full_name}${p.company_name ? ' (' + p.company_name + ')' : ''}`,
      confirmText: 'Delete Participant',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      this.marketingService.deleteParticipant(p.participant_id);
      this.toast.info(`Deleted participant.`);
    }
  }
}
