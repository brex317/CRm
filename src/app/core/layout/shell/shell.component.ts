import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--tx)]">
      <!-- Responsive Sidebar -->
      <app-sidebar [isCollapsed]="sidebarCollapsed()" />

      <!-- Main Layout -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <app-header (toggleSidebar)="toggleSidebar()" />

        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Global CRM Toast Container -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      @for (toast of toasts(); track toast.id) {
        <div class="pointer-events-auto flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#1d2a40] text-white shadow-xl text-sm font-medium animate-bounce-in">
          <i class="mi text-lg" 
             [class.text-[var(--ok)]]="toast.type === 'success'"
             [class.text-[var(--in)]]="toast.type === 'info'"
             [class.text-[var(--wa)]]="toast.type === 'warning'"
             [class.text-[var(--er)]]="toast.type === 'error'">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'info' }}
          </i>
          <span>{{ toast.text }}</span>
          <button (click)="dismissToast(toast.id)" class="ml-2 hover:opacity-75">
            <i class="mi text-sm text-gray-400">close</i>
          </button>
        </div>
      }
    </div>
  `
})
export class ShellComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;
  sidebarCollapsed = signal<boolean>(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(c => !c);
  }

  dismissToast(id: number): void {
    this.toastService.dismiss(id);
  }
}

