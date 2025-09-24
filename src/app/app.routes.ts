import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login',   loadComponent: () => import('./features/login.component').then(m => m.LoginComponent) },
  { path: 'health',  loadComponent: () => import('./features/health/health.component').then(m => m.HealthComponent) },
  { path: 'facturas', canActivate: [authGuard],
    loadComponent: () => import('./features/facturas/facturas.page/facturas.page').then(m => m.FacturasPage) },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
];
