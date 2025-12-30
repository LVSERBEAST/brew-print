import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'brew-profile',
  standalone: true,
  imports: [FormsModule, Card, Button, DecimalPipe],
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
            <div class="stat"><span class="stat-value">{{ user()?.stats?.totalBrews || 0 }}</span><span class="stat-label">Total Brews</span></div>
            <div class="stat"><span class="stat-value">{{ (user()?.stats?.averageRating || 0) | number:'1.1-1' }}</span><span class="stat-label">Avg Rating</span></div>
            <div class="stat"><span class="stat-value">{{ user()?.stats?.currentStreak || 0 }}</span><span class="stat-label">Current Streak</span></div>
            <div class="stat"><span class="stat-value">{{ user()?.stats?.longestStreak || 0 }}</span><span class="stat-label">Best Streak</span></div>
            <div class="stat"><span class="stat-value">{{ user()?.stats?.totalBeans || 0 }}</span><span class="stat-label">Beans</span></div>
            <div class="stat"><span class="stat-value">{{ user()?.stats?.totalEquipment || 0 }}</span><span class="stat-label">Equipment</span></div>
          </div>
        </brew-card>
        
        <brew-card title="Preferences">
          <div class="pref-row">
            <label>Default Water Temp</label>
            <div class="pref-input">
              <input type="number" [(ngModel)]="prefs.defaultWaterTemp" [min]="0" [max]="100" />
              <span>°C</span>
            </div>
          </div>
          <div class="pref-row">
            <label>Default Ratio</label>
            <div class="pref-input">
              <span>1:</span>
              <input type="number" [(ngModel)]="prefs.defaultRatio" [min]="1" [max]="30" [step]="0.5" />
            </div>
          </div>
          <brew-button (onClick)="savePrefs()" [loading]="saving()">Save Preferences</brew-button>
        </brew-card>
        
        <brew-card title="Account">
          <brew-button variant="danger" (onClick)="signOut()">Sign Out</brew-button>
        </brew-card>
      </div>
    </div>
  `,
  styles: `
    .page { max-width: 800px; margin: 0 auto; animation: fadeIn var(--duration-normal) var(--ease-out); }
    .page-header { margin-bottom: var(--space-6); h1 { font-family: var(--font-display); font-size: var(--text-3xl); margin: 0; } }
    
    .profile-grid { display: flex; flex-direction: column; gap: var(--space-4); }
    
    .avatar-section { display: flex; align-items: center; gap: var(--space-5); }
    .avatar { width: 80px; height: 80px; border-radius: var(--radius-full); background: linear-gradient(135deg, var(--color-copper-400), var(--color-copper-500)); color: white; display: flex; align-items: center; justify-content: center; font-size: var(--text-2xl); font-weight: var(--weight-semibold); overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
    .user-info { h2 { font-family: var(--font-display); font-size: var(--text-xl); margin: 0 0 var(--space-1); } p { color: var(--text-muted); margin: 0; } }
    
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); @media (max-width: 500px) { grid-template-columns: repeat(2, 1fr); } }
    .stat { text-align: center; .stat-value { font-family: var(--font-display); font-size: var(--text-2xl); font-weight: var(--weight-semibold); display: block; } .stat-label { font-size: var(--text-sm); color: var(--text-muted); } }
    
    .pref-row { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) 0; border-bottom: 1px solid var(--border-subtle); label { font-weight: var(--weight-medium); } }
    .pref-input { display: flex; align-items: center; gap: var(--space-2); input { width: 80px; height: 40px; padding: 0 var(--space-3); border: 2px solid var(--border-default); border-radius: var(--radius-md); text-align: center; font-family: var(--font-mono); &:focus { outline: none; border-color: var(--border-focus); } } span { color: var(--text-muted); } }
    
    brew-button { margin-top: var(--space-4); }
  `
})
export class Profile {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  
  user = this.authService.currentUser;
  saving = signal(false);
  
  initials = computed(() => {
    const name = this.user()?.displayName || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  });
  
  prefs = {
    defaultWaterTemp: 93,
    defaultRatio: 16
  };
  
  constructor() {
    const user = this.authService.currentUser();
    if (user?.preferences) {
      this.prefs = { ...user.preferences };
    }
  }
  
  async savePrefs(): Promise<void> {
    this.saving.set(true);
    try {
      await this.authService.updatePreferences(this.prefs);
      this.toastService.success('Preferences saved!');
    } catch {
      this.toastService.error('Failed to save');
    } finally {
      this.saving.set(false);
    }
  }
  
  signOut(): void {
    this.authService.signOut();
  }
}
