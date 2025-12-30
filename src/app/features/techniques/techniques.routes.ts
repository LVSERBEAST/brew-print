import { Routes } from '@angular/router';

export const TECHNIQUE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./technique-list/technique-list').then(m => m.TechniqueList) },
  { path: 'new', loadComponent: () => import('./technique-form/technique-form').then(m => m.TechniqueForm) },
  { path: ':id', loadComponent: () => import('./technique-detail/technique-detail').then(m => m.TechniqueDetail) },
  { path: ':id/edit', loadComponent: () => import('./technique-form/technique-form').then(m => m.TechniqueForm) }
];
