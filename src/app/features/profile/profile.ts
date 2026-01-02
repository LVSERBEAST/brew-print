import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { APP_VERSION_DISPLAY } from '@shared/constants/constants';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'brew-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, Card, Button, DecimalPipe],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Profile</h1>
      </header>

      <div class="profile-grid">
        <brew-card class="profile-card">
          <div class="avatar-section">
            <div class="avatar">
              @if (user()?.photoURL) {
              <img [src]="user()!.photoURL" [alt]="user()!.displayName" />
              } @else {
              {{ initials() }}
              }
            </div>
            <div class="user-info">
              <h2>{{ user()?.displayName }}</h2>
              <p>{{ user()?.email }}</p>
            </div>
          </div>
        </brew-card>

        <brew-card title="Statistics">
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-value">{{
                user()?.stats?.totalBrews || 0
              }}</span>
              <span class="stat-label">Total Brews</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{
                user()?.stats?.averageRating || 0 | number : '1.1-1'
              }}</span>
              <span class="stat-label">Avg Rating</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{
                user()?.stats?.currentStreak || 0
              }}</span>
              <span class="stat-label">Current Streak</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{
                user()?.stats?.longestStreak || 0
              }}</span>
              <span class="stat-label">Best Streak</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{
                user()?.stats?.totalBeans || 0
              }}</span>
              <span class="stat-label">Beans</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{
                user()?.stats?.totalEquipment || 0
              }}</span>
              <span class="stat-label">Equipment</span>
            </div>
          </div>
        </brew-card>

        <!-- Menu Items -->
        <nav class="menu-list">
          <a routerLink="settings" class="menu-item">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </span>
            <span class="menu-label">Settings</span>
            <span class="menu-arrow">→</span>
          </a>

          <a routerLink="news" class="menu-item">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"
                />
                <path d="M18 14h-8" />
                <path d="M15 18h-5" />
                <path d="M10 6h8v4h-8V6Z" />
              </svg>
            </span>
            <span class="menu-label">News</span>
            <span class="menu-arrow">→</span>
          </a>

          <a routerLink="about" class="menu-item">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <span class="menu-label">About</span>
            <span class="menu-arrow">→</span>
          </a>

          <a routerLink="contact" class="menu-item">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
            <span class="menu-label">Contact</span>
            <span class="menu-arrow">→</span>
          </a>

          <a routerLink="faq" class="menu-item">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span class="menu-label">FAQ</span>
            <span class="menu-arrow">→</span>
          </a>

          @if (user()?.isAdmin) {
          <a routerLink="admin" class="menu-item menu-item--admin">
            <span class="menu-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <span class="menu-label">Admin</span>
            <span class="menu-arrow">→</span>
          </a>
          }
        </nav>

        <!-- Sign Out -->
        <button class="sign-out-btn" (click)="signOut()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>

        <!-- Delete Account -->
        <button
          class="delete-account-btn"
          (click)="showDeleteConfirm.set(true)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
          Delete Account
        </button>

        <!-- Version -->
        <div class="version-info">{{ versionDisplay }}</div>
      </div>

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
      <div class="modal-overlay" (click)="showDeleteConfirm.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Delete Account</h3>
          <p>
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
          <p>Enter your password to confirm:</p>
          <input
            type="password"
            class="password-input"
            [(ngModel)]="deletePassword"
            placeholder="Password"
          />
          <div class="modal-actions">
            <brew-button
              variant="secondary"
              (onClick)="showDeleteConfirm.set(false)"
              >Cancel</brew-button
            >
            <brew-button
              variant="danger"
              [loading]="deleting()"
              [disabled]="!deletePassword"
              (onClick)="deleteAccount()"
              >Delete Account</brew-button
            >
          </div>
        </div>
      </div>
      }
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

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0;
      }
    }

    .profile-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .avatar-section {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-copper-400), var(--color-copper-500));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-2xl);
      font-weight: var(--weight-semibold);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .user-info {
      h2 {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        margin: 0 0 var(--space-1);
      }

      p {
        color: var(--text-muted);
        margin: 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);

      @media (max-width: 500px) {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat {
      text-align: center;

      .stat-value {
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: var(--weight-semibold);
        display: block;
      }

      .stat-label {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }
    }

    .menu-list {
      display: flex;
      flex-direction: column;
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      text-decoration: none;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-subtle);
      transition: background var(--duration-fast) var(--ease-default);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--surface-subtle);
      }

      &--admin {
        color: var(--color-copper-600);
      }
    }

    .menu-icon {
      display: flex;
      color: var(--text-muted);
    }

    .menu-label {
      flex: 1;
      font-weight: var(--weight-medium);
    }

    .menu-arrow {
      color: var(--text-muted);
    }

    .sign-out-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-4);
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--surface-subtle);
      }
    }

    .delete-account-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-4);
      background: transparent;
      border: 2px solid var(--color-error);
      border-radius: var(--radius-xl);
      font-weight: var(--weight-medium);
      color: var(--color-error);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--color-error-light);
      }
    }

    .version-info {
      text-align: center;
      font-size: var(--text-sm);
      color: var(--text-muted);
      padding: var(--space-4);
    }

    // Modal
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: var(--surface-overlay);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--space-4);
    }

    .modal {
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      max-width: 400px;
      width: 100%;

      h3 {
        font-family: var(--font-display);
        margin: 0 0 var(--space-3);
        color: var(--color-error);
      }

      p {
        color: var(--text-secondary);
        margin-bottom: var(--space-4);
      }
    }

    .password-input {
      width: 100%;
      height: 48px;
      padding: 0 var(--space-4);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-size: var(--text-base);
      margin-bottom: var(--space-4);

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .modal-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: flex-end;
    }
  `,
})
export class Profile {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  user = this.authService.currentUser;
  versionDisplay = APP_VERSION_DISPLAY;

  showDeleteConfirm = signal(false);
  deleting = signal(false);
  deletePassword = '';

  initials = computed(() => {
    const name = this.user()?.displayName || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  signOut(): void {
    this.authService.signOut();
  }

  async deleteAccount(): Promise<void> {
    if (!this.deletePassword) return;

    this.deleting.set(true);
    try {
      await this.authService.deleteAccount(this.deletePassword);
      this.toastService.success('Account deleted');
    } catch {
      this.toastService.error('Failed to delete account. Check your password.');
    } finally {
      this.deleting.set(false);
      this.showDeleteConfirm.set(false);
      this.deletePassword = '';
    }
  }
}
