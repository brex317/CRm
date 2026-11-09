import { Routes } from '@angular/router';

export const LEAD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/lead-list/lead-list.component').then(m => m.LeadListComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
  }
];

