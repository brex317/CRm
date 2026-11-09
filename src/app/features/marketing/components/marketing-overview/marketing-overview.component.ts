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
      
      <!-- Page Title & Header matching Production ERP Reference -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span class="text-xs font-bold tracking-wider text-[var(--mu)] uppercase block mb-1">CRM</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[var(--hd)] tracking-tight">Marketing Management</h1>
          <h2 class="text-base font-semibold text-[var(--hd)] mt-0.5">Dashboard</h2>
          <p class="text-xs text-[var(--tx)] mt-1 max-w-2xl">
            A simple summary of marketing operations, financial budget governance, active campaigns, upcoming initiatives, and lead generation performance.
          </p>
        </div>
        <div class="flex items-center gap-2.5">
          <a routerLink="/marketing/plans" class="btn bo text-xs py-2 px-3.5 rounded-xl font-medium">
            <i class="mi text-base text-[var(--mu)]">calendar_month</i> Plans ({{ plans().length }})
          </a>
          <a routerLink="/marketing/activities" class="btn bp text-xs py-2 px-3.5 rounded-xl font-bold">
            <i class="mi text-base">add</i> New activity
          </a>
        </div>
      </div>

      <!-- =====================================================================
           6 TOP EXECUTIVE KPI CARDS
           ===================================================================== -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        <!-- 1. Total Marketing Plans -->
        <div class="kpi-card">
          <div class="min-w-0">
            <div class="kpi-card-val">{{ totalPlans() }}</div>
            <div class="kpi-card-lbl">Total Plans</div>
            <div class="text-[11px] text-[var(--ok)] font-semibold mt-1 truncate">
              {{ approvedPlans() }} Approved · {{ pendingPlans() }} Draft
            </div>
          </div>
          <div class="kpi-icon-badge bg-blue-50 dark:bg-[#162a4a] text-blue-600 dark:text-sky-400">
            <i class="mi text-2xl">folder</i>
          </div>
        </div>

        <!-- 2. Active Campaigns -->
        <div class="kpi-card">
          <div class="min-w-0">
            <div class="kpi-card-val">{{ activeCampaignsCount() }}</div>
            <div class="kpi-card-lbl">Active Campaigns</div>
            <div class="text-[11px] text-[var(--pr)] font-semibold mt-1 truncate">
              In Progress &amp; Live
            </div>
          </div>
          <div class="kpi-icon-badge bg-emerald-50 dark:bg-[#14382a] text-emerald-600 dark:text-emerald-400">
            <i class="mi text-2xl">campaign</i>
          </div>
        </div>

        <!-- 3. Upcoming Activities -->
        <div class="kpi-card">
          <div class="min-w-0">
            <div class="kpi-card-val">{{ upcomingCount() }}</div>
            <div class="kpi-card-lbl">Upcoming Activities</div>
            <div class="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1 truncate">
              Next 60 Days Pipeline
            </div>
          </div>
          <div class="kpi-icon-badge bg-indigo-50 dark:bg-[#1c2242] text-indigo-600 dark:text-indigo-400">
            <i class="mi text-2xl">event_upcoming</i>
          </div>
        </div>

        <!-- 4. Total Marketing Budget -->
        <div class="kpi-card">
          <div class="min-w-0">
            <div class="kpi-card-val">ETB {{ (totalApprovedBudget() / 1000000) | number:'1.1-1' }}M</div>
            <div class="kpi-card-lbl">Approved Budget</div>
            <div class="text-[11px] text-[var(--mu)] font-medium mt-1 truncate">
              Annual Ceiling
            </div>
          </div>
          <div class="kpi-icon-badge bg-sky-50 dark:bg-[#0e2c45] text-sky-600 dark:text-sky-400">
            <i class="mi text-2xl">account_balance_wallet</i>
          </div>
        </div>

        <!-- 5. Total Expenditure -->
        <div class="kpi-card">
          <div class="min-w-0">
            <div class="kpi-card-val">ETB {{ (totalActualSpend() / 1000) | number:'1.0-0' }}k</div>
            <div class="kpi-card-lbl">Total Expenditure</div>
            <div class="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 truncate">
              {{ budgetUtilizationPercent() }}% Burn Rate
            </div>
          </div>
          <div class="kpi-icon-badge bg-amber-50 dark:bg-[#3b2f12] text-amber-600 dark:text-amber-400">
            <i class="mi text-2xl">receipt_long</i>
          </div>
        </div>

        <!-- 6. Leads Generated -->
        <div class="kpi-card">
          <div class="min-w-0">
            <div class="kpi-card-val">{{ totalLeads() | number }}</div>
            <div class="kpi-card-lbl">Leads Generated</div>
            <div class="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1 truncate">
              {{ leadsCreatedInCrm() }} Leads Created
            </div>
          </div>
          <div class="kpi-icon-badge bg-purple-50 dark:bg-[#2a1a4a] text-purple-600 dark:text-purple-400">
            <i class="mi text-2xl">how_to_reg</i>
          </div>
        </div>

      </div>

      <!-- =====================================================================
           2-COLUMN EXECUTIVE SUMMARY:
           - LEFT: Total Marketing Budget and Expenditure
           - RIGHT: Campaign Performance Overview
           ===================================================================== -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Budget & Expenditure Summary Card -->
        <div class="erp-card-container flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">account_balance</i> Budget &amp; Expenditure
                </h3>
                <span class="text-xs text-[var(--mu)]">Approved ceiling vs actual posted expenditure</span>
              </div>
              <a routerLink="/marketing/costs" class="text-xs font-semibold text-[var(--pr)] hover:underline flex items-center gap-1">
                View Ledger <i class="mi text-sm">arrow_forward</i>
              </a>
            </div>

            <!-- Financial Metrics Grid -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Approved Ceiling</span>
                <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5">ETB {{ totalApprovedBudget() | number }}</b>
                <small class="text-[10px] text-[var(--ok)] font-medium">100% Authorized</small>
              </div>

              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Actual Incurred Spend</span>
                <b class="text-base font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5">ETB {{ totalActualSpend() | number }}</b>
                <small class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{{ budgetUtilizationPercent() }}% Burn Rate</small>
              </div>

              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Allocated to Initiatives</span>
                <b class="text-base font-extrabold text-sky-600 dark:text-sky-400 block mt-0.5">ETB {{ totalAllocatedBudget() | number }}</b>
                <small class="text-[10px] text-[var(--mu)] font-medium">{{ allocatedPercent() }}% Committed</small>
              </div>

              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Available Balance</span>
                <b class="text-base font-extrabold text-[var(--ok)] block mt-0.5">ETB {{ remainingBudget() | number }}</b>
                <small class="text-[10px] text-[var(--ok)] font-medium">Unspent Capital</small>
              </div>
            </div>

            <!-- Visual Progress Meter -->
            <div class="space-y-1.5 p-3 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
              <div class="flex items-center justify-between text-[11px] font-semibold text-[var(--hd)]">
                <span>Expenditure Burn ({{ budgetUtilizationPercent() }}%)</span>
                <span class="text-[var(--ok)]">ETB {{ remainingBudget() | number }} Remaining</span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                <div [style.width.%]="budgetUtilizationPercent()" class="bg-amber-500" title="Actual Spend"></div>
                <div [style.width.%]="allocatedPercent() - budgetUtilizationPercent()" class="bg-[var(--pr)]" title="Committed"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campaign Performance Overview Card -->
        <div class="erp-card-container flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider flex items-center gap-2">
                  <i class="mi text-base text-[var(--pr)]">monitoring</i> Campaign Performance Overview
                </h3>
                <span class="text-xs text-[var(--mu)]">Reach, impressions, engagement, and conversion yield</span>
              </div>
              <a routerLink="/marketing/content" class="text-xs font-semibold text-[var(--pr)] hover:underline flex items-center gap-1">
                View Content <i class="mi text-sm">arrow_forward</i>
              </a>
            </div>

            <!-- Telemetry Metrics Grid -->
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Audience Reach</span>
                <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5">{{ totalReach() | number }}</b>
                <small class="text-[10px] text-cyan-600 font-medium">Decision Makers</small>
              </div>

              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Total Impressions</span>
                <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5">{{ totalImpressions() | number }}</b>
                <small class="text-[10px] text-[var(--pr)] font-medium">Omnichannel Views</small>
              </div>

              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Engagements</span>
                <b class="text-base font-extrabold text-[var(--hd)] block mt-0.5">{{ totalEngagements() | number }}</b>
                <small class="text-[10px] text-emerald-600 font-medium">{{ engagementRate() }}% Rate</small>
              </div>

              <div class="p-3.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)]">
                <span class="text-[10px] font-bold uppercase text-[var(--mu)] block">Avg Cost / Lead (CPL)</span>
                <b class="text-base font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5">ETB {{ avgCostPerLead() | number }}</b>
                <small class="text-[10px] text-[var(--ok)] font-medium">Under Benchmark</small>
              </div>
            </div>

            <!-- Channel Performance Tags -->
            <div class="p-3 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span class="font-semibold text-[var(--hd)]">Top Channels:</span>
              <span class="cat-pill text-[10px]">Campaigns (420 Leads)</span>
              <span class="cat-pill text-[10px]">Workshops (280 Leads)</span>
              <span class="cat-pill text-[10px]">Exhibitions (240 Leads)</span>
              <span class="cat-pill text-[10px]">Digital (264 Leads)</span>
            </div>
          </div>
        </div>

      </div>

      <!-- =====================================================================
           TWO SIMPLE OPERATIONAL TABLES:
           1. Active Campaigns
           2. Upcoming Activities
           ===================================================================== -->
      
      <!-- 1. Active Campaigns Table -->
      <div class="erp-card-container">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider flex items-center gap-2">
              <i class="mi text-base text-[var(--pr)]">campaign</i> Active Campaigns
            </h3>
            <span class="text-xs text-[var(--mu)]">Campaigns and initiatives currently live and in progress</span>
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
                <th>TIMELINE</th>
                <th>BUDGET</th>
                <th>LEADS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              @for (act of activeCampaignsList(); track act.activity_id) {
                <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                  <td>
                    <b class="text-[var(--hd)] font-mono text-xs">{{ act.activity_code }}</b>
                  </td>
                  <td class="text-xs text-[var(--hd)] font-semibold truncate max-w-xs" [title]="act.title">
                    {{ act.title }}
                  </td>
                  <td>
                    <span class="cat-pill">{{ act.activity_type }}</span>
                  </td>
                  <td class="text-xs text-[var(--tx)] whitespace-nowrap">
                    {{ act.start_date }} &rarr; {{ act.end_date }}
                  </td>
                  <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                    ETB {{ act.planned_budget | number }}
                  </td>
                  <td>
                    <span class="font-bold text-xs text-[var(--ok)]">
                      {{ act.leads_generated || 0 }} Leads
                    </span>
                  </td>
                  <td>
                    <span class="status-pill active">
                      <i class="mi text-sm">check_circle</i> ACTIVE
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Upcoming Activities Table -->
      <div class="erp-card-container">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-[var(--hd)] uppercase tracking-wider flex items-center gap-2">
              <i class="mi text-base text-[var(--pr)]">event_available</i> Upcoming Activities
            </h3>
            <span class="text-xs text-[var(--mu)]">Scheduled initiatives launching next with target budgets and leads</span>
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
                <th>SCHEDULED START</th>
                <th>TARGET BUDGET</th>
                <th>TARGET LEADS</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              @for (act of upcomingActivitiesList(); track act.activity_id) {
                <tr class="hover:bg-[var(--chip-bg)] transition-colors">
                  <td>
                    <b class="text-[var(--hd)] font-mono text-xs">{{ act.activity_code }}</b>
                  </td>
                  <td class="text-xs text-[var(--hd)] font-semibold truncate max-w-xs" [title]="act.title">
                    {{ act.title }}
                  </td>
                  <td>
                    <span class="cat-pill">{{ act.activity_type }}</span>
                  </td>
                  <td class="text-xs text-[var(--tx)] font-semibold whitespace-nowrap">
                    {{ act.start_date }}
                  </td>
                  <td class="font-bold text-xs text-[var(--hd)] whitespace-nowrap">
                    ETB {{ act.planned_budget | number }}
                  </td>
                  <td class="text-xs font-bold text-sky-600 dark:text-sky-400">
                    {{ act.planned_leads || 50 }} Target Leads
                  </td>
                  <td>
                    @if (act.status === 'Approved' || act.status === 'In Progress') {
                      <span class="status-pill active">
                        <i class="mi text-sm">check_circle</i> READY
                      </span>
                    } @else {
                      <span class="status-pill pending">
                        <i class="mi text-sm">schedule</i> {{ act.status }}
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
}
