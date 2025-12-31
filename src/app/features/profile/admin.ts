import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '@shared/ui/card/card';

@Component({
  selector: 'brew-admin',
  standalone: true,
  imports: [Card],
  template: `
    <div class="page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1>Admin</h1>
        <p class="subtitle">Admin controls</p>
      </header>

      <brew-card class="placeholder">
        <div class="placeholder-content">
          <span class="placeholder-icon">🔒</span>
          <h3>Admin Panel</h3>
          <p>Admin features coming soon.</p>
        </div>
      </brew-card>
    </div>
  `,
  styles: `
    .page {
      max-width: 700px;
      margin: 0 auto;
      animation: fadeIn var(--duration-normal) var(--ease-out);
    }

    .page-header {
      margin-bottom: var(--space-6);

      .back-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        color: var(--text-tertiary);
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        margin-bottom: var(--space-3);

        &:hover { color: var(--text-primary); }
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0 0 var(--space-2);
      }

      .subtitle {
        color: var(--text-tertiary);
        margin: 0;
      }
    }

    .placeholder {
      text-align: center;
    }

    .placeholder-content {
      padding: var(--space-12) var(--space-4);

      .placeholder-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: var(--space-4);
        opacity: 0.5;
      }

      h3 {
        font-family: var(--font-display);
        margin: 0 0 var(--space-2);
      }

      p {
        color: var(--text-tertiary);
        margin: 0;
      }
    }
  `,
})
export class Admin {
  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
