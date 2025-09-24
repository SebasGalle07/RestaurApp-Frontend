import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  template: `
    <div class="page">
      <div class="card">

        <header class="card-header">
          <div class="logo">L&S</div>
          <h1 class="title">RestaurantePOS</h1>
          <p class="subtitle">Inicia sesión para acceder al sistema de pedidos</p>
        </header>

        <form (ngSubmit)="login()" class="form">
          <div class="form-group">
            <label class="label" for="username">Usuario</label>
            <input id="username" class="input" placeholder="Ingresa tu usuario" [(ngModel)]="username" name="username" required>
          </div>

          <div class="form-group">
            <label class="label" for="password">Contraseña</label>
            <div class="password-wrapper">
              <input id="password" class="input" [type]="showPassword ? 'text':'password'"
                     placeholder="Ingresa tu contraseña"
                     [(ngModel)]="password" name="password" required>
              <span class="password-icon-placeholder"></span>
            </div>
          </div>

          <button class="btn" type="submit" [disabled]="loading || !username || !password">
            {{ loading ? 'Entrando…' : 'Iniciar Sesión' }}
          </button>

          <p *ngIf="error" class="error">{{ error }}</p>
        </form>

      </div>
    </div>
  `,
  styles: [`
    /* Para una mejor fidelidad, considera importar una fuente como 'Inter' o 'Poppins'
      en tu styles.css global. Ejemplo: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    */
    :host {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .page {
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 20px;
      background-color: #f8f9fa; /* Color de fondo de la imagen */
    }

    .card {
      width: 100%;
      max-width: 420px;
      background-color: #ffffff;
      border-radius: 20px; /* Bordes más redondeados */
      padding: 40px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08); /* Sombra más suave y profesional */
      display: flex;
      flex-direction: column;
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px; /* Espacio clave entre cabecera y formulario */
    }

    .logo {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      margin: 0 auto 16px;
      display: grid;
      place-items: center;
      font-size: 24px;
      font-weight: 500;
      background: #1e293b; /* Negro-azulado oscuro */
      color: #fff;
    }

    .title {
      margin: 0 0 8px;
      font-size: 26px;
      font-weight: 700;
      color: #1e293b;
    }

    .subtitle {
      margin: 0;
      font-size: 15px;
      color: #64748b; /* Gris-azulado para el subtítulo */
    }

    .form {
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .form-group {
      margin-bottom: 20px; /* Espacio consistente entre cada campo */
    }

    .label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #334155;
    }

    .input {
      width: 100%;
      padding: 14px 16px; /* Padding más generoso */
      font-size: 15px;
      color: #1e293b;
      background-color: #f8fafc; /* Fondo del input casi blanco */
      border: 1px solid #e2e8f0; /* Borde sutil */
      border-radius: 10px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .input::placeholder {
      color: #94a3b8;
    }

    .input:focus {
      border-color: #3b82f6; /* Color de foco azul para resaltar */
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .password-wrapper {
      position: relative;
    }

    /* Esto simula el punto en el campo de contraseña de tu imagen */
    .password-icon-placeholder {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 10px;
      height: 10px;
      background-color: #cbd5e1;
      border-radius: 50%;
    }

    .btn {
      width: 100%;
      padding: 14px 16px;
      margin-top: 12px; /* Espacio antes del botón */
      font-size: 16px;
      font-weight: 600;
      color: #ffffff;
      background-color: #475569; /* Tono de gris del botón */
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
    }

    .btn:hover {
      background-color: #334155;
    }

    .btn:active {
      transform: translateY(1px);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      margin-top: 16px;
      color: #dc2626;
      font-size: 14px;
      text-align: center;
      font-weight: 500;
    }
  `]
})
export class LoginComponent {
  // private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  login() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Por favor, ingresa usuario y contraseña';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      if (this.username === 'admin' && this.password === '1234') {
        this.router.navigate(['/facturas']);
      } else {
        this.error = 'Las credenciales son incorrectas';
      }
    }, 800);
  }
}
