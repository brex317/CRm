import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-marketing-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="w-full">
      <router-outlet />
    </div>
  `
})
export class MarketingShellComponent {}
