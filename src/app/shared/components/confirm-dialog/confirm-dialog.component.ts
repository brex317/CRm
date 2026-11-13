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
        class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-all animate-fadeIn"
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title">
        
        <div 
          class="relative w-full max-w-md rounded-2xl bg-[var(--sf)] border border-[var(--ln)] shadow-2xl p-6 sm:p-7 text-center overflow-hidden"
          style="animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);"
          (click)="$event.stopPropagation()">
          
          <!-- Top subtle glow/accent bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500"></div>

          <!-- Close X button -->
          <button 
            type="button"
            (click)="dialog.handleCancel()"
            class="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--mu)] hover:text-[var(--hd)] hover:bg-[var(--chip-bg)] transition-colors"
            title="Cancel"
            aria-label="Close dialog">
            <i class="mi text-xl">close</i>
          </button>

          <!-- Warning/Danger Icon Badge -->
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-inner">
            <i class="mi text-3xl">delete_forever</i>
          </div>

          <!-- Dialog Title -->
          <h3 id="confirm-dialog-title" class="text-xl font-black text-[var(--hd)] tracking-tight">
            {{ state.options.title }}
          </h3>

          <!-- Primary Question -->
          <p class="mt-2 text-sm text-[var(--tx)] font-medium leading-relaxed">
            {{ state.options.message }}
          </p>

          <!-- Highlighted Record Identity Box -->
          @if (state.options.recordName) {
            <div class="mt-3.5 px-4 py-2.5 rounded-xl bg-[var(--chip-bg)] border border-[var(--ln)] text-left flex items-start gap-2.5">
              <i class="mi text-base text-rose-500 mt-0.5 shrink-0">inventory_2</i>
              <div class="min-w-0 flex-1">
                <span class="block text-[10px] font-bold uppercase tracking-wider text-[var(--mu)]">Target Record</span>
                <span class="block text-xs font-mono font-bold text-[var(--hd)] truncate" [title]="state.options.recordName">
                  {{ state.options.recordName }}
                </span>
              </div>
            </div>
          }

          <!-- Irreversible Action Notice -->
          @if (state.options.details) {
            <div class="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left flex items-center gap-2">
              <i class="mi text-sm text-amber-500 shrink-0">warning</i>
              <span class="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
                {{ state.options.details }}
              </span>
            </div>
          }

          <!-- Action Buttons -->
          <div class="mt-6 flex items-center gap-3">
            <button 
              type="button" 
              (click)="dialog.handleCancel()"
              class="flex-1 btn bo py-2.5 px-4 rounded-xl text-xs font-bold text-[var(--tx)] hover:bg-[var(--chip-bg)] transition-colors">
              {{ state.options.cancelText }}
            </button>
            <button 
              type="button" 
              (click)="dialog.handleConfirm()"
              class="flex-1 btn py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-600/25 flex items-center justify-center gap-1.5 transition-all">
              <i class="mi text-base">delete</i>
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

