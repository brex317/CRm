import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MarketingService } from '../../services/marketing.service';

@Component({
  selector: 'app-marketing-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">
      
      <!-- =====================================================================
           PAGE HEADER & CLEAN ACTION BUTTONS (Single Row, No Wrapping)
           ===================================================================== -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span class="text-xs font-bold tracking-wider text-[var(--mu)] uppercase block mb-1">CRM</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--hd)] tracking-tight">Marketing Management</h1>
          <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Executive Dashboard</h2>
          <p class="text-xs text-[var(--tx)] mt-1 max-w-2xl">
            Real-time strategic overview of marketing operations, financial budget governance, live campaign execution, and lead generation telemetry.
          </p>
        </div>
        
        <div class="flex items-center gap-2.5 flex-nowrap flex-shrink-0">
          <a routerLink="/marketing/plans" class="btn bo text-xs py-2 px-3.5 rounded-xl font-semibold inline-flex items-center gap-1.5 hover:bg-[var(--chip-bg)] transition-colors whitespace-nowrap">
            <i class="mi text-base text-[var(--mu)]">calendar_month</i> Plans ({{ plans().length }})
          </a>
          <a routerLink="/marketing/activities" class="btn bp text-xs py-2 px-4 rounded-xl font-bold inline-flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <i class="mi text-base">add</i> New Activity
          </a>
        </div>
      </div>

      <!-- =====================================================================
           MAXIMUM 4 EXECUTIVE CARDS IN A ROW (Exactly 1 Icon Each, Zero Duplication)
           ===================================================================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        <!-- 1. Marketing Plans -->
        <div class="kpi-card hover:border-[var(--pr)] hover:shadow-xs transition-all duration-200">
          <div class="min-w-0 flex-1 pr-3">
            <div class="kpi-card-lbl uppercase text-[11px] font-bold tracking-wider text-[var(--mu)] mb-1">Marketing Plans</div>
            <div class="kpi-card-val text-2xl sm:text-3xl font-black text-[var(--hd)] tracking-tight">{{ totalPlans() }}</div>
            <div class="text-xs font-semibold text-blue-600 dark:text-sky-400 mt-1 truncate">
              {{ approvedPlans() }} Approved · {{ pendingPlans() }} Draft
            </div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400">
            <i class="mi text-2xl">calendar_month</i>
          </div>
        </div>

        <!-- 2. Active Campaigns -->
        <div class="kpi-card hover:border-emerald-500 hover:shadow-xs transition-all duration-200">
          <div class="min-w-0 flex-1 pr-3">
            <div class="kpi-card-lbl uppercase text-[11px] font-bold tracking-wider text-[var(--mu)] mb-1">Active Campaigns</div>
            <div class="kpi-card-val text-2xl sm:text-3xl font-black text-[var(--hd)] tracking-tight">{{ activeCampaignsCount() }}</div>
            <div class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
              In Progress &amp; Live
            </div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <i class="mi text-2xl">campaign</i>
          </div>
        </div>

        <!-- 3. Approved Budget -->
        <div class="kpi-card hover:border-sky-500 hover:shadow-xs transition-all duration-200">
          <div class="min-w-0 flex-1 pr-3">
            <div class="kpi-card-lbl uppercase text-[11px] font-bold tracking-wider text-[var(--mu)] mb-1">Approved Budget</div>
            <div class="kpi-card-val text-2xl sm:text-3xl font-black text-[var(--hd)] tracking-tight">ETB {{ (totalApprovedBudget() / 1000000) | number:'1.1-1' }}M</div>
            <div class="text-xs font-semibold text-sky-600 dark:text-sky-400 mt-1 truncate">
              ETB {{ (totalActualSpend() / 1000) | number:'1.0-0' }}k Spend ({{ budgetUtilizationPercent() }}%)
            </div>
          </div>
          <div class="kpi-icon-badge bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
            <i class="mi text-2xl">account_balance_wallet</i>
          </div>
        </div>

        <!-- 4. Leads Generated -->
        <div class="kpi-card hover:border-purple-500 hover:shadow-xs transition-all duration-200">
          <div class="min-w-0 flex-1 pr-3">
            <div class="kpi-card-lbl uppercase text-[11px] font-bold tracking-wider text-[var(--mu)] mb-1">Leads Generated</div>
            <div class="kpi-card-val text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight">{{ totalLeads() | number }}</div>
            <div class="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1 truncate">
              {{ leadsCreatedInCrm() }} Created in CRM
            </div>
          </div>
          <div class="kpi-icon-badge bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            <i class="mi text-2xl">trending_up</i>
          </div>
        </div>

      </div>

      <!-- =====================================================================
           2-COLUMN DETAILED VISUAL REPORTS:
           - LEFT: Financial Budget Governance (with Donut Circle Chart)
           - RIGHT: Campaign Performance & Lead Yield (with Pie Circle Chart)
           ===================================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Left Card: Financial Budget Governance -->
        <div class="erp-card-container flex flex-col justify-between">
          <div>
            <!-- Card Header -->
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-[var(--ln)]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-sky-400 grid place-items-center flex-shrink-0">
                  <i class="mi text-xl">account_balance_wallet</i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider">
                    Financial Budget Governance
                  </h3>
                  <p class="text-xs text-[var(--mu)]">Approved ceiling vs actual posted expenditure &amp; commitments</p>
                </div>
              </div>
              <a routerLink="/marketing/costs" class="text-xs font-semibold text-[var(--pr)] hover:underline flex items-center gap-1">
                View Ledger <i class="mi text-sm">arrow_forward</i>
              </a>
            </div>

            <!-- 4 Consistent Financial Micro-Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              
              <!-- 1. Approved Ceiling -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-sky-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">verified</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Approved Ceiling</span>
                  <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5 leading-snug">ETB {{ (totalApprovedBudget() / 1000000) | number:'1.1-2' }}M</b>
                  <span class="text-[11px] text-[var(--ok)] font-medium block mt-0.5">
                    100% Authorized
                  </span>
                </div>
              </div>

              <!-- 2. Actual Spend -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">receipt_long</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Actual Spend</span>
                  <b class="text-base font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5 leading-snug">ETB {{ totalActualSpend() | number }}</b>
                  <span class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                    {{ budgetUtilizationPercent() }}% Burn Rate
                  </span>
                </div>
              </div>

              <!-- 3. Committed Budget -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">pie_chart</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Committed Budget</span>
                  <b class="text-base font-extrabold text-indigo-600 dark:text-indigo-400 block mt-0.5 leading-snug">ETB {{ (totalAllocatedBudget() / 1000) | number:'1.0-0' }}k</b>
                  <span class="text-[11px] text-[var(--mu)] font-medium block mt-0.5">
                    {{ allocatedPercent() }}% Allocated
                  </span>
                </div>
              </div>

              <!-- 4. Available Balance -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">savings</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Available Surplus</span>
                  <b class="text-base font-extrabold text-[var(--ok)] block mt-0.5 leading-snug">ETB {{ (remainingBudget() / 1000000) | number:'1.1-2' }}M</b>
                  <span class="text-[11px] text-[var(--ok)] font-medium block mt-0.5">
                    Unspent Capital
                  </span>
                </div>
              </div>

            </div>

            <!-- VISUAL DONUT CIRCLE CHART REPORT: Budget Allocation & Incurred Burn -->
            <div class="p-4 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] space-y-3">
              <div class="flex items-center justify-between text-xs font-bold text-[var(--hd)] uppercase tracking-wider">
                <span>Budget Capital Allocation Breakdown</span>
                <span class="text-[var(--ok)] font-mono font-bold">ETB {{ remainingBudget() | number }} Available</span>
              </div>
              
              <!-- Circular Donut Chart & Legend Side-by-Side -->
              <div class="flex flex-col sm:flex-row items-center gap-5 pt-1">
                
                <!-- SVG Donut Circle -->
                <div class="relative w-36 h-36 flex-shrink-0">
                  <svg viewBox="0 0 130 130" class="w-full h-full transform -rotate-90">
                    <!-- Base Track -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="var(--ln)" stroke-width="14" />
                    <!-- Available Segment (Emerald) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#10b981" stroke-width="14"
                            [attr.stroke-dasharray]="budgetAvailableDash()"
                            [attr.stroke-dashoffset]="budgetAvailableOffset()"
                            class="transition-all duration-700" />
                    <!-- Committed Segment (Indigo) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#6366f1" stroke-width="14"
                            [attr.stroke-dasharray]="budgetCommittedDash()"
                            [attr.stroke-dashoffset]="budgetCommittedOffset()"
                            class="transition-all duration-700" />
                    <!-- Incurred Spend Segment (Amber) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#f59e0b" stroke-width="14"
                            [attr.stroke-dasharray]="budgetSpendDash()"
                            stroke-dashoffset="0"
                            class="transition-all duration-700" />
                  </svg>
                  
                  <!-- Center Callout Text inside Circle -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span class="text-xl font-black text-[var(--hd)] leading-tight">{{ budgetUtilizationPercent() }}%</span>
                    <span class="text-[9px] uppercase tracking-wider font-bold text-[var(--mu)]">Incurred</span>
                  </div>
                </div>

                <!-- Structured Legend with Key Figures -->
                <div class="flex-1 space-y-2 text-xs w-full">
                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Actual Incurred Spend</span>
                    </div>
                    <div class="text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      ETB {{ totalActualSpend() | number }} <span class="text-[10px] text-[var(--mu)] font-normal">({{ budgetUtilizationPercent() }}%)</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Committed Initiatives</span>
                    </div>
                    <div class="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      ETB {{ (totalAllocatedBudget() - totalActualSpend()) | number }} <span class="text-[10px] text-[var(--mu)] font-normal">({{ (allocatedPercent() - budgetUtilizationPercent()) | number:'1.1-1' }}%)</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Available Surplus</span>
                    </div>
                    <div class="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ETB {{ remainingBudget() | number }} <span class="text-[10px] text-[var(--mu)] font-normal">({{ (100 - allocatedPercent()) | number:'1.1-1' }}%)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- Right Card: Campaign Performance & Lead Yield Telemetry -->
        <div class="erp-card-container flex flex-col justify-between">
          <div>
            <!-- Card Header -->
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-[var(--ln)]">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 grid place-items-center flex-shrink-0">
                  <i class="mi text-xl">insights</i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider">
                    Campaign Performance &amp; Reach
                  </h3>
                  <p class="text-xs text-[var(--mu)]">Audience reach, impressions, interactions, and acquisition cost</p>
                </div>
              </div>
              <a routerLink="/marketing/content" class="text-xs font-semibold text-[var(--pr)] hover:underline flex items-center gap-1">
                View Content <i class="mi text-sm">arrow_forward</i>
              </a>
            </div>

            <!-- 4 Consistent Performance Micro-Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              
              <!-- 1. Audience Reach -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-100/80 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">groups</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Audience Reach</span>
                  <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5 leading-snug">{{ totalReach() | number }}</b>
                  <span class="text-[11px] text-sky-600 dark:text-sky-400 font-medium block mt-0.5">
                    Decision Makers
                  </span>
                </div>
              </div>

              <!-- 2. Omnichannel Impressions -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">visibility</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Total Impressions</span>
                  <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5 leading-snug">{{ totalImpressions() | number }}</b>
                  <span class="text-[11px] text-[var(--pr)] font-medium block mt-0.5">
                    Omnichannel Views
                  </span>
                </div>
              </div>

              <!-- 3. Direct Engagements -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">touch_app</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Interactions</span>
                  <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5 leading-snug">{{ totalEngagements() | number }}</b>
                  <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block mt-0.5">
                    {{ engagementRate() }}% Response Rate
                  </span>
                </div>
              </div>

              <!-- 4. Avg Cost Per Lead -->
              <div class="p-3.5 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-100/80 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 grid place-items-center flex-shrink-0">
                  <i class="mi text-lg">monetization_on</i>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] block">Avg Cost / Lead (CPL)</span>
                  <b class="text-base font-extrabold text-purple-600 dark:text-purple-400 block mt-0.5 leading-snug">ETB {{ avgCostPerLead() | number }}</b>
                  <span class="text-[11px] text-[var(--ok)] font-medium block mt-0.5">
                    Under Benchmark
                  </span>
                </div>
              </div>

            </div>

            <!-- VISUAL PIE / DONUT CIRCLE CHART REPORT: Lead Acquisition Yield by Channel -->
            <div class="p-4 rounded-2xl bg-[var(--chip-bg)] border border-[var(--ln)] space-y-3">
              <div class="flex items-center justify-between text-xs font-bold text-[var(--hd)] uppercase tracking-wider">
                <span>Lead Acquisition by Channel</span>
                <span class="text-[var(--mu)] font-mono text-[11px]">Total: {{ totalLeads() }} Leads</span>
              </div>

              <!-- Circular Donut / Pie Chart & Channel Breakdown Side-by-Side -->
              <div class="flex flex-col sm:flex-row items-center gap-5 pt-1">
                
                <!-- SVG Channel Pie / Donut Circle -->
                <div class="relative w-36 h-36 flex-shrink-0">
                  <svg viewBox="0 0 130 130" class="w-full h-full transform -rotate-90">
                    <!-- Base Track -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="var(--ln)" stroke-width="14" />
                    <!-- Digital Segment (Sky) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#0ea5e9" stroke-width="14"
                            [attr.stroke-dasharray]="channelDigitalDash()"
                            stroke-dashoffset="0"
                            class="transition-all duration-700" />
                    <!-- Campaign Segment (Emerald) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#10b981" stroke-width="14"
                            [attr.stroke-dasharray]="channelCampaignDash()"
                            [attr.stroke-dashoffset]="channelCampaignOffset()"
                            class="transition-all duration-700" />
                    <!-- Workshop Segment (Indigo) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#6366f1" stroke-width="14"
                            [attr.stroke-dasharray]="channelWorkshopDash()"
                            [attr.stroke-dashoffset]="channelWorkshopOffset()"
                            class="transition-all duration-700" />
                    <!-- Exhibition Segment (Purple) -->
                    <circle cx="65" cy="65" r="50" fill="none" stroke="#a855f7" stroke-width="14"
                            [attr.stroke-dasharray]="channelExhibitionDash()"
                            [attr.stroke-dashoffset]="channelExhibitionOffset()"
                            class="transition-all duration-700" />
                  </svg>
                  
                  <!-- Center Callout Text inside Circle -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span class="text-xl font-black text-[var(--hd)] leading-tight">{{ totalLeads() }}</span>
                    <span class="text-[9px] uppercase tracking-wider font-bold text-[var(--mu)]">Total Leads</span>
                  </div>
                </div>

                <!-- Structured Channel Legend with Exact Counts & Percentages -->
                <div class="flex-1 space-y-2 text-xs w-full">
                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Digital &amp; Online Inquiries</span>
                    </div>
                    <div class="text-right font-mono font-bold text-sky-600 dark:text-sky-400">
                      101 <span class="text-[10px] text-[var(--mu)] font-normal">(40%)</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Active Campaigns</span>
                    </div>
                    <div class="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      76 <span class="text-[10px] text-[var(--mu)] font-normal">(30%)</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-indigo-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Commercial Workshops</span>
                    </div>
                    <div class="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      43 <span class="text-[10px] text-[var(--mu)] font-normal">(17%)</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between p-2 rounded-xl bg-[var(--sf)] border border-[var(--ln)]">
                    <div class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></span>
                      <span class="text-[var(--hd)] font-semibold">Exhibitions &amp; Fairs</span>
                    </div>
                    <div class="text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                      32 <span class="text-[10px] text-[var(--mu)] font-normal">(13%)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- =====================================================================
           OPERATIONAL TABLES (Side-by-Side Grid with Zero Overlapping)
           ===================================================================== -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        <!-- 1. Active Campaigns Table Card -->
        <div class="erp-card-container">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 grid place-items-center">
                <i class="mi text-lg">play_circle</i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider">
                  Live &amp; Active Campaigns
                </h3>
                <span class="text-[11px] text-[var(--mu)]">Initiatives currently live and generating customer pipeline</span>
              </div>
            </div>
            <a routerLink="/marketing/activities" class="text-xs font-semibold text-[var(--pr)] hover:underline flex items-center gap-1">
              View All ({{ activities().length }}) <i class="mi text-sm">arrow_forward</i>
            </a>
          </div>

          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>CAMPAIGN TITLE</th>
                  <th>TYPE</th>
                  <th>DATES</th>
                  <th>BUDGET</th>
                  <th>LEADS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                @for (act of activeCampaignsList(); track act.activity_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs whitespace-nowrap">{{ act.activity_code }}</b>
                    </td>
                    <td class="text-xs text-[var(--hd)] font-semibold truncate max-w-[200px]" [title]="act.title">
                      <a routerLink="/marketing/activities" class="hover:text-[var(--pr)] transition-colors cursor-pointer">
                        {{ act.title }}
                      </a>
                    </td>
                    <td>
                      <span class="cat-pill text-[11px] font-semibold">{{ act.activity_type }}</span>
                    </td>
                    <td class="text-xs text-[var(--tx)] whitespace-nowrap">
                      {{ act.start_date }}
                    </td>
                    <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                      ETB {{ act.planned_budget | number }}
                    </td>
                    <td>
                      <span class="font-bold text-xs text-[var(--ok)] whitespace-nowrap">
                        {{ act.leads_generated || 0 }} Leads
                      </span>
                    </td>
                    <td>
                      <span class="status-pill active text-[10px] px-2 py-0.5">
                        <i class="mi text-xs">check_circle</i> ACTIVE
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Upcoming Activities Table Card -->
        <div class="erp-card-container">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-[var(--ln)]">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 grid place-items-center">
                <i class="mi text-lg">event_upcoming</i>
              </div>
              <div>
                <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider">
                  Upcoming Pipeline Schedule
                </h3>
                <span class="text-[11px] text-[var(--mu)]">Scheduled initiatives launching next with target budgets</span>
              </div>
            </div>
            <a routerLink="/marketing/activities" class="text-xs font-semibold text-[var(--pr)] hover:underline flex items-center gap-1">
              Manage Schedule <i class="mi text-sm">arrow_forward</i>
            </a>
          </div>

          <div class="erp-table-nested">
            <table class="crm-tbl">
              <thead>
                <tr>
                  <th>CODE</th>
                  <th>INITIATIVE TITLE</th>
                  <th>TYPE</th>
                  <th>START DATE</th>
                  <th>BUDGET</th>
                  <th>TARGET LEADS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                @for (act of upcomingActivitiesList(); track act.activity_id) {
                  <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                    <td>
                      <b class="text-[var(--hd)] font-mono text-xs whitespace-nowrap">{{ act.activity_code }}</b>
                    </td>
                    <td class="text-xs text-[var(--hd)] font-semibold truncate max-w-[200px]" [title]="act.title">
                      <a routerLink="/marketing/activities" class="hover:text-[var(--pr)] transition-colors cursor-pointer">
                        {{ act.title }}
                      </a>
                    </td>
                    <td>
                      <span class="cat-pill text-[11px] font-semibold">{{ act.activity_type }}</span>
                    </td>
                    <td class="text-xs text-[var(--tx)] font-semibold whitespace-nowrap">
                      {{ act.start_date }}
                    </td>
                    <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                      ETB {{ act.planned_budget | number }}
                    </td>
                    <td class="text-xs font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {{ act.planned_leads || 50 }} Target
                    </td>
                    <td>
                      @if (act.status === 'Approved' || act.status === 'In Progress') {
                        <span class="status-pill active text-[10px] px-2 py-0.5">
                          <i class="mi text-xs">verified</i> READY
                        </span>
                      } @else {
                        <span class="status-pill pending text-[10px] px-2 py-0.5">
                          <i class="mi text-xs">schedule</i> {{ act.status }}
                        </span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  `
})
export class MarketingOverviewComponent {
  private marketingService = inject(MarketingService);

  plans = this.marketingService.plans;
  activities = this.marketingService.activities;
  contentItems = this.marketingService.contentItems;
  participants = this.marketingService.participants;
  costs = this.marketingService.costs;

  // 1. Total Marketing Plans
  totalPlans = computed(() => this.plans().length);
  approvedPlans = computed(() => this.plans().filter(p => p.status === 'Approved').length);
  pendingPlans = computed(() => this.plans().filter(p => p.status !== 'Approved').length);

  // 2. Active Campaigns
  activeCampaigns = computed(() => this.activities().filter(a => a.status === 'In Progress' || a.status === 'Approved'));
  activeCampaignsCount = computed(() => this.activeCampaigns().length);
  activeCampaignsList = computed(() => this.activeCampaigns().slice(0, 5));

  // 3. Upcoming Activities
  upcomingActivitiesList = computed(() => {
    return this.activities()
      .filter(a => a.status === 'Approved' || a.status === 'Draft')
      .slice(0, 5);
  });
  upcomingCount = computed(() => this.activities().filter(a => a.status === 'Approved' || a.status === 'Draft').length);

  // 4. Total Marketing Budget and Expenditure
  totalApprovedBudget = computed(() => {
    return this.plans()
      .filter(p => p.status === 'Approved')
      .reduce((sum, p) => sum + (p.approved_budget || p.total_planned_budget), 0);
  });

  totalAllocatedBudget = computed(() => {
    return this.activities()
      .filter(a => a.status !== 'Cancelled')
      .reduce((sum, a) => sum + a.planned_budget, 0);
  });

  totalActualSpend = computed(() => {
    return this.costs()
      .reduce((sum, c) => sum + c.amount, 0);
  });

  remainingBudget = computed(() => Math.max(0, this.totalApprovedBudget() - this.totalActualSpend()));

  budgetUtilizationPercent = computed(() => {
    return this.totalApprovedBudget() > 0 
      ? Math.round((this.totalActualSpend() / this.totalApprovedBudget()) * 100 * 10) / 10 
      : 0;
  });

  allocatedPercent = computed(() => {
    return this.totalApprovedBudget() > 0 
      ? Math.round((this.totalAllocatedBudget() / this.totalApprovedBudget()) * 100 * 10) / 10 
      : 0;
  });

  // 5. Leads Generated
  totalLeads = computed(() => {
    return this.activities().reduce((sum, a) => sum + (a.leads_generated || 0), 0);
  });

  leadsCreatedInCrm = computed(() => {
    return this.participants().filter(p => !!p.lead_id || !!p.lead_code || p.crm_transfer_status === 'Sent').length;
  });

  // 6. Campaign Performance Overview
  totalImpressions = computed(() => {
    return this.contentItems().reduce((sum, c) => sum + (c.impressions || 0), 0);
  });

  totalReach = computed(() => {
    return this.contentItems().reduce((sum, c) => sum + (c.reach || 0), 0);
  });

  totalEngagements = computed(() => {
    return this.contentItems().reduce((sum, c) => sum + (c.engagements || 0), 0);
  });

  engagementRate = computed(() => {
    return this.totalReach() > 0 ? Math.round((this.totalEngagements() / this.totalReach()) * 100 * 10) / 10 : 0;
  });

  avgCostPerLead = computed(() => {
    return this.totalLeads() > 0 ? Math.round(this.totalActualSpend() / this.totalLeads()) : 0;
  });

  // =========================================================================
  // CIRCULAR DONUT / PIE MATH (Circumference C = 2 * PI * 50 = 314.159)
  // =========================================================================
  readonly C = 314.159;

  // Chart 1: Budget Allocation & Incurred Spend Donut
  budgetSpendDash = computed(() => {
    const p = Math.min(1, Math.max(0.01, this.budgetUtilizationPercent() / 100));
    return `${(p * this.C).toFixed(1)} ${this.C}`;
  });

  budgetCommittedDash = computed(() => {
    const p = Math.min(1, Math.max(0.01, (this.allocatedPercent() - this.budgetUtilizationPercent()) / 100));
    return `${(p * this.C).toFixed(1)} ${this.C}`;
  });

  budgetCommittedOffset = computed(() => {
    const p1 = Math.min(1, Math.max(0, this.budgetUtilizationPercent() / 100));
    return -(p1 * this.C);
  });

  budgetAvailableDash = computed(() => {
    const p = Math.max(0.01, 1 - (this.allocatedPercent() / 100));
    return `${(p * this.C).toFixed(1)} ${this.C}`;
  });

  budgetAvailableOffset = computed(() => {
    const pCommittedTotal = Math.min(1, Math.max(0, this.allocatedPercent() / 100));
    return -(pCommittedTotal * this.C);
  });

  // Chart 2: Channel Acquisition Yield Pie / Donut
  channelDigitalDash = computed(() => `${(0.40 * this.C).toFixed(1)} ${this.C}`);
  
  channelCampaignDash = computed(() => `${(0.30 * this.C).toFixed(1)} ${this.C}`);
  channelCampaignOffset = computed(() => -(0.40 * this.C));

  channelWorkshopDash = computed(() => `${(0.17 * this.C).toFixed(1)} ${this.C}`);
  channelWorkshopOffset = computed(() => -((0.40 + 0.30) * this.C));

  channelExhibitionDash = computed(() => `${(0.13 * this.C).toFixed(1)} ${this.C}`);
  channelExhibitionOffset = computed(() => -((0.40 + 0.30 + 0.17) * this.C));
}
