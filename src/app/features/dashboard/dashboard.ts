import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { FormatDatePipe } from '@shared/pipes/format-date.pipe';
import { DecimalPipe } from '@angular/common';
import { BrewLog, Bean, BrewStatistics } from '@core/models/models';
import { getBeanNames } from '@shared/utils/utils';

@Component({
  selector: 'brew-dashboard',
  standalone: true,
  imports: [RouterLink, Card, Button, DecimalPipe, FormatDatePipe],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <div class="greeting">
          <h1>{{ greeting() }}, {{ userName() }}</h1>
          <p class="date">{{ today }}</p>
        </div>

        <div class="header-actions">
          <a routerLink="/profile" class="profile-btn mobile-only">
            <span class="avatar">
              @if (user()?.photoURL) {
                <img [src]="user()!.photoURL" [alt]="user()!.displayName" />
              } @else {
                {{ userInitials() }}
              }
            </span>
          </a>

          <a routerLink="/brews/new" class="quick-add">
            <brew-button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Log Brew
            </brew-button>
          </a>
        </div>
      </header>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <!-- Streak Card -->
        <brew-card class="stat-card stat-card--streak">
          <div class="stat-content">
            <div class="stat-icon streak-icon">🔥</div>
            <div class="stat-info">
              <span class="stat-value">{{ stats()?.totalBrews || 0 }}</span>
              <span class="stat-label">Total Brews</span>
            </div>
          </div>
          <div class="streak-dots">
            @for (day of weekDays; track day.label; let i = $index) {
              <div class="streak-day" [class.active]="isStreakDay(i)">
                <span class="day-label">{{ day.label }}</span>
                <span class="day-dot"></span>
              </div>
            }
          </div>
        </brew-card>

        <!-- Rating Card -->
        <brew-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">⭐</div>
            <div class="stat-info">
              <span class="stat-value">{{
                (user()?.stats?.averageRating || 0) | number : '1.1-1'
              }}</span>
              <span class="stat-label">Avg Rating</span>
            </div>
          </div>
          <div class="rating-bar">
            <div
              class="rating-fill"
              [style.width.%]="(user()?.stats?.averageRating || 0) * 10"
            ></div>
          </div>
        </brew-card>

        <!-- Methods Card -->
        <brew-card class="stat-card" [clickable]="true" routerLink="/methods">
          <div class="stat-content">
            <div class="stat-icon">📖</div>
            <div class="stat-info">
              <span class="stat-value">{{ user()?.stats?.totalBrewMethods || 0 }}</span>
              <span class="stat-label">Methods</span>
            </div>
          </div>
        </brew-card>

        <!-- Current Streak Card -->
        <brew-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <span class="stat-value">{{ user()?.stats?.currentStreak || 0 }}</span>
              <span class="stat-label">Day Streak</span>
            </div>
          </div>
        </brew-card>
      </div>

      <!-- Activity Chart -->
      <brew-card title="Brew Activity" subtitle="Last 30 days" class="chart-card">
        <div class="activity-chart">
          @for (day of brewsByDay(); track day.date) {
            <div
              class="chart-bar"
              [style.height.%]="getBarHeight(day.count)"
              [class.chart-bar--today]="isToday(day.date)"
              [title]="day.date + ': ' + day.count + ' brews'"
            ></div>
          }
        </div>
        <div class="chart-labels">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </brew-card>

      <!-- Recent Brews -->
      <section class="recent-section">
        <div class="section-header">
          <h2>Recent Brews</h2>
          <a routerLink="/brews" class="view-all">View all →</a>
        </div>

        @if (loading()) {
          <div class="loading-state">
            @for (i of [1, 2, 3]; track i) {
              <div class="skeleton-card"></div>
            }
          </div>
        } @else if (recentBrews().length === 0) {
          <brew-card class="empty-state">
            <div class="empty-content">
              <span class="empty-icon">☕</span>
              <h3>No brews yet</h3>
              <p>Start tracking your coffee journey by logging your first brew.</p>
              <a routerLink="/brews/new">
                <brew-button>Log Your First Brew</brew-button>
              </a>
            </div>
          </brew-card>
        } @else {
          <div class="brew-list">
            @for (brew of recentBrews(); track brew.id) {
              <a [routerLink]="['/brews', brew.id]" class="brew-item">
                <brew-card [hoverable]="true">
                  <div class="brew-content">
                    <div class="brew-info">
                      <span class="brew-beans">{{ getBeanNamesForBrew(brew) }}</span>
                      <span class="brew-date">{{ brew.date | formatDate }}</span>
                    </div>
                    <div class="brew-meta">
                      <span class="brew-params">
                        {{ brew.params.coffeeGrams }}g · {{ brew.params.waterGrams }}g · 1:{{
                          brew.params.ratio
                        }}
                      </span>
                      <div class="brew-rating">
                        @for (star of [1, 2, 3, 4, 5]; track star) {
                          <span class="star" [class.filled]="brew.rating / 2 >= star">★</span>
                        }
                      </div>
                    </div>
                  </div>
                </brew-card>
              </a>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: `
    .dashboard {
      max-width: var(--container-lg);
      margin: 0 auto;
      animation: fadeIn var(--duration-normal) var(--ease-out);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-8);
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .greeting {
      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        font-weight: var(--weight-semibold);
        color: var(--text-primary);
        margin: 0 0 var(--space-1);
      }

      .date {
        color: var(--text-tertiary);
        font-size: var(--text-base);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .profile-btn {
      display: none;
      text-decoration: none;

      @media (max-width: 768px) {
        display: flex;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        background: linear-gradient(135deg, var(--color-copper-400), var(--color-copper-500));
        color: var(--color-white);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--text-sm);
        font-weight: var(--weight-semibold);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .mobile-only {
      display: none;

      @media (max-width: 768px) {
        display: flex;
      }
    }

    // Stats Grid
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-8);
    }

    .stat-card {
      &--streak {
        grid-column: span 2;

        @media (max-width: 600px) {
          grid-column: span 1;
        }
      }
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    .stat-icon {
      font-size: 2rem;
      line-height: 1;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      line-height: 1.1;
    }

    .stat-label {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }

    // Streak dots
    .streak-dots {
      display: flex;
      gap: var(--space-3);
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-subtle);
    }

    .streak-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      flex: 1;
    }

    .day-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-weight: var(--weight-medium);
    }

    .day-dot {
      width: 12px;
      height: 12px;
      border-radius: var(--radius-full);
      background: var(--color-cream-300);
      transition: background var(--duration-fast) var(--ease-default);
    }

    .streak-day.active .day-dot {
      background: var(--color-copper-500);
    }

    // Rating bar
    .rating-bar {
      height: 6px;
      background: var(--color-cream-200);
      border-radius: var(--radius-full);
      margin-top: var(--space-4);
      overflow: hidden;
    }

    .rating-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-copper-400), var(--color-copper-500));
      border-radius: var(--radius-full);
      transition: width var(--duration-slow) var(--ease-out);
    }

    // Activity Chart
    .chart-card {
      margin-bottom: var(--space-8);
    }

    .activity-chart {
      display: flex;
      align-items: flex-end;
      gap: 2px;
      height: 80px;
      padding-top: var(--space-4);
    }

    .chart-bar {
      flex: 1;
      background: var(--color-cream-200);
      border-radius: 2px 2px 0 0;
      min-height: 4px;
      transition: background var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--color-copper-400);
      }

      &--today {
        background: var(--color-copper-500);
      }
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    // Recent Brews
    .recent-section {
      margin-top: var(--space-8);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-4);

      h2 {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        font-weight: var(--weight-semibold);
        margin: 0;
      }

      .view-all {
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        color: var(--text-accent);
      }
    }

    .brew-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .brew-item {
      text-decoration: none;
      color: inherit;
    }

    .brew-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-4);

      @media (max-width: 500px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .brew-info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .brew-beans {
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }

    .brew-date {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .brew-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--space-1);

      @media (max-width: 500px) {
        flex-direction: row;
        align-items: center;
        width: 100%;
        justify-content: space-between;
      }
    }

    .brew-params {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--text-tertiary);
    }

    .brew-rating {
      display: flex;
      gap: 2px;

      .star {
        color: var(--color-cream-300);
        font-size: var(--text-sm);

        &.filled {
          color: var(--color-copper-400);
        }
      }
    }

    // Empty & Loading States
    .empty-state {
      text-align: center;
    }

    .empty-content {
      padding: var(--space-8) var(--space-4);

      .empty-icon {
        font-size: 3rem;
        display: block;
        margin-bottom: var(--space-4);
        opacity: 0.5;
      }

      h3 {
        font-family: var(--font-display);
        font-size: var(--text-lg);
        margin: 0 0 var(--space-2);
      }

      p {
        color: var(--text-tertiary);
        margin-bottom: var(--space-6);
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .skeleton-card {
      height: 80px;
      border-radius: var(--radius-xl);
      background: linear-gradient(
        90deg,
        var(--color-cream-200) 0%,
        var(--color-cream-100) 50%,
        var(--color-cream-200) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `,
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  user = this.authService.currentUser;

  loading = signal(true);
  recentBrews = signal<BrewLog[]>([]);
  beans = signal<Bean[]>([]);
  stats = signal<BrewStatistics | null>(null);

  brewsByDay = computed(() => this.stats()?.brewsByDay || []);

  weekDays = [
    { label: 'M' },
    { label: 'T' },
    { label: 'W' },
    { label: 'T' },
    { label: 'F' },
    { label: 'S' },
    { label: 'S' },
  ];

  today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  userName = computed(() => {
    const name = this.user()?.displayName || 'there';
    return name.split(' ')[0];
  });

  userInitials = computed(() => {
    const name = this.user()?.displayName || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  async ngOnInit(): Promise<void> {
    try {
      const [brews, beans, stats] = await Promise.all([
        this.firestoreService.getRecentBrewLogs(5),
        this.firestoreService.getAllBeans(),
        this.firestoreService.getBrewStatistics(),
      ]);

      this.recentBrews.set(brews);
      this.beans.set(beans);
      this.stats.set(stats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getBeanNamesForBrew(brew: BrewLog): string {
    return getBeanNames(brew.beanIds, this.beans());
  }

  isStreakDay(index: number): boolean {
    const streak = this.user()?.stats?.currentStreak || 0;
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;
    const dayIndex = adjustedToday - index;
    return dayIndex >= 0 && dayIndex < streak;
  }

  getBarHeight(count: number): number {
    const max = Math.max(...this.brewsByDay().map((d) => d.count), 1);
    return Math.max((count / max) * 100, 4);
  }

  isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split('T')[0];
  }
}
