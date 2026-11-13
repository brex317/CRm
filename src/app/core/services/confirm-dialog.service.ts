import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  recordName?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  details?: string;
}

export interface DialogState {
  options: ConfirmDialogOptions;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  readonly state = signal<DialogState | null>(null);

  /**
   * Opens confirmation modal popup and returns a Promise that resolves
   * to true if confirmed or false if cancelled.
   */
  confirm(options: ConfirmDialogOptions = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.set({
        options: {
          title: options.title || 'Delete Record',
          message: options.message || 'Do you want to delete this record?',
          recordName: options.recordName,
          confirmText: options.confirmText || 'Delete Record',
          cancelText: options.cancelText || 'Cancel',
          type: options.type || 'danger',
          details: options.details || 'This action cannot be undone. All associated data will be removed.'
        },
        resolve
      });
    });
  }

  handleConfirm(): void {
    const current = this.state();
    if (current) {
      current.resolve(true);
      this.state.set(null);
    }
  }

  handleCancel(): void {
    const current = this.state();
    if (current) {
      current.resolve(false);
      this.state.set(null);
    }
  }
}

