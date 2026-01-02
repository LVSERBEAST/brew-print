import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ThemeService, Theme } from '@core/services/theme.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';

@Component({
  selector: 'brew-settings',
  standalone: true,
  imports: [FormsModule, Card, Button],
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
        <h1>Settings</h1>
      </header>

      <!-- Profile Settings -->
      <brew-card title="Profile" class="settings-card">
        <div class="setting-row">
          <label>Display Name</label>
          <input
            type="text"
            class="setting-input"
            [(ngModel)]="displayName"
            placeholder="Your name"
          />
        </div>
        <brew-button [loading]="savingProfile()" (onClick)="saveProfile()"
          >Save Profile</brew-button
        >
      </brew-card>

      <!-- Email Settings -->
      <brew-card title="Email" class="settings-card">
        <div class="setting-row">
          <label>Current Email</label>
          <span class="current-value">{{ user()?.email }}</span>
        </div>
        <div class="setting-row">
          <label>New Email</label>
          <input
            type="email"
            class="setting-input"
            [(ngModel)]="newEmail"
            placeholder="new@email.com"
          />
        </div>
        <div class="setting-row">
          <label>Current Password</label>
          <input
            type="password"
            class="setting-input"
            [(ngModel)]="emailPassword"
            placeholder="Required to change email"
          />
        </div>
        <brew-button
          [loading]="savingEmail()"
          [disabled]="!newEmail || !emailPassword"
          (onClick)="updateEmail()"
          >Update Email</brew-button
        >
      </brew-card>

      <!-- Password Settings -->
      <brew-card title="Password" class="settings-card">
        <div class="setting-row">
          <label>Current Password</label>
          <input
            type="password"
            class="setting-input"
            [(ngModel)]="currentPassword"
            placeholder="Current password"
          />
        </div>
        <div class="setting-row">
          <label>New Password</label>
          <input
            type="password"
            class="setting-input"
            [(ngModel)]="newPassword"
            placeholder="At least 8 characters"
          />
        </div>
        <div class="setting-row">
          <label>Confirm New Password</label>
          <input
            type="password"
            class="setting-input"
            [(ngModel)]="confirmPassword"
            placeholder="Confirm new password"
          />
        </div>
        <brew-button
          [loading]="savingPassword()"
          [disabled]="
            !currentPassword || !newPassword || newPassword !== confirmPassword
          "
          (onClick)="updatePassword()"
          >Update Password</brew-button
        >
      </brew-card>

      <!-- Appearance -->
      <brew-card title="Appearance" class="settings-card">
        <div class="theme-options">
          <button
            class="theme-option"
            [class.active]="themeService.theme() === 'light'"
            (click)="setTheme('light')"
          >
            <span class="theme-icon">☀️</span>
            <span class="theme-label">Light</span>
          </button>
          <button
            class="theme-option"
            [class.active]="themeService.theme() === 'dark'"
            (click)="setTheme('dark')"
          >
            <span class="theme-icon">🌙</span>
            <span class="theme-label">Dark</span>
          </button>
          <button
            class="theme-option"
            [class.active]="themeService.theme() === 'system'"
            (click)="setTheme('system')"
          >
            <span class="theme-icon">💻</span>
            <span class="theme-label">System</span>
          </button>
        </div>
      </brew-card>

      <!-- Notifications -->
      <brew-card title="Notifications" class="settings-card">
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">Email Updates</span>
            <span class="toggle-desc">Receive news and updates via email</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              [(ngModel)]="notifications.emailUpdates"
              (change)="saveNotifications()"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">Brew Reminders</span>
            <span class="toggle-desc">Daily reminder to log your brew</span>
          </div>
          <label class="toggle">
            <input
              type="checkbox"
              [(ngModel)]="notifications.brewReminders"
              (change)="saveNotifications()"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </brew-card>

      <!-- Measurement System -->
      <brew-card title="Units" class="settings-card">
        <div class="setting-row">
          <label>Measurement System</label>
          <select
            class="setting-select"
            [(ngModel)]="measurementSystem"
            (change)="saveMeasurement()"
          >
            <option value="metric">Metric (grams, Celsius)</option>
            <option value="imperial">Imperial (ounces, Fahrenheit)</option>
          </select>
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

    .settings-card {
      margin-bottom: var(--space-4);
    }

    .setting-row {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);

      label {
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        color: var(--text-secondary);
      }

      .current-value {
        color: var(--text-muted);
      }
    }

    .setting-input,
    .setting-select {
      width: 100%;
      height: 48px;
      padding: 0 var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-size: var(--text-base);

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .setting-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23635d55' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right var(--space-4) center;
      padding-right: var(--space-10);
    }

    .theme-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }

    .theme-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4);
      background: var(--surface-subtle);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--color-cream-200);
      }

      &.active {
        background: var(--color-copper-100);
        border-color: var(--color-copper-400);
      }

      .theme-icon {
        font-size: 1.5rem;
      }

      .theme-label {
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
      }
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-subtle);

      &:last-child {
        border-bottom: none;
      }
    }

    .toggle-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .toggle-label {
      font-weight: var(--weight-medium);
    }

    .toggle-desc {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .toggle {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 28px;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .toggle-slider {
          background: var(--color-copper-500);

          &::before {
            transform: translateX(24px);
          }
        }
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        inset: 0;
        background: var(--color-cream-300);
        border-radius: var(--radius-full);
        transition: background var(--duration-fast) var(--ease-default);

        &::before {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: var(--radius-full);
          transition: transform var(--duration-fast) var(--ease-default);
          box-shadow: var(--shadow-sm);
        }
      }
    }
  `,
})
export class Settings {
  private router = inject(Router);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  private toastService = inject(ToastService);

  user = this.authService.currentUser;

  // Profile
  displayName = this.user()?.displayName || '';
  savingProfile = signal(false);

  // Email
  newEmail = '';
  emailPassword = '';
  savingEmail = signal(false);

  // Password
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  savingPassword = signal(false);

  // Preferences
  notifications = {
    emailUpdates: this.user()?.preferences?.notifications?.emailUpdates ?? true,
    brewReminders:
      this.user()?.preferences?.notifications?.brewReminders ?? false,
  };
  measurementSystem = this.user()?.preferences?.measurementSystem || 'metric';

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  async saveProfile(): Promise<void> {
    if (!this.displayName) return;

    this.savingProfile.set(true);
    try {
      await this.authService.updateUserProfile({
        displayName: this.displayName,
      });
      this.toastService.success('Profile updated');
    } catch {
      this.toastService.error('Failed to update profile');
    } finally {
      this.savingProfile.set(false);
    }
  }

  async updateEmail(): Promise<void> {
    if (!this.newEmail || !this.emailPassword) return;

    this.savingEmail.set(true);
    try {
      await this.authService.updateUserEmail(this.newEmail, this.emailPassword);
      this.toastService.success('Email updated');
      this.newEmail = '';
      this.emailPassword = '';
    } catch {
      this.toastService.error('Failed to update email. Check your password.');
    } finally {
      this.savingEmail.set(false);
    }
  }

  async updatePassword(): Promise<void> {
    if (
      !this.currentPassword ||
      !this.newPassword ||
      this.newPassword !== this.confirmPassword
    ) {
      return;
    }

    this.savingPassword.set(true);
    try {
      await this.authService.updateUserPassword(
        this.currentPassword,
        this.newPassword
      );
      this.toastService.success('Password updated');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch {
      this.toastService.error(
        'Failed to update password. Check your current password.'
      );
    } finally {
      this.savingPassword.set(false);
    }
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.authService.updatePreferences({ theme });
  }

  async saveNotifications(): Promise<void> {
    try {
      await this.authService.updatePreferences({
        notifications: this.notifications,
      });
    } catch {
      this.toastService.error('Failed to save');
    }
  }

  async saveMeasurement(): Promise<void> {
    try {
      await this.authService.updatePreferences({
        measurementSystem: this.measurementSystem as 'metric' | 'imperial',
      });
    } catch {
      this.toastService.error('Failed to save');
    }
  }
}
