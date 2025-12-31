import { Routes } from '@angular/router';

export const BREW_LOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./brew-log-list/brew-log-list').then(m => m.BrewLogList),
  },
  {
    path: 'new',
    loadComponent: () => import('./brew-log-form/brew-log-form').then(m => m.BrewLogForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./brew-log-detail/brew-log-detail').then(m => m.BrewLogDetail),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./brew-log-form/brew-log-form').then(m => m.BrewLogForm),
  },
];
