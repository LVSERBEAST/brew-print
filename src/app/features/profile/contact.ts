import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { ToastService } from '@core/services/toast.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'brew-contact',
  standalone: true,
  imports: [FormsModule, Card, Button, InputComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1>Contact Us</h1>
      </header>

      <brew-card class="contact-card">
        <p class="intro">
          We'd love to hear from you! Whether you have a question, feedback, or
          just want to share your latest brew discovery, drop us a line.
        </p>

        <form (ngSubmit)="onSubmit()" class="contact-form">
          <brew-input
            label="Name"
            [(ngModel)]="formData.name"
            name="name"
            [required]="true"
          />

          <brew-input
            label="Email"
            type="email"
            [(ngModel)]="formData.email"
            name="email"
            [required]="true"
          />

          <div class="select-wrapper">
            <label class="select-label">Topic</label>
            <select
              class="select-input"
              [(ngModel)]="formData.topic"
              name="topic"
            >
              <option value="general">General Inquiry</option>
              <option value="feedback">Feedback</option>
              <option value="bug">Report a Bug</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="textarea-wrapper">
            <label class="textarea-label">Message</label>
            <textarea
              class="textarea"
              [(ngModel)]="formData.message"
              name="message"
              rows="5"
              placeholder="Tell us what's on your mind..."
              required
            ></textarea>
          </div>

          <brew-button
            type="submit"
            [fullWidth]="true"
            [loading]="sending()"
            [disabled]="!isValid()"
          >
            Send Message
          </brew-button>
        </form>
      </brew-card>

      <brew-card class="alt-contact">
        <h3>Other Ways to Reach Us</h3>
        <div class="contact-methods">
          <a href="mailto:support@brewprint.app" class="contact-method">
            <span class="method-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <span class="method-info">
              <span class="method-label">Email</span>
              <span class="method-value">support&#64;brewprint.app</span>
            </span>
          </a>
          <a
            href="https://twitter.com/brewprintapp"
            target="_blank"
            rel="noopener"
            class="contact-method"
          >
            <span class="method-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
                />
              </svg>
            </span>
            <span class="method-info">
              <span class="method-label">Twitter</span>
              <span class="method-value">&#64;brewprintapp</span>
            </span>
          </a>
        </div>
      </brew-card>
    </div>
  `,
  styles: `
    .page {
      max-width: 600px;
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

        &:hover {
          color: var(--text-primary);
        }
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0;
      }
    }

    .contact-card {
      margin-bottom: var(--space-4);
    }

    .intro {
      color: var(--text-secondary);
      margin-bottom: var(--space-6);
      line-height: var(--leading-relaxed);
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .select-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
    }

    .select-input {
      width: 100%;
      height: 48px;
      padding: 0 var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-size: var(--text-base);
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23635d55' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-4) center;
      padding-right: var(--space-10);

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .textarea-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .textarea-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
    }

    .textarea {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-family: inherit;
      font-size: var(--text-base);
      resize: vertical;
      min-height: 120px;

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .alt-contact {
      h3 {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        margin: 0 0 var(--space-4);
      }
    }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .contact-method {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3);
      background: var(--surface-subtle);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: inherit;
      transition: background var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--color-cream-200);
      }
    }

    .method-icon {
      display: flex;
      color: var(--color-copper-500);
    }

    .method-info {
      display: flex;
      flex-direction: column;
    }

    .method-label {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .method-value {
      font-weight: var(--weight-medium);
    }
  `,
})
export class Contact {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  sending = signal(false);

  formData = {
    name: this.authService.currentUser()?.displayName || '',
    email: this.authService.currentUser()?.email || '',
    topic: 'general',
    message: '',
  };

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  isValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.email &&
      this.formData.message
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.sending.set(true);

    // Simulate sending (in production, this would call a backend)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.toastService.success("Message sent! We'll get back to you soon.");
    this.formData.message = '';
    this.sending.set(false);
  }
}
