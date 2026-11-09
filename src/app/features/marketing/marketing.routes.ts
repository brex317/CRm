import { Routes } from '@angular/router';
import { MarketingShellComponent } from './components/marketing-shell/marketing-shell.component';
import { MarketingOverviewComponent } from './components/marketing-overview/marketing-overview.component';
import { MarketingPlansComponent } from './components/marketing-plans/marketing-plans.component';
import { MarketingActivitiesComponent } from './components/marketing-activities/marketing-activities.component';
import { ContentItemsComponent } from './components/content-items/content-items.component';
import { ParticipantsComponent } from './components/participants/participants.component';
import { MarketingCostsComponent } from './components/marketing-costs/marketing-costs.component';
import { ActivityReportsComponent } from './components/activity-reports/activity-reports.component';

export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    component: MarketingShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: MarketingOverviewComponent },
      { path: 'overview', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'plans', component: MarketingPlansComponent },
      { path: 'activities', component: MarketingActivitiesComponent },
      { path: 'content', component: ContentItemsComponent },
      { path: 'participants', component: ParticipantsComponent },
      { path: 'costs', component: MarketingCostsComponent },
      { path: 'reports', component: ActivityReportsComponent }
    ]
  }
];

