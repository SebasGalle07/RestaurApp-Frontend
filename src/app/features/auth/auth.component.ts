import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnInit {
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);
  private redirectTo = signal<string>('/pos');

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirectTo');
    if (redirect) {
      this.redirectTo.set(redirect);
    }
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.redirectTo(), { replaceUrl: true });
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.loginForm.getRawValue();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      this.error.set('Email y password son obligatorios');
      this.loading.set(false);
      return;
    }
    const payload: LoginRequest = { email: trimmedEmail, password };
    this.authService.login(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl(this.redirectTo(), { replaceUrl: true });
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error inesperado');
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}

