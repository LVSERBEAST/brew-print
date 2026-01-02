import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { Card } from '@shared/ui/card/card';

@Component({
  selector: 'brew-register',
  standalone: true,
  imports: [RouterLink, FormsModule, Button, InputComponent, Card],
  template: `
    <div class="register-container">
      <div class="register-header">
        <span class="logo-icon">☕</span>
        <h1 class="logo-text">BrewPrint</h1>
        <p class="tagline">Start tracking your coffee journey.</p>
      </div>

      <brew-card>
        <form (ngSubmit)="onSubmit()" class="register-form">
          <h2 class="form-title">Create your account</h2>

          @if (authService.error()) {
          <div class="error-banner">
            {{ authService.error() }}
          </div>
          }

          <brew-input
            label="Name"
            type="text"
            placeholder="Your name"
            [(ngModel)]="displayName"
            name="displayName"
            [required]="true"
          />

          <brew-input
            label="Email"
            type="email"
            placeholder="you@example.com"
            [(ngModel)]="email"
            name="email"
            [required]="true"
          />

          <brew-input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            [(ngModel)]="password"
            name="password"
            hint="Must be at least 8 characters"
            [required]="true"
          />

          <brew-button
            type="submit"
            [fullWidth]="true"
            [loading]="authService.loading()"
            [disabled]="!isValid()"
          >
            Create Account
          </brew-button>

          <div class="divider">
            <span>or continue with</span>
          </div>

          <button
            type="button"
            class="google-btn"
            (click)="signInWithGoogle()"
            [disabled]="authService.loading()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign up with Google
          </button>

          <p class="login-link">
            Already have an account?
            <a routerLink="/auth/login">Sign in</a>
          </p>
        </form>
      </brew-card>
    </div>
  `,
  styles: `
    .register-container {
      width: 100%;
      max-width: 420px;
      animation: fadeInUp var(--duration-normal) var(--ease-out);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: var(--space-8);
    }
    
    .logo-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: var(--space-3);
    }
    
    .logo-text {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin: 0 0 var(--space-2);
    }
    
    .tagline {
      color: var(--text-tertiary);
      font-size: var(--text-base);
      margin: 0;
    }
    
    .register-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }
    
    .form-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      text-align: center;
      margin: 0;
    }
    
    .error-banner {
      padding: var(--space-3) var(--space-4);
      background: var(--color-error-light);
      color: var(--color-error-dark);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
    }
    
    .divider {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      color: var(--text-muted);
      font-size: var(--text-sm);
      
      &::before,
      &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border-subtle);
      }
    }
    
    .google-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      width: 100%;
      height: 48px;
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-family: inherit;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      cursor: pointer;
      transition: 
        background var(--duration-fast) var(--ease-default),
        border-color var(--duration-fast) var(--ease-default);
      
      &:hover:not(:disabled) {
        background: var(--surface-subtle);
        border-color: var(--border-strong);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .login-link {
      text-align: center;
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin: 0;
      
      a {
        color: var(--text-accent);
        font-weight: var(--weight-medium);
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `,
})
export class Register {
  authService = inject(AuthService);

  displayName = '';
  email = '';
  password = '';

  isValid(): boolean {
    return (
      this.displayName.length >= 2 &&
      this.email.length > 0 &&
      this.password.length >= 8
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    try {
      await this.authService.signUpWithEmail(
        this.email,
        this.password,
        this.displayName
      );
    } catch {
      // Error handled by service
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
    } catch {
      // Error handled by service
    }
  }
}
