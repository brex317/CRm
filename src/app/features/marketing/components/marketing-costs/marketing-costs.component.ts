import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MarketingService } from '../../services/marketing.service';
import { MarketingCost, CostType, CostStatus } from '../../models/marketing-cost.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';
import { TablePaginationComponent } from '../../../../shared/components/table-pagination/table-pagination.component';

@Component({
  selector: 'app-marketing-costs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablePaginationComponent],
  template: `
    <div class="space-y-6" (click)="closeActiveMenu()">
      
      <!-- =====================================================================
           FULLSCREEN COST DETAIL VIEW (Replaces cramped drawer)
           ===================================================================== -->
      @if (selectedDetailCost(); as cost) {
        <div class="space-y-6 animate-fadeIn">
          
          <!-- Top Action Bar & Back Navigation -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-3">
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <i class="mi text-base">arrow_back</i> Back to Marketing Costs
              </button>
              <div class="h-6 w-px bg-[var(--ln)]"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[11px] font-bold tracking-wider text-[var(--mu)] uppercase">CRM / MARKETING COSTS</span>
                  <span class="text-xs font-mono font-bold text-[var(--pr)]">{{ cost.cost_code || ('CST-2026-' + (cost.cost_id < 10 ? '00' : (cost.cost_id < 100 ? '0' : '')) + cost.cost_id) }}</span>
                </div>
                <h1 class="text-xl sm:text-2xl font-black text-[var(--hd)] tracking-tight mt-0.5">{{ cost.description }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              @if (cost.payment_status === 'Not Submitted') {
                <button (click)="submitToFinance(cost)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm">
                  <i class="mi text-base">account_balance</i> Submit to Finance
                </button>
              }
              @if (cost.payment_status === 'Submitted to Finance') {
                <button (click)="markPaid(cost)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                  <i class="mi text-base">check_circle</i> Mark Paid
                </button>
              }
              <button (click)="deleteCost(cost)" class="btn bo text-xs py-2 px-3.5 rounded-xl font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5" title="Delete this cost">
                <i class="mi text-base">delete</i> Delete Cost
              </button>
              <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Close Detail View">
                <i class="mi text-base">close</i> Close
              </button>
            </div>
          </div>

          <!-- Badges & Status Banner -->
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="cat-pill text-xs font-bold px-3 py-1">{{ cost.cost_type }}</span>
            <span class="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--hd)] border border-[var(--ln)]">
              {{ cost.cost_code || ('CST-2026-' + (cost.cost_id < 10 ? '00' : (cost.cost_id < 100 ? '0' : '')) + cost.cost_id) }}
            </span>
            @if (cost.payment_status === 'Paid') {
              <span class="status-pill active text-xs px-3 py-1">
                <i class="mi text-sm">check_circle</i> PAID &amp; POSTED
              </span>
            } @else if (cost.payment_status === 'Submitted to Finance') {
              <span class="status-pill active text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                <i class="mi text-sm">hourglass_top</i> SUBMITTED TO FINANCE
              </span>
            } @else {
              <span class="status-pill pending text-xs px-3 py-1">
                <i class="mi text-sm">schedule</i> {{ cost.payment_status }}
              </span>
            }
          </div>

          <!-- 4 Fullscreen Metric Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">ETB {{ cost.amount | number }}</div>
                <div class="kpi-card-lbl">Voucher Incurred Amount</div>
              </div>
              <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
                <i class="mi text-2xl">account_balance_wallet</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black font-mono">{{ cost.currency || 'ETB' }}</div>
                <div class="kpi-card-lbl">Billing Currency</div>
              </div>
              <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
                <i class="mi text-2xl">monetization_on</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black" [class.text-[var(--ok)]]="cost.payment_status === 'Paid'">
                  {{ cost.payment_status }}
                </div>
                <div class="kpi-card-lbl">Settlement Status</div>
              </div>
              <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
                <i class="mi text-2xl">verified</i>
              </div>
            </div>

            <div class="kpi-card">
              <div>
                <div class="kpi-card-val text-xl sm:text-2xl font-black">{{ cost.cost_type }}</div>
                <div class="kpi-card-lbl">Expense Classification</div>
              </div>
              <div class="kpi-icon-badge bg-purple-50 dark:bg-[#2a1a4a] text-purple-600 dark:text-purple-400">
                <i class="mi text-2xl">category</i>
              </div>
            </div>
          </div>

          <!-- Main 2-Column Fullscreen Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Description & Audit -->
            <div class="lg:col-span-2 space-y-6">
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">description</i> Expenditure Description &amp; Scope
                </h3>
                <p class="text-sm text-[var(--hd)] leading-relaxed bg-[var(--chip-bg)] p-4 rounded-xl border border-[var(--ln)] font-medium">
                  {{ cost.description }}
                </p>
              </div>

              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">receipt_long</i> Supplier Invoice &amp; Reference Audit
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Contractor / Vendor</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-[var(--pr)]">storefront</i> {{ cost.vendor_name || 'Direct Procurement / Internal' }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Invoice / Reference No</span>
                    <b class="text-sm font-mono text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-purple-600">tag</i> {{ cost.reference_no || 'Pending Receipt' }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Incurred / Invoice Date</span>
                    <b class="text-sm font-mono text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-amber-600">calendar_month</i> {{ cost.cost_date }}
                    </b>
                  </div>
                  <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Cost Nature</span>
                    <b class="text-sm text-[var(--hd)] flex items-center gap-1.5">
                      <i class="mi text-base text-emerald-600">check_circle</i> {{ cost.cost_status }} Expense
                    </b>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right 1 Col: Linked Initiative & Operations -->
            <div class="space-y-6">
              <div class="erp-card-container p-6">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--mu)] mb-4 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">campaign</i> Tied Marketing Initiative
                </h3>
                <div class="p-4 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block mb-1">Marketing Activity</span>
                  <b class="text-sm text-[var(--hd)] block">{{ cost.activity_title || 'General Marketing Campaign' }}</b>
                  <div class="mt-2 text-xs text-[var(--tx)]">
                    Cost Center: <span class="font-bold text-[var(--hd)]">CC-MKTG-2026</span>
                  </div>
                </div>
              </div>

              <!-- Quick Settlement Operations -->
              <div class="erp-card-container p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-slate-900/40">
                <h3 class="text-xs font-bold uppercase tracking-wider text-[var(--hd)] mb-2 flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">account_balance</i> Financial Operations
                </h3>
                <p class="text-xs text-[var(--tx)] mb-4 leading-relaxed">
                  Update the payment clearance status or return to the cost allocation ledger.
                </p>
                <div class="flex flex-col gap-2">
                  @if (cost.payment_status === 'Not Submitted') {
                    <button (click)="submitToFinance(cost)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm">
                      <i class="mi text-base">account_balance</i> Submit to Finance
                    </button>
                  }
                  @if (cost.payment_status === 'Submitted to Finance') {
                    <button (click)="markPaid(cost)" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                      <i class="mi text-base">payments</i> Confirm Payment &amp; Mark Paid
                    </button>
                  }
                  <button (click)="closeDetailDrawer()" class="btn bo text-xs py-2 px-3.5 rounded-xl font-medium flex items-center justify-center gap-1.5">
                    <i class="mi text-base">arrow_back</i> Back to Costs List
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
        <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Marketing Costs</h2>
        <p class="text-xs text-[var(--tx)] mt-1">
          Daily expenditure tracking by cost category, vendor invoice, and finance payment status.
        </p>
      </div>

      <!-- 3 KPI Metric Cards matching Image 1 & 2 -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Cost Lines Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ totalCount() }}</div>
            <div class="kpi-card-lbl">Total cost lines</div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- Paid / Actual Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ paidCount() }}</div>
            <div class="kpi-card-lbl">Paid &amp; Posted</div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">check_circle</i>
          </div>
        </div>

        <!-- Pending Card -->
        <div class="kpi-card">
          <div>
            <div class="kpi-card-val">{{ pendingCount() }}</div>
            <div class="kpi-card-lbl">Unpaid &amp; Estimated</div>
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
                #costSearchInput
                [value]="searchQuery()" 
                (input)="onSearch($event)" 
                (keydown.escape)="clearSearch()"
                placeholder="Name, type, effective period..." />
              @if (searchQuery()) {
                <button type="button" (click)="clearSearch()" class="erp-search-clear mr-1" title="Clear search">
                  <i class="mi text-sm">close</i>
                </button>
              }
              <button type="button" (click)="costSearchInput.focus()" class="erp-search-btn pr-3" title="Search">
                <i class="mi text-lg">search</i>
              </button>
            </div>

            <div class="ff min-w-[150px]">
              <label>Cost Type</label>
              <select [value]="selectedType()" (change)="onTypeChange($event)">
                <option value="All">All</option>
                <option value="Venue">Venue</option>
                <option value="Materials">Materials</option>
                <option value="Facilitator">Facilitator</option>
                <option value="Booth">Booth</option>
                <option value="Design">Design</option>
                <option value="Catering">Catering</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

            <label class="toggle-switch">
              <div class="toggle-track" [class.active]="includeEstimated()" (click)="toggleIncludeEstimated()">
                <div class="toggle-thumb"></div>
              </div>
              <span>Include estimated</span>
            </label>
          </div>

          <div class="flex items-center gap-2.5 flex-shrink-0">
            <!-- Opens Right Side Drawer matching Image 1 -->
            <button (click)="openDrawer()" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold flex items-center gap-1.5">
              <i class="mi text-base">add</i> New cost line
            </button>

            <button (click)="refresh()" class="btn bo text-xs py-2 px-3 rounded-xl font-medium" title="Refresh">
              <i class="mi text-base text-[var(--mu)]">refresh</i> Refresh
            </button>
          </div>

        </div>

        <!-- NESTED Table View matching Screenshot 3a2c9fd4 -->
        @if (paginatedCosts().length > 0) {
          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>DESCRIPTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>VENDOR</th>
                  <th>STATUS</th>
                  <th>PAYMENT</th>
                  <th class="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                @for (cost of paginatedCosts(); track cost.cost_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs">{{ cost.cost_code || ('CST-2026-' + cost.cost_id) }}</b>
                    </td>
                    <td>
                      <span class="text-[var(--hd)] hover:text-[var(--pr)] cursor-pointer text-sm font-semibold whitespace-nowrap" (click)="openDetailDrawer(cost)">
                        {{ cost.description }}
                      </span>
                    </td>
                    <td>
                      <span class="cat-pill">{{ cost.cost_type }}</span>
                    </td>
                    <td class="text-xs text-[var(--tx)] whitespace-nowrap">{{ cost.cost_date }}</td>
                    <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                      ETB {{ cost.amount | number }}
                    </td>
                    <td class="text-xs text-[var(--hd)] font-medium whitespace-nowrap">
                      {{ cost.vendor_name || 'Direct / Internal' }}
                    </td>
                    <td>
                      <span class="cat-pill" [class.opacity-60]="cost.cost_status === 'Estimated'">
                        {{ cost.cost_status }}
                      </span>
                    </td>
                    <td>
                      @if (cost.payment_status === 'Paid') {
                        <span class="status-pill active">
                          <i class="mi text-sm">check_circle</i> PAID
                        </span>
                      } @else if (cost.payment_status === 'Submitted to Finance') {
                        <span class="status-pill pending">
                          <i class="mi text-sm">schedule</i> SUBMITTED
                        </span>
                      } @else {
                        <span class="status-pill inactive">
                          <i class="mi text-sm">block</i> UNPAID
                        </span>
                      }
                    </td>

                    <!-- 3-Dots Action Cell -->
                    <td class="text-right relative whitespace-nowrap" (click)="$event.stopPropagation()">
                      <button 
                        (click)="toggleMenu(cost.cost_id, $event)" 
                        class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
                        title="Row Actions"
                        aria-label="Actions">
                        <i class="mi text-xl text-[var(--mu)] hover:text-[var(--hd)]">more_vert</i>
                      </button>

                      @if (activeMenuId() === cost.cost_id) {
                        <div class="action-popover">
                          <button (click)="openDetailDrawer(cost)" class="action-item">
                            <i class="mi">visibility</i>
                            <span>View Details</span>
                          </button>

                          @if (cost.payment_status === 'Not Submitted') {
                            <button (click)="submitToFinance(cost)" class="action-item">
                              <i class="mi text-blue-600">account_balance</i>
                              <span>Submit to Finance</span>
                            </button>
                          }

                          @if (cost.payment_status === 'Submitted to Finance') {
                            <button (click)="markPaid(cost)" class="action-item text-emerald-600 dark:text-emerald-400 font-semibold">
                              <i class="mi text-emerald-600">check_circle</i>
                              <span>Mark Paid</span>
                            </button>
                          }

                          <div class="action-divider"></div>

                          <button (click)="deleteCost(cost)" class="action-item danger">
                            <i class="mi">delete</i>
                            <span>Delete Cost</span>
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
              <i class="mi text-3xl">receipt_long</i>
            </div>
            <b class="text-base font-bold text-[var(--hd)] mb-1">No Data Found</b>
            <p class="text-xs text-[var(--mu)]">No cost lines match your filters.</p>
          </div>
        }

        <!-- Pagination Controls matching Image 2 & 31662825 with Popover -->
        <app-table-pagination
          [currentPage]="currentPage()"
          [pageSize]="pageSize()"
          [totalItems]="filteredCosts().length"
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
                <span class="text-xs font-semibold text-[var(--mu)] block mb-0.5">Add marketing cost</span>
                <h2 class="text-xl font-bold text-[var(--hd)] leading-tight">Cost Line</h2>
                <p class="text-xs text-[var(--tx)] mt-1 max-w-md">
                  Enter expenditure parameters, vendor reference, and amount.
                </p>
              </div>
              <button (click)="closeDrawer()" class="ib text-[var(--mu)] hover:text-[var(--hd)] -mt-1 -mr-2">
                <i class="mi text-xl">close</i>
              </button>
            </div>

            <form [formGroup]="costForm" (ngSubmit)="onCreateSubmit()" class="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div class="drawer-field has-floating-label">
                <label>Cost Description *</label>
                <input formControlName="description" placeholder="e.g. Venue Rental for Agro-Industrial Summit" />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Cost Type *</label>
                  <select formControlName="cost_type">
                    <option value="Venue">Venue</option>
                    <option value="Materials">Materials</option>
                    <option value="Facilitator">Facilitator</option>
                    <option value="Booth">Booth</option>
                    <option value="Design">Design</option>
                    <option value="Catering">Catering</option>
                    <option value="Travel">Travel</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Classification *</label>
                  <select formControlName="cost_status">
                    <option value="Actual">Actual</option>
                    <option value="Estimated">Estimated</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Amount (ETB) *</label>
                  <input type="number" formControlName="amount" placeholder="e.g. 50000" />
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Cost date*</label>
                  <input type="date" formControlName="cost_date" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="drawer-field has-floating-label">
                  <label>Vendor Name</label>
                  <input formControlName="vendor_name" placeholder="e.g. Millennium Hall Ltd" />
                </div>

                <div class="drawer-field has-floating-label">
                  <label>Invoice / Ref No</label>
                  <input formControlName="reference_no" placeholder="e.g. INV-2026-0042" />
                </div>
              </div>

            </form>

            <div class="p-4 border-t border-[var(--ln)] bg-[var(--sf)] flex items-center justify-between">
              <span class="text-xs text-[var(--mu)]">Save changes</span>
              <div class="flex items-center gap-2.5">
                <button (click)="closeDrawer()" class="btn bo text-xs py-2 px-4 rounded-xl">Cancel</button>
                <button (click)="onCreateSubmit()" [disabled]="costForm.invalid" class="btn bp text-xs py-2 px-5 rounded-xl font-bold">Save</button>
              </div>
            </div>

          </div>
        </div>
      }



    </div>
  `
})
export class MarketingCostsComponent {
  private marketingService = inject(MarketingService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);

