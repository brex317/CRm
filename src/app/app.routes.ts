import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'marketing', pathMatch: 'full' },
      {
        path: 'marketing',
        loadChildren: () => import('./features/marketing/marketing.routes').then(m => m.MARKETING_ROUTES)
      },
      {
        path: 'leads',
        loadChildren: () => import('./features/leads/lead.routes').then(m => m.LEAD_ROUTES)
      }
    ]
  },
  { path: '**', redirectTo: 'marketing' }
];
