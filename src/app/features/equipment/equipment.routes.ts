import { Routes } from '@angular/router';

export const EQUIPMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./equipment-list/equipment-list').then(m => m.EquipmentList),
  },
  {
    path: 'new',
    loadComponent: () => import('./equipment-form/equipment-form').then(m => m.EquipmentForm),
  },
  {
    path: ':id',
    loadComponent: () => import('./equipment-detail/equipment-detail').then(m => m.EquipmentDetail),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./equipment-form/equipment-form').then(m => m.EquipmentForm),
  },
];
