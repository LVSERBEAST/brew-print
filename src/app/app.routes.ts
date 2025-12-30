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
        loadComponent: () => import('@features/dashboard/dashboard').then(m => m.Dashboard),
        data: { animation: 'dashboard' }
      },
      {
        path: 'brews',
        loadChildren: () => import('@features/brew-logs/brew-logs.routes').then(m => m.BREW_LOG_ROUTES),
        data: { animation: 'brews' }
      },
      {
        path: 'beans',
        loadChildren: () => import('@features/beans/beans.routes').then(m => m.BEAN_ROUTES),
        data: { animation: 'beans' }
      },
      {
        path: 'equipment',
        loadChildren: () => import('@features/equipment/equipment.routes').then(m => m.EQUIPMENT_ROUTES),
        data: { animation: 'equipment' }
      },
      {
        path: 'techniques',
        loadChildren: () => import('@features/techniques/techniques.routes').then(m => m.TECHNIQUE_ROUTES),
        data: { animation: 'techniques' }
      },
      {
        path: 'profile',
        loadComponent: () => import('@features/profile/profile').then(m => m.Profile),
        data: { animation: 'profile' }
      }
    ]
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('@features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('@features/auth/register/register').then(m => m.Register)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
