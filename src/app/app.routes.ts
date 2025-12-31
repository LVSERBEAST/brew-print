import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { guestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/dashboard/dashboard').then((m) => m.Dashboard),
        data: { animation: 'dashboard' },
      },
      {
        path: 'brews',
        loadChildren: () =>
          import('@features/brew-logs/brew-logs.routes').then(
            (m) => m.BREW_LOG_ROUTES
          ),
        data: { animation: 'brews' },
      },
      {
        path: 'beans',
        loadChildren: () =>
          import('@features/beans/beans.routes').then((m) => m.BEAN_ROUTES),
        data: { animation: 'beans' },
      },
      {
        path: 'equipment',
        loadChildren: () =>
          import('@features/equipment/equipment.routes').then(
            (m) => m.EQUIPMENT_ROUTES
          ),
        data: { animation: 'equipment' },
      },
      {
        path: 'methods',
        loadChildren: () =>
          import('@features/methods/methods.routes').then(
            (m) => m.METHOD_ROUTES
          ),
        data: { animation: 'methods' },
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@features/profile/profile.routes').then(
            (m) => m.PROFILE_ROUTES
          ),
        data: { animation: 'profile' },
      },
    ],
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('@features/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('@features/auth/register/register').then((m) => m.Register),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
