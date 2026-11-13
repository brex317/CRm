import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialog.state(); as state) {
      <div 
        class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-[2px] transition-all animate-fadeIn"
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title">
        
        <div 
          class="relative w-full max-w-[390px] rounded-2xl bg-[var(--sf)] border border-[var(--ln)] shadow-2xl p-5 sm:p-6 text-center overflow-hidden"
          style="animation: modalIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);"
          (click)="$event.stopPropagation()">
          
          <!-- Top subtle accent bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500"></div>

          <!-- Close X button -->
          <button 
            type="button"
            (click)="dialog.handleCancel()"
            class="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--mu)] hover:text-[var(--hd)] hover:bg-[var(--chip-bg)] transition-colors"
            title="Cancel"
            aria-label="Close dialog">
            <i class="mi text-lg">close</i>
          </button>

          <!-- Warning/Delete Icon Badge (Compact & Refined) -->
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 shadow-sm">
            <i class="mi text-2xl">delete_forever</i>
          </div>

          <!-- Dialog Title -->
          <h3 id="confirm-dialog-title" class="text-base sm:text-lg font-bold text-[var(--hd)] tracking-tight">
            {{ state.options.title }}
          </h3>

          <!-- Primary Question -->
          <p class="mt-1 text-xs text-[var(--tx)] font-medium leading-relaxed">
            {{ state.options.message }}
          </p>

          <!-- Highlighted Target Record Pill -->
          @if (state.options.recordName) {
            <div class="mt-3 px-3 py-2 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)] text-left flex items-center gap-2">
              <i class="mi text-sm text-rose-500 shrink-0">inventory_2</i>
              <span class="text-xs font-mono font-semibold text-[var(--hd)] truncate flex-1" [title]="state.options.recordName">
                {{ state.options.recordName }}
              </span>
            </div>
          }

          <!-- Warning Subtext -->
          @if (state.options.details) {
            <p class="mt-2.5 text-[11px] text-[var(--mu)] flex items-center justify-center gap-1">
              <i class="mi text-xs text-amber-500">warning</i>
              <span>{{ state.options.details }}</span>
            </p>
          }

          <!-- Action Buttons (Compact & Balanced) -->
          <div class="mt-5 flex items-center gap-2.5">
            <button 
              type="button" 
              (click)="dialog.handleCancel()"
              class="flex-1 btn bo py-2 px-3 rounded-xl text-xs font-semibold text-[var(--tx)] hover:bg-[var(--chip-bg)] transition-colors">
              {{ state.options.cancelText }}
            </button>
            <button 
              type="button" 
              (click)="dialog.handleConfirm()"
              class="flex-1 btn py-2 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all">
              <i class="mi text-sm">delete</i>
              <span>{{ state.options.confirmText }}</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  dialog = inject(ConfirmDialogService);

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.dialog.state()) {
      this.dialog.handleCancel();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dialog.handleCancel();
    }
  }
}
