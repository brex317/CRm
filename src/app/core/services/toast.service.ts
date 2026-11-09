import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  text: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSignal = signal<ToastMessage[]>([]);
  readonly toasts = this.toastsSignal.asReadonly();

  show(text: string, type: 'success' | 'info' | 'warning' | 'error' = 'info'): void {
    const id = Date.now();
    const newToast: ToastMessage = { id, text, type };
    this.toastsSignal.update(list => [...list, newToast]);

    setTimeout(() => {
      this.dismiss(id);
    }, 3500);
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  warning(text: string): void {
    this.show(text, 'warning');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  dismiss(id: number): void {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}