  costs = this.marketingService.costs;

  searchQuery = signal<string>('');
  selectedType = signal<string>('All');
  includeEstimated = signal<boolean>(true);

  // Pagination state matching Image 2
  pageSize = signal<number>(10);
  currentPage = signal<number>(1);

  // Popover 3-dots active menu ID
  activeMenuId = signal<number | null>(null);

  // Side Drawer signals matching Image 1
  showCreateDrawer = signal<boolean>(false);
  selectedDetailCost = signal<MarketingCost | null>(null);

  // Computed KPI Metrics matching Image 1 & 2
  totalCount = computed(() => this.costs().length);
  paidCount = computed(() => this.costs().filter(c => c.payment_status === 'Paid').length);
  pendingCount = computed(() => this.costs().filter(c => c.payment_status !== 'Paid').length);

  costForm: FormGroup = this.fb.group({
    description: ['', Validators.required],
    cost_type: ['Venue', Validators.required],
    cost_status: ['Actual', Validators.required],
    amount: [50000, [Validators.required, Validators.min(1)]],
    cost_date: [new Date().toISOString().slice(0, 10), Validators.required],
    vendor_name: [''],
    reference_no: ['']
  });

  filteredCosts = computed(() => {
    let list = this.costs();
    if (!this.includeEstimated()) {
      list = list.filter(c => c.cost_status !== 'Estimated');
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        c.description.toLowerCase().includes(q) ||
        (c.cost_code && c.cost_code.toLowerCase().includes(q)) ||
        (c.vendor_name && c.vendor_name.toLowerCase().includes(q)) ||
        (c.reference_no && c.reference_no.toLowerCase().includes(q)) ||
        (c.activity_title && c.activity_title.toLowerCase().includes(q)) ||
        c.cost_type.toLowerCase().includes(q) ||
        c.cost_status.toLowerCase().includes(q) ||
        (c.payment_status && c.payment_status.toLowerCase().includes(q))
      );
    }
    if (this.selectedType() !== 'All') {
      list = list.filter(c => c.cost_type === this.selectedType());
    }
    return list;
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCosts().length / this.pageSize())));

  paginatedCosts = computed(() => {
    const list = this.filteredCosts();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  paginationText = computed(() => {
    const total = this.filteredCosts().length;
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

  toggleIncludeEstimated(): void {
    this.includeEstimated.update(v => !v);
    this.currentPage.set(1);
  }

  refresh(): void {
    this.toast.info('Marketing costs refreshed.');
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
    this.costForm.reset({
      description: '',
      cost_type: 'Venue',
      cost_status: 'Actual',
      amount: 50000,
      cost_date: new Date().toISOString().slice(0, 10),
      vendor_name: '',
      reference_no: ''
    });
    this.showCreateDrawer.set(true);
  }

  closeDrawer(): void {
    this.showCreateDrawer.set(false);
  }

  openDetailDrawer(cost: MarketingCost): void {
    this.closeActiveMenu();
    this.selectedDetailCost.set(cost);
  }

  closeDetailDrawer(): void {
    this.selectedDetailCost.set(null);
  }

  onCreateSubmit(): void {
    if (this.costForm.invalid) return;
    const formVal = this.costForm.value;
    this.marketingService.createCost({
      activity_id: 1,
      cost_type: formVal.cost_type as CostType,
      description: formVal.description,
      cost_status: formVal.cost_status as CostStatus,
      amount: Number(formVal.amount),
      currency: 'ETB',
      cost_date: formVal.cost_date,
      vendor_name: formVal.vendor_name,
      reference_no: formVal.reference_no,
      payment_status: 'Not Submitted',
      recorded_by: 'Berihu Esayas',
      activity_title: 'Ethiopian Food Manufacturing Industry Workshop'
    });
    this.toast.success(`Cost line saved.`);
    this.closeDrawer();
  }

  submitToFinance(cost: MarketingCost): void {
    this.closeActiveMenu();
    cost.payment_status = 'Submitted to Finance';
    this.toast.info(`Cost submitted to Finance.`);
  }

  markPaid(cost: MarketingCost): void {
    this.closeActiveMenu();
    cost.payment_status = 'Paid';
    this.toast.success(`Cost marked as Paid.`);
  }

  async deleteCost(cost: MarketingCost): Promise<void> {
    this.closeActiveMenu();
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Cost Entry',
      message: 'Do you want to delete this marketing cost record?',
      recordName: `${cost.cost_code} • ${cost.description} (ETB ${cost.amount.toLocaleString()})`,
      confirmText: 'Delete Cost',
      cancelText: 'Cancel'
    });
    if (confirmed) {
      this.marketingService.deleteCost(cost.cost_id);
      this.toast.info(`Deleted cost line.`);
      if (this.selectedDetailCost()?.cost_id === cost.cost_id) {
        this.closeDetailDrawer();
      }
    }
  }
}
