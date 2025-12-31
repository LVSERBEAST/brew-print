import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Card } from '@shared/ui/card/card';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: Date;
  content?: string;
}

@Component({
  selector: 'brew-news',
  standalone: true,
  imports: [Card],
  template: `
    <div class="page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <h1>News</h1>
        <p class="subtitle">Updates and announcements</p>
      </header>

      @if (loading()) {
        <div class="loading">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (news().length === 0) {
        <brew-card class="empty-state">
          <div class="empty-content">
            <span class="empty-icon">📰</span>
            <h3>No news yet</h3>
            <p>Check back later for updates and announcements.</p>
          </div>
        </brew-card>
      } @else {
        <div class="news-list">
          @for (item of news(); track item.id) {
            <brew-card class="news-item">
              <span class="news-date">{{ formatDate(item.date) }}</span>
              <h3 class="news-title">{{ item.title }}</h3>
              <p class="news-summary">{{ item.summary }}</p>
            </brew-card>
          }
        </div>
      }
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

    .news-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .news-date {
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: var(--weight-medium);
    }

    .news-title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      margin: var(--space-2) 0 var(--space-3);
      color: var(--text-primary);
    }

    .news-summary {
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      margin: 0;
    }

    .empty-state {
      text-align: center;
    }

    .empty-content {
      padding: var(--space-12) var(--space-4);

      .empty-icon {
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

    .loading {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .skeleton-card {
      height: 120px;
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      animation: pulse 1.5s ease-in-out infinite;
    }
  `,
})
export class News implements OnInit {
  private router = inject(Router);

  loading = signal(true);
  news = signal<NewsItem[]>([]);

  async ngOnInit(): Promise<void> {
    // TODO: Fetch news from Firestore
    // For now, simulate loading and show empty state
    await new Promise((r) => setTimeout(r, 500));
    this.news.set([]);
    this.loading.set(false);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
