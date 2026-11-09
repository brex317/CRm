import { Component, inject, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-[3px] z-20 bg-[var(--top-bg)] border-b border-[var(--ln)] flex items-center justify-between px-5 h-[68px]">
      
      <!-- Left side: Toggle + Breadcrumbs + Welcome Subtitle -->
      <div class="flex items-center gap-4 min-w-0">
        <button 
          (click)="toggleSidebar.emit()"
          class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)] flex-shrink-0" 
          title="Toggle Navigation" 
          aria-label="Toggle Navigation">
          <i class="mi text-2xl">menu</i>
        </button>

        <div class="flex flex-col justify-center min-w-0">
          <div class="flex items-center gap-1.5 text-xs text-[var(--tx)] whitespace-nowrap">
            <a [routerLink]="moduleRoute()" class="hover:underline cursor-pointer">Home</a>
            <i class="mi text-sm text-[var(--mu)]">chevron_right</i>
            <span class="text-[var(--tx)] font-medium">CRM</span>
            <i class="mi text-sm text-[var(--mu)]">chevron_right</i>
            <a [routerLink]="moduleRoute()" class="text-[var(--tx)] font-medium hover:underline cursor-pointer">{{ currentModule() }}</a>
            <i class="mi text-sm text-[var(--mu)]">chevron_right</i>
            <span class="font-extrabold text-[var(--hd)] text-sm tracking-tight">{{ currentSectionTitle() }}</span>
          </div>
          <div class="text-xs text-[var(--mu)] hidden sm:block mt-0.5 truncate">
            Welcome back, Berihu Esayas! Here's what's happening today.
          </div>
        </div>
      </div>

      <!-- Right side: Theme toggle, Notifications, User block -->
      <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        <!-- Theme Switcher -->
        <button 
          (click)="themeService.toggleTheme()" 
          class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)]" 
          [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'" 
          aria-label="Toggle Theme">
          <i class="mi text-xl">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</i>
        </button>

        <!-- Notifications -->
        <button class="ib text-[var(--tx)] hover:bg-[var(--chip-bg)] relative" title="Notifications" aria-label="Notifications">
          <i class="mi text-xl">notifications_none</i>
          <span class="bdg absolute top-1 right-1 text-[9px] leading-[15px] font-bold">3</span>
        </button>

        <!-- User Profile Block -->
        <div class="flex items-center gap-2.5 pl-2 py-1 cursor-pointer hover:bg-[var(--chip-bg)] rounded-lg transition-colors select-none">
          <div class="w-8 h-8 rounded-full bg-[var(--pr)] text-white grid place-items-center font-bold text-sm shadow-xs flex-shrink-0">
            B
          </div>
          <div class="hidden md:block leading-tight text-left">
            <b class="block text-xs font-bold text-[var(--hd)]">Berihu Esayas</b>
            <small class="text-[10px] text-[var(--mu)] font-medium">Commercial Director</small>
          </div>
          <i class="mi text-sm text-[var(--mu)] hidden md:inline">expand_more</i>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  private router = inject(Router);
  toggleSidebar = output<void>();

  currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects || e.url)
    ),
    { initialValue: this.router.url }
  );

  isLeads = computed(() => (this.currentUrl() || '').includes('/leads'));
  currentModule = computed(() => this.isLeads() ? 'Lead Management' : 'Marketing Management');
  moduleRoute = computed(() => this.isLeads() ? '/leads' : '/marketing/dashboard');

  currentSectionTitle = computed(() => {
    const url = this.currentUrl() || '';
    const cleanUrl = url.split('?')[0].split('#')[0];
    if (cleanUrl.match(/\/leads\/\d+/)) return 'Lead Details';
    if (cleanUrl.includes('/leads')) return 'Lead Register';
    if (cleanUrl.includes('/marketing/plans')) return 'Marketing Plans';
    if (cleanUrl.includes('/marketing/activities')) return 'Activities & Campaigns';
    if (cleanUrl.includes('/marketing/content')) return 'Content Items';
    if (cleanUrl.includes('/marketing/participants')) return 'Participants';
    if (cleanUrl.includes('/marketing/costs')) return 'Costs & Budget';
    if (cleanUrl.includes('/marketing/reports')) return 'Activity Reports';
    return 'Dashboard';
  });
}
