import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketingService } from '../../services/marketing.service';
import { ContentItem, Platform, ContentFormat, ContentStatus } from '../../models/content-item.model';
import { ToastService } from '../../../../core/services/toast.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-content-items',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  template: `
    <div class="space-y-6" (click)="closeActiveMenu()">
      
      <!-- =====================================================================
           FULLSCREEN CONTENT DETAIL VIEW (Replaces cramped drawer)
           ===================================================================== -->
      @if (selectedDetailItem(); as item) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Action Bar & Back Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-3">
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i class="mi text-base">arrow_back</i> Back to Content Items
              </button>
              <div class="h-6 w-px bg-[var(--ln)]"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-wider text-[var(--mu)] uppercase">CRM / CONTENT ITEMS</span>
                  <span class="text-xs font-mono font-bold text-[var(--pr)]">{{ item.content_code || ('CNT-2026-' + (item.content_id < 10 ? '00' : (item.content_id < 100 ? '0' : '')) + item.content_id) }}</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-[var(--hd)] tracking-tight mt-0.5">{{ item.title }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button (click)="openMetricsDrawer(item)" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
                <i class="mi text-base">tune</i> Update Metrics
              </button>
              @if (item.status === 'Draft') {
                <button (click)="changeStatus(item, 'In Review')" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <i class="mi text-base">send</i> Submit for Review
                </button>
              }
              @if (item.status === 'In Review') {
                <button (click)="changeStatus(item, 'Approved')" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <i class="mi text-base">check_circle</i> Approve Content
                </button>
              }
              @if (item.status === 'Approved') {
                <button (click)="changeStatus(item, 'Published')" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <i class="mi text-base">publish</i> Publish Live
                </button>
              }
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Close Detail View">
                <i class="mi text-base">close</i> Close
              </button>
            </div>
          </div>

          <!-- Badges & Status Banner -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="cat-pill text-xs font-bold px-3 py-1">{{ item.platform }}</span>
            <span class="cat-pill text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              {{ item.content_format }}
            </span>
            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--hd)] border border-[var(--ln)]">
              {{ item.content_code || ('CNT-2026-' + (item.content_id < 10 ? '00' : (item.content_id < 100 ? '0' : '')) + item.content_id) }}
            </span>
            @if (item.status === 'Published') {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> PUBLISHED &amp; LIVE
              </span>
            } @else if (item.status === 'In Review' || item.status === 'Draft') {
              <span class="status-pill pending text-xs px-3 py-1">
                <i class="mi text-sm">schedule</i> {{ item.status }}
              </span>
            } @else {
              <span class="status-pill inactive text-xs px-3 py-1">
                <i class="mi text-sm">block</i> {{ item.status }}
              </span>
            }
          </div>

          <!-- 4 Fullscreen Metric Cards (Telemetry) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">{{ item.impressions ? (item.impressions | number) : '0' }}</div>
                <div class="kpi-card-lbl">Total Impressions</div>
              </div>
              <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
                <i class="mi text-2xl">visibility</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400">
                  {{ item.reach ? (item.reach | number) : '0' }}
                </div>
                <div class="kpi-card-lbl">Audience Reach</div>
              </div>
              <div class="kpi-icon-badge bg-cyan-50 dark:bg-[#122e38] text-cyan-600 dark:text-cyan-400">
                <i class="mi text-2xl">groups</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                  {{ item.clicks ? (item.clicks | number) : '0' }}
                </div>
                <div class="kpi-card-lbl">Inbound Clicks</div>
              </div>
              <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
                <i class="mi text-2xl">ads_click</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black text-[var(--ok)]">
                  {{ item.engagements ? (item.engagements | number) : '0' }}
                </div>
                <div class="kpi-card-lbl">Total Engagements</div>
              </div>
              <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
                <i class="mi text-2xl">thumb_up</i>
              </div>
            </div>
          </div>

          <!-- Main 2-Column Fullscreen Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Content Details & Brief -->
            <div class="lg:col-span-2 space-y-6">
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">subject</i> Content Topic &amp; Editorial Brief
                </h3>
                <p class="text-sm text-[var(--hd)] leading-relaxed bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] font-medium">
                  {{ item.topic || 'No detailed editorial brief provided.' }}
                </p>
              </div>

              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">tune</i> Digital Distribution &amp; Asset Specs
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Target Platform</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-[var(--pr)]">public</i> {{ item.platform }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Asset Format</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-purple-600">article</i> {{ item.content_format }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Creative / Design Source</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-amber-600">palette</i> {{ item.design_source || 'Internal Marketing' }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Engagement Rate</span>
                    <b class="text-sm text-[var(--ok)] flex items-center gap-1.5">
                      <i class="mi text-base">insights</i>
                      {{ item.impressions ? ((item.engagements || 0) / item.impressions * 100 | number:'1.1-2') + '%' : '0.0%' }}
                    </b>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right 1 Col: Publishing Schedule & Governance -->
            <div class="space-y-6">
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">schedule</i> Publishing Timeline
                </h3>
                <div class="space-y-3.5">
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Planned Publish Date</span>
                    <b class="text-xs font-mono text-[var(--hd)]">{{ item.planned_publish_date }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Actual Publish Date</span>
                    <b class="text-xs font-mono" [class.text-[var(--ok)]]="item.actual_publish_date" [class.text-[var(--mu)]]="!item.actual_publish_date">
                      {{ item.actual_publish_date || 'Pending Live' }}
                    </b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Author / Copywriter</span>
                    <b class="text-xs text-[var(--hd)]">{{ item.drafted_by || 'Staff' }}</b>
                  </div>
                  <div class="flex items-center justify-between py-2 border-b border-[var(--ln)]">
                    <span class="text-xs text-[var(--mu)]">Current Status</span>
                    <span class="status-pill text-xs" [ngClass]="item.status === 'Published' ? 'active' : 'pending'">
                      {{ item.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Actions Panel -->
              <div class="erp-card-container p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-slate-900/40">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--hd)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">bolt</i> Quick Operations
                </h3>
                <p class="text-xs text-[var(--tx)] mb-4 leading-relaxed">
                  Record new campaign analytics or adjust publication status directly for this asset.
                </p>
                <div class="flex flex-col gap-2">
                  <button (click)="openMetricsDrawer(item)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <i class="mi text-base">tune</i> Update Live Telemetry
                  </button>
                  <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-medium flex items-center justify-center gap-1.5">
                    <i class="mi text-base">arrow_back</i> Back to Content List
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
        <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Content Items</h2>
        <p class="text-xs text-[var(--tx)] mt-1">
          Digital publication assets by channel, format, engagement metrics, and review status.
        </p>
      </div>

      <!-- 3 KPI Metric Cards matching Image 1 & 2 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Content Items Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ totalCount() }}</div>
            <div class="kpi-card-lbl">Total content items</div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- Published & Active Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ publishedCount() }}</div>
            <div class="kpi-card-lbl">Published &amp; Live</div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">check_circle</i>
          </div>
        </div>

        <!-- In Review & Draft Card -->
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
                #cntSearchInput
                [value]="searchQuery()" 
                (input)="onSearch($event)" 
                (keydown.escape)="clearSearch()"
                placeholder="Name, type, effective period..." />
              @if (searchQuery()) {
                <button type="button" (click)="clearSearch()" class="erp-search-clear mr-1" title="Clear search">
                  <i class="mi text-sm">close</i>
                </button>
              }
              <button type="button" (click)="cntSearchInput.focus()" class="erp-search-btn pr-3" title="Search">
                <i class="mi text-lg">search</i>
              </button>
            </div>

            <div class="ff min-w-[150px]">
              <label>Platform</label>
              <select [value]="selectedPlatform()" (change)="onPlatformChange($event)">
                <option value="All">All</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Website">Website</option>
                <option value="Email">Email</option>
                <option value="Other social media">Other Social</option>
              </select>
            </div>

            <label class="toggle-switch">
              <div class="toggle-track" [class.active]="includeCancelled()" (click)="toggleIncludeCancelled()">
                <div class="toggle-thumb"></div>
              </div>
              <span>Include archived</span>
            </label>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            <!-- Opens Right Side Drawer matching Image 1 -->
            <button (click)="openDrawer()" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
              <i class="mi text-base">add</i> New content item
            </button>

            <button (click)="refresh()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Refresh">
              <i class="mi text-base text-[var(--mu)]">refresh</i> Refresh
            </button>
          </div>

        </div>

        <!-- NESTED Table View matching Screenshot 3a2c9fd4 -->
        @if (paginatedItems().length > 0) {
          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>CONTENT TITLE</th>
                  <th>PLATFORM</th>
                  <th>FORMAT</th>
                  <th>PUBLISH DATE</th>
                  <th>IMPRESSIONS</th>
                  <th>ENGAGEMENTS</th>
                  <th>STATUS</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (item of paginatedItems(); track item.content_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs">{{ item.content_code || ('CNT-2026-' + (item.content_id < 10 ? '00' : (item.content_id < 100 ? '0' : '')) + item.content_id) }}</b>
                    </td>
                    <td>
                      <span class="text-[var(--hd)] hover:text-[var(--pr)] cursor-pointer text-sm font-semibold whitespace-nowrap" (click)="openDetailDrawer(item)">
                        {{ item.title }}
                      </span>
                    </td>
                    <td>
                      <span class="cat-pill">{{ item.platform }}</span>
                    </td>
                    <td class="text-xs text-[var(--tx)]">
                      {{ item.content_format }}
                    </td>
                    <td class="text-xs text-[var(--tx)] whitespace-nowrap">
                      {{ item.actual_publish_date || item.planned_publish_date }}
                    </td>
                    <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                      {{ item.impressions ? (item.impressions | number) : '—' }}
                    </td>
                    <td class="text-xs font-semibold text-[var(--ok)] whitespace-nowrap">
                      {{ item.engagements ? (item.engagements | number) : '—' }}
                    </td>
                    <td>
                      @if (item.status === 'Published' || item.status === 'Approved') {
                        <span class="status-pill active">
                          <i class="mi text-sm">check_circle</i> ACTIVE
                        </span>
                      } @else if (item.status === 'Draft' || item.status === 'In Review') {
                        <span class="status-pill pending">
                          <i class="mi text-sm">schedule</i> {{ item.status }}
                        </span>
                      } @else {
                        <span class="status-pill inactive">
                          <i class="mi text-sm">block</i> {{ item.status }}
                        </span>
                      }
                    </td>

                    <!-- 3-Dots Action Cell -->
                    <td class="text-right relative whitespace-nowrap" (click)="$event.stopPropagation()">
                      <button 
                        (click)="toggleMenu(item.content_id, $event)" 
                        class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
                        title="Row Actions"
                        aria-label="Actions">
                        <i class="mi text-xl text-[var(--mu)] hover:text-[var(--hd)]">more_vert</i>
                      </button>

                      @if (activeMenuId() === item.content_id) {
                        <div class="action-popover">
                          <button (click)="openDetailDrawer(item)" class="action-item">
                            <i class="mi">visibility</i>
                            <span>View Details</span>
                          </button>

                          <button (click)="openMetricsDrawer(item)" class="action-item">
                            <i class="mi text-blue-600">insights</i>
                            <span>Update Metrics</span>
                          </button>

                          @if (item.status === 'Draft') {
                            <button (click)="changeStatus(item, 'In Review')" class="action-item">
                              <i class="mi text-blue-600">send</i>
                              <span>Submit for Review</span>
                            </button>
                          }

                          @if (item.status === 'In Review') {
                            <button (click)="changeStatus(item, 'Approved')" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">check_circle</i>
                              <span>Approve Content</span>
                            </button>
                          }

                          @if (item.status === 'Approved') {
                            <button (click)="changeStatus(item, 'Published')" class="action-item text-purple-600">
                              <i class="mi text-purple-600">publish</i>
                              <span>Publish Live</span>
                            </button>
                          }

                          <div class="action-divider"></div>

                          <button (click)="deleteItem(item)" class="action-item danger">
                            <i class="mi">delete</i>
                            <span>Delete Content</span>
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
              <i class="mi text-3xl">article</i>
            </div>
            <b class="text-base font-bold text-[var(--hd)] mb-1">No Data Found</b>
            <p class="text-xs text-[var(--mu)]">No content items match your filters.</p>
          </div>
        }

        <!-- Pagination Controls matching Image 2 & 31662825 with Popover -->
        <app-table-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="filteredItems().length"
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
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Add content item</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Content Item</h2>
                <p class="text-xs text-[var(--tx)] mt-1 max-w-md">
                  Specify digital publication details, format, platform, and author.
                </p>
              </div>
              <button (click)="closeDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="contentForm" (ngSubmit)="onCreateSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div class="drawer-field has-floating-label">
                <label>Content Title *</label>
                <input formControlName="title" placeholder="e.g. Q4 Modern Grain Processing Whitepaper" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Platform *</label>
                  <select formControlName="platform">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Website">Website</option>
                    <option value="Email">Email</option>
                    <option value="Other social media">Other Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Content Format *</label>
                  <select formControlName="content_format">
                    <option value="Article">Article</option>
                    <option value="Post">Post</option>
                    <option value="Graphic">Graphic</option>
                    <option value="Video">Video</option>
                    <option value="Newsletter">Newsletter</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Planned publish date*</label>
                  <input type="date" formControlName="planned_publish_date" />
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Author *</label>
                  <input formControlName="drafted_by" placeholder="e.g. Content Lead" />
                </div>
              </div>

              <div class="drawer-field has-floating-label">
                <label>Topic &amp; Summary *</label>
                <textarea formControlName="topic" placeholder="Summary brief of narrative, targets, and call to action..."></textarea>
              </div>

            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <span class="text-xs text-[var(--mu)]">Save changes</span>
              <div class="flex items-center gap-2.5">
                <button (click)="closeDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
                <button (click)="onCreateSubmit()" [disabled]="contentForm.invalid" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
              </div>
            </div>

          </div>
        </div>
      }



      <!-- =====================================================================
           RIGHT SIDE DRAWER (UPDATE METRICS)
           ===================================================================== -->
      @if (showMetricsDrawer()) {
        <div class="drawer-backdrop" (click)="closeMetricsDrawer()">
          <div class="drawer-panel max-w-md" (click)="$event.stopPropagation()">
            
            <div class="p-6 border-b border-[var(--ln)] flex items-start justify-between">
              <div>
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Telemetry metrics</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Update Metrics</h2>
              </div>
              <button (click)="closeMetricsDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="metricsForm" (ngSubmit)="onMetricsSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field">
                  <label class="text-[11px] text-[var(--mu)] px-3 pt-2 block font-medium">Impressions</label>
                  <input type="number" formControlName="impressions" class="!pt-1" />
                </div>
                <div class="drawer-field">
                  <label class="text-[11px] text-[var(--mu)] px-3 pt-2 block font-medium">Reach</label>
                  <input type="number" formControlName="reach" class="!pt-1" />
                </div>
                <div class="drawer-field">
                  <label class="text-[11px] text-[var(--mu)] px-3 pt-2 block font-medium">Clicks</label>
                  <input type="number" formControlName="clicks" class="!pt-1" />
                </div>
                <div class="drawer-field">
                  <label class="text-[11px] text-[var(--mu)] px-3 pt-2 block font-medium">Engagements</label>
                  <input type="number" formControlName="engagements" class="!pt-1" />
                </div>
              </div>
            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <button (click)="closeMetricsDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
              <button (click)="onMetricsSubmit()" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class ContentItemsComponent {
  private marketingService = inject(MarketingService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  contentItems = this.marketingService.contentItems;

  searchQuery = signal<string>('');
  selectedPlatform = signal<string>('All');
  includeCancelled = signal<boolean>(false);

  // Pagination state matching Image 2
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Popover 3-dots active menu ID
  activeMenuId = signal<number | null>(null);

  // Side Drawer signals matching Image 1
  showCreateDrawer = signal<boolean>(false);
  selectedDetailItem = signal<ContentItem | null>(null);
  showMetricsDrawer = signal<boolean>(false);
  selectedItemForMetrics = signal<ContentItem | null>(null);

  // Computed KPI Metrics matching Image 1 & 2
  totalCount = computed(() => this.contentItems().length);
  publishedCount = computed(() => this.contentItems().filter(c => c.status === 'Published').length);
  pendingCount = computed(() => this.contentItems().filter(c => c.status !== 'Published').length);

  contentForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    platform: ['LinkedIn', Validators.required],
    content_format: ['Article', Validators.required],
    planned_publish_date: [new Date().toISOString().slice(0, 10), Validators.required],
    drafted_by: ['Hana Girma', Validators.required],
    topic: ['']
  });

  metricsForm: FormGroup = this.fb.group({
    impressions: [0, [Validators.min(0)]],
    reach: [0, [Validators.min(0)]],
    clicks: [0, [Validators.min(0)]],
    engagements: [0, [Validators.min(0)]]
  });

  filteredItems = computed(() => {
    let list = this.contentItems();
    if (!this.includeCancelled()) {
      list = list.filter(c => c.status !== 'Cancelled');
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.content_code && item.content_code.toLowerCase().includes(q)) ||
        (item.topic && item.topic.toLowerCase().includes(q)) ||
        item.platform.toLowerCase().includes(q) ||
        item.content_format.toLowerCase().includes(q) ||
        (item.drafted_by && item.drafted_by.toLowerCase().includes(q)) ||
        item.status.toLowerCase().includes(q)
      );
    }
    if (this.selectedPlatform() !== 'All') {
      list = list.filter(item => item.platform === this.selectedPlatform());
    }
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize())));

  paginatedItems = computed(() => {
    const list = this.filteredItems();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginationText = computed(() => {
    const total = this.filteredItems().length;
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

  onPlatformChange(event: Event): void {
    this.selectedPlatform.set((event.target as HTMLSelectElement).value);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  toggleIncludeCancelled(): void {
    this.includeCancelled.update(v => !v);
    this.currentPage.set(1);
  }

  refresh(): void {
    this.toast.info('Content items refreshed.');
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
    this.contentForm.reset({
      title: '',
      platform: 'LinkedIn',
      content_format: 'Article',
      planned_publish_date: new Date().toISOString().slice(0, 10),
      drafted_by: 'Hana Girma',
      topic: ''
    });
    this.showCreateDrawer.set(true);
  }

  closeDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  openDetailDrawer(item: ContentItem): void {
    this.closeActiveMenu();
    this.selectedDetailItem.set(item);
  }

  closeDetailDrawer(): void {
    this.selectedDetailItem.set(null);
  }

  openMetricsDrawer(item: ContentItem): void {
    this.closeActiveMenu();
    this.selectedItemForMetrics.set(item);
    this.metricsForm.patchValue({
      impressions: item.impressions || 0,
      reach: item.reach || 0,
      clicks: item.clicks || 0,
      engagements: item.engagements || 0
    });
    this.showMetricsDrawer.set(true);
  }

  closeMetricsDrawer(): void {
    this.showMetricsDrawer.set(false);
    this.selectedItemForMetrics.set(null);
  }

  onCreateSubmit(): void {
    if (this.contentForm.invalid) return;
    const formVal = this.contentForm.value;
    this.marketingService.createContentItem({
      activity_id: 1,
      title: formVal.title,
      platform: formVal.platform,
      content_format: formVal.content_format,
      planned_publish_date: formVal.planned_publish_date,
      design_source: 'Internal',
      drafted_by: formVal.drafted_by,
      topic: formVal.topic,
      status: 'Draft'
    });
    this.toast.success(`Content "${formVal.title}" saved.`);
    this.closeDrawer();
  }

  onMetricsSubmit(): void {
    const item = this.selectedItemForMetrics();
    if (!item) return;
    this.marketingService.updateContentMetrics(item.content_id, this.metricsForm.value);
    this.toast.success(`Metrics saved.`);
    this.closeMetricsDrawer();
  }

  changeStatus(item: ContentItem, newStatus: ContentStatus): void {
    this.closeActiveMenu();
    this.marketingService.updateContentStatus(item.content_id, newStatus);
    this.toast.info(`Status updated to ${newStatus}.`);
  }

  deleteItem(item: ContentItem): void {
    this.closeActiveMenu();
    if (confirm(`Delete content item "${item.title}"?`)) {
      this.marketingService.deleteContentItem(item.content_id);
      this.toast.info(`Deleted content item.`);
    }
  }
}
