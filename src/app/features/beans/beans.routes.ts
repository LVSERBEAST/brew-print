import { Routes } from '@angular/router';

export const BEAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bean-list/bean-list').then(m => m.BeanList),
  },
  {
    path: 'new',
    loadComponent: () => import('./bean-form/bean-form').then(m => m.BeanForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./bean-detail/bean-detail').then(m => m.BeanDetail),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./bean-form/bean-form').then(m => m.BeanForm),
  },
];
