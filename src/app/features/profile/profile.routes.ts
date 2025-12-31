import { Routes } from '@angular/router';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile').then((m) => m.Profile),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings').then((m) => m.Settings),
  },
  {
    path: 'news',
    loadComponent: () => import('./news').then((m) => m.News),
  },
  {
    path: 'about',
    loadComponent: () => import('./about').then((m) => m.About),
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact').then((m) => m.Contact),
  },
  {
    path: 'faq',
    loadComponent: () => import('./faq').then((m) => m.FAQ),
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin').then((m) => m.Admin),
  },
];
