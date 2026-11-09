import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly isDark = signal<boolean>(false);

  constructor() {
    const saved = localStorage.getItem('raras_theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDark.set(true);
    }

    effect(() => {
      const dark = this.isDark();
      if (dark) {
        document.documentElement.dataset['theme'] = 'dark';
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('raras_theme', 'dark');
      } else {
        document.documentElement.dataset['theme'] = 'light';
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        localStorage.setItem('raras_theme', 'light');
      }
    });
  }

  toggleTheme(): void {
    this.isDark.update(d => !d);
  }
}

