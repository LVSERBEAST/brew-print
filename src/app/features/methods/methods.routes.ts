import { Routes } from '@angular/router';

export const METHOD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./method-list/method-list').then((m) => m.MethodList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./method-form/method-form').then((m) => m.MethodForm),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./method-detail/method-detail').then((m) => m.MethodDetail),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./method-form/method-form').then((m) => m.MethodForm),
  },
];
