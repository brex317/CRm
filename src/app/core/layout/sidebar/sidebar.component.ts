import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface MenuItem {
  title: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="h-full bg-[var(--sb-bg)] border-r border-[var(--ln)] flex flex-col transition-all duration-200 select-none overflow-hidden"
         [class.w-64]="!isCollapsed()"
         [class.w-16]="isCollapsed()">
      
      <!-- Brand Bar matching Image 1 -->
      <div class="p-3.5 border-b border-[var(--ln)] flex items-center gap-3">
        <div class="w-9 h-9 min-w-9 rounded-xl bg-[var(--pr)] text-white grid place-items-center font-bold text-lg shadow-xs">
          R
        </div>
        @if (!isCollapsed()) {
          <div class="min-w-0 overflow-hidden">
            <b class="block text-sm font-bold text-[var(--hd)] truncate">RARAS ERP</b>
            <small class="text-[10px] font-bold text-[var(--mu)] tracking-wider block uppercase">CRM &amp; Sales</small>
          </div>
        }
      </div>

      <!-- Search Menu Input -->
      @if (!isCollapsed()) {
        <div class="p-3 pb-1">
          <div class="relative flex items-center bg-[var(--sf)] border border-[var(--ln)] rounded-xl px-2.5 py-1.5 focus-within:border-[var(--pr)] transition-colors">
            <i class="mi text-lg text-[var(--mu)] mr-2">search</i>
            <input 
              [(ngModel)]="searchQuery" 
              placeholder="Search menu" 
              class="w-full bg-transparent text-xs text-[var(--hd)] outline-none placeholder:text-[var(--mu)]" />
          </div>
        </div>
      }

      <!-- Hierarchical Menu List -->
      <div class="p-2 flex flex-col gap-1 flex-1 overflow-y-auto">

        <!-- CRM MASTER ACCORDION (Collapse / Expand) -->
        <div class="flex flex-col">
          
          <!-- CRM Main Header Row -->
          <button 
            (click)="toggleCrm()"
            class="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wider text-[var(--lbl)] uppercase hover:bg-[var(--chip-bg)] transition-colors text-left"
            [title]="'CRM'">
            <div class="flex items-center gap-2.5 min-w-0">
              <i class="mi text-lg text-[var(--pr)]">corporate_fare</i>
              @if (!isCollapsed()) {
                <span class="truncate">CRM</span>
              }
            </div>
            @if (!isCollapsed()) {
              <i class="mi text-base text-[var(--mu)] transition-transform duration-200" [class.rotate-180]="crmExpanded()">
                expand_more
              </i>
            }
          </button>

          <!-- Inside CRM: Child Accordions (Marketing, Lead, Customer, Opportunity, Sales) -->
          @if (crmExpanded()) {
            <div class="flex flex-col gap-1 pl-1.5 mt-1 border-l-2 border-[var(--ln)] ml-3.5">
              
              <!-- 1. MARKETING (Collapse & Expand) -->
              <div class="flex flex-col">
                <button 
                  (click)="toggleGroup('marketing')"
                  class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors text-left"
                  [class.text-[var(--pr)]]="isGroupExpanded('marketing')"
                  [class.font-semibold]="isGroupExpanded('marketing')">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <i class="mi text-lg text-[var(--tx)]" [class.text-[var(--pr)]]="isGroupExpanded('marketing')">campaign</i>
                    @if (!isCollapsed()) {
                      <span class="truncate">Marketing</span>
                    }
                  </div>
                  @if (!isCollapsed()) {
                    <i class="mi text-sm text-[var(--mu)] transition-transform duration-200" [class.rotate-180]="isGroupExpanded('marketing')">
                      expand_more
                    </i>
                  }
                </button>

                <!-- Marketing Sub-Items -->
                @if (isGroupExpanded('marketing') && !isCollapsed()) {
                  <div class="flex flex-col gap-0.5 pl-6 mt-0.5 text-xs">
                    @for (item of filteredMarketingItems; track item.route) {
                      <a [routerLink]="item.route"
                         routerLinkActive="bg-[#dbeafe] dark:bg-[#192b4d] text-blue-600 dark:text-sky-400 font-bold"
                         class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors">
                        <i class="mi text-base">{{ item.icon }}</i>
                        <span class="truncate">{{ item.title }}</span>
                      </a>
                    }
                    @if (filteredMarketingItems.length === 0) {
                      <span class="px-2.5 py-1 text-[11px] text-[var(--mu)] italic">No matching items</span>
                    }
                  </div>
                }
              </div>

              <!-- 2. LEAD MANAGEMENT (Collapse & Expand) -->
              <div class="flex flex-col">
                <button 
                  (click)="toggleGroup('lead')"
                  class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors text-left"
                  [class.text-[var(--pr)]]="isGroupExpanded('lead')"
                  [class.font-semibold]="isGroupExpanded('lead')">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <i class="mi text-lg text-[var(--tx)]" [class.text-[var(--pr)]]="isGroupExpanded('lead')">filter_alt</i>
                    @if (!isCollapsed()) {
                      <span class="truncate">Lead Management</span>
                    }
                  </div>
                  @if (!isCollapsed()) {
                    <i class="mi text-sm text-[var(--mu)] transition-transform duration-200" [class.rotate-180]="isGroupExpanded('lead')">
                      expand_more
                    </i>
                  }
                </button>

                <!-- Lead Sub-Items -->
                @if (isGroupExpanded('lead') && !isCollapsed()) {
                  <div class="flex flex-col gap-0.5 pl-6 mt-0.5 text-xs">
                    <a routerLink="/leads"
                       routerLinkActive="bg-[#dbeafe] dark:bg-[#192b4d] text-blue-600 dark:text-sky-400 font-bold"
                       [routerLinkActiveOptions]="{ exact: false }"
                       class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors">
                      <i class="mi text-base">view_list</i>
                      <span>Lead Register</span>
                    </a>
                  </div>
                }
              </div>

              <!-- 3. CUSTOMER MANAGEMENT (Collapse & Expand) -->
              <div class="flex flex-col">
                <button 
                  (click)="toggleGroup('customer')"
                  class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors text-left"
                  [class.text-[var(--pr)]]="isGroupExpanded('customer')"
                  [class.font-semibold]="isGroupExpanded('customer')">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <i class="mi text-lg text-[var(--tx)]" [class.text-[var(--pr)]]="isGroupExpanded('customer')">groups</i>
                    @if (!isCollapsed()) {
                      <span class="truncate">Customers</span>
                    }
                  </div>
                  @if (!isCollapsed()) {
                    <i class="mi text-sm text-[var(--mu)] transition-transform duration-200" [class.rotate-180]="isGroupExpanded('customer')">
                      expand_more
                    </i>
                  }
                </button>

                @if (isGroupExpanded('customer') && !isCollapsed()) {
                  <div class="flex flex-col gap-0.5 pl-6 mt-0.5 text-xs">
                    <a (click)="onPlaceholderClick('Customer Accounts')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">business</i>
                      <span>Customer Accounts</span>
                    </a>
                    <a (click)="onPlaceholderClick('Contacts Directory')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">contacts</i>
                      <span>Contacts</span>
                    </a>
                  </div>
                }
              </div>

              <!-- 4. OPPORTUNITIES (Collapse & Expand) -->
              <div class="flex flex-col">
                <button 
                  (click)="toggleGroup('opportunity')"
                  class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors text-left"
                  [class.text-[var(--pr)]]="isGroupExpanded('opportunity')"
                  [class.font-semibold]="isGroupExpanded('opportunity')">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <i class="mi text-lg text-[var(--tx)]" [class.text-[var(--pr)]]="isGroupExpanded('opportunity')">trending_up</i>
                    @if (!isCollapsed()) {
                      <span class="truncate">Opportunities</span>
                    }
                  </div>
                  @if (!isCollapsed()) {
                    <i class="mi text-sm text-[var(--mu)] transition-transform duration-200" [class.rotate-180]="isGroupExpanded('opportunity')">
                      expand_more
                    </i>
                  }
                </button>

                @if (isGroupExpanded('opportunity') && !isCollapsed()) {
                  <div class="flex flex-col gap-0.5 pl-6 mt-0.5 text-xs">
                    <a (click)="onPlaceholderClick('Sales Pipeline')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">view_kanban</i>
                      <span>Pipeline Kanban</span>
                    </a>
                    <a (click)="onPlaceholderClick('Won / Lost Analysis')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">insights</i>
                      <span>Won / Lost</span>
                    </a>
                  </div>
                }
              </div>

              <!-- 5. SALES (Collapse & Expand) -->
              <div class="flex flex-col">
                <button 
                  (click)="toggleGroup('sales')"
                  class="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm text-[var(--tx)] hover:bg-[var(--chip-bg)] hover:text-[var(--hd)] transition-colors text-left"
                  [class.text-[var(--pr)]]="isGroupExpanded('sales')"
                  [class.font-semibold]="isGroupExpanded('sales')">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <i class="mi text-lg text-[var(--tx)]" [class.text-[var(--pr)]]="isGroupExpanded('sales')">receipt_long</i>
                    @if (!isCollapsed()) {
                      <span class="truncate">Sales</span>
                    }
                  </div>
                  @if (!isCollapsed()) {
                    <i class="mi text-sm text-[var(--mu)] transition-transform duration-200" [class.rotate-180]="isGroupExpanded('sales')">
                      expand_more
                    </i>
                  }
                </button>

                @if (isGroupExpanded('sales') && !isCollapsed()) {
                  <div class="flex flex-col gap-0.5 pl-6 mt-0.5 text-xs">
                    <a (click)="onPlaceholderClick('Quotations')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">request_quote</i>
                      <span>Quotations</span>
                    </a>
                    <a (click)="onPlaceholderClick('Sales Orders')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">shopping_bag</i>
                      <span>Sales Orders</span>
                    </a>
                    <a (click)="onPlaceholderClick('Invoices')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[var(--tx)] hover:bg-[var(--chip-bg)] cursor-pointer">
                      <i class="mi text-sm text-[var(--mu)]">description</i>
                      <span>Invoices</span>
                    </a>
                  </div>
                }
              </div>

            </div>
          }

        </div>

      </div>

      <!-- Bottom Sign Out Action -->
      <div class="p-3 border-t border-[var(--ln)] bg-[var(--sb-bg)]">
        <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[var(--tx)] hover:text-[var(--hd)] hover:bg-[var(--chip-bg)] cursor-pointer transition-colors"
           title="Sign out">
          <i class="mi text-base text-[var(--mu)]">logout</i>
          @if (!isCollapsed()) {
            <span>Sign out</span>
          }
        </a>
      </div>

    </nav>
  `
})
export class SidebarComponent {
  isCollapsed = input<boolean>(false);

  searchQuery = '';
  crmExpanded = signal<boolean>(true);
  
  // Keep both marketing and lead expanded by default
  private expandedGroups = signal<Set<string>>(new Set(['marketing', 'lead']));

  marketingItems: MenuItem[] = [
    { title: 'Dashboard', route: '/marketing/dashboard', icon: 'dashboard' },
    { title: 'Marketing Plans', route: '/marketing/plans', icon: 'calendar_month' },
    { title: 'Activities & Campaigns', route: '/marketing/activities', icon: 'campaign' },
    { title: 'Content Items', route: '/marketing/content', icon: 'article' },
    { title: 'Participants', route: '/marketing/participants', icon: 'person_add' },
    { title: 'Costs & Budget', route: '/marketing/costs', icon: 'payments' },
    { title: 'Activity Reports', route: '/marketing/reports', icon: 'assignment_turned_in' }
  ];

  toggleCrm(): void {
    this.crmExpanded.update(v => !v);
  }

  toggleGroup(groupId: string): void {
    this.expandedGroups.update(set => {
      const next = new Set(set);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }

  isGroupExpanded(groupId: string): boolean {
    if (this.searchQuery && this.searchQuery.trim().length > 0) return true;
    return this.expandedGroups().has(groupId);
  }

  get filteredMarketingItems(): MenuItem[] {
    if (!this.searchQuery || !this.searchQuery.trim()) return this.marketingItems;
    const q = this.searchQuery.toLowerCase().trim();
    return this.marketingItems.filter(item => 
      item.title.toLowerCase().includes(q) || item.route.toLowerCase().includes(q)
    );
  }

  onPlaceholderClick(sectionName: string): void {
    alert(`${sectionName} is scheduled for implementation next.`);
  }
}
