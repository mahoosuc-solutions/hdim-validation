import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'seeding', pathMatch: 'full' },
  {
    path: 'seeding',
    loadComponent: () => import('./features/data-seeding/seeding-dashboard.component').then(m => m.SeedingDashboardComponent),
  },
  {
    path: 'pipeline',
    loadComponent: () => import('./features/pipeline-monitor/pipeline-dashboard.component').then(m => m.PipelineDashboardComponent),
  },
  {
    path: 'analytics',
    loadComponent: () => import('./features/patient-analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
  },
  {
    path: 'lifecycle',
    loadComponent: () => import('./features/patient-lifecycle/lifecycle-dashboard.component').then(m => m.LifecycleDashboardComponent),
  },
  {
    path: 'security',
    loadComponent: () => import('./features/security/security-dashboard.component').then(m => m.SecurityDashboardComponent),
  },
  {
    path: 'performance',
    loadComponent: () => import('./features/performance/performance-dashboard.component').then(m => m.PerformanceDashboardComponent),
  },
  {
    path: 'operations',
    loadComponent: () => import('./features/operations/ops-dashboard.component').then(m => m.OpsDashboardComponent),
  },
  {
    path: 'traffic',
    loadComponent: () => import('./features/traffic-inspector/traffic-inspector.component').then(m => m.TrafficInspectorComponent),
  },
  { path: '**', redirectTo: 'seeding' },
];
