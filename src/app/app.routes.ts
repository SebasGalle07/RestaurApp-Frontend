import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'pos',
    loadComponent: () => import('./features/pos/pos.component').then(m => m.PosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categorias/categorias.component').then(m => m.CategoriasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mesas',
    loadComponent: () => import('./features/mesas/mesas.component').then(m => m.MesasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pedidos',
    loadComponent: () => import('./features/pedidos/pedidos.component').then(m => m.PedidosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pagos',
    loadComponent: () => import('./features/pagos/pagos.component').then(m => m.PagosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'facturas',
    loadComponent: () => import('./features/facturas/facturas.component').then(m => m.FacturasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'pos' }
];
