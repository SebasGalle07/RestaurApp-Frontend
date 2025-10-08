import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  navLinks = [
    { path: 'pos', label: 'POS' },
    { path: 'pedidos', label: 'Pedidos' },
    { path: 'pagos', label: 'Caja' },
    { path: 'facturas', label: 'Facturas' },
    { path: 'menu', label: 'Menú' },
    { path: 'usuarios', label: 'Equipo' }
  ];

  get protectedLinks() {
    return this.authService.isAuthenticated() ? this.navLinks : [];
  }

  get currentRoleLabel(): string {
    const role = this.authService.currentRole();
    if (!role) return 'Invitado';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  get userInitials(): string {
    const subject = this.authService.currentSubject();
    if (subject) {
      const base = subject.split('@')[0] ?? subject;
      const cleaned = base.replace(/[^a-zA-Z]/g, ' ').trim();
      if (cleaned.length === 0) return subject.slice(0, 2).toUpperCase();
      const parts = cleaned.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    const fallback = this.authService.currentRole();
    return fallback ? fallback.slice(0, 2).toUpperCase() : '??';
  }

  get userDisplayName(): string {
    const subject = this.authService.currentSubject();
    if (subject) {
      const [local] = subject.split('@');
      return local ?? subject;
    }
    return 'Usuario';
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
