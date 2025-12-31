import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { FormatTimePipe } from '@shared/pipes/format-time.pipe';
import type { BrewMethod } from '@core/models/models';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'brew-method-list',
  standalone: true,
  imports: [RouterLink, Card, Button, SlicePipe, FormatTimePipe],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Brew Methods</h1>
          <p class="subtitle">{{ methods().length }} saved</p>
        </div>
        <a routerLink="new">
          <brew-button>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Method
          </brew-button>
        </a>
      </header>

      @if (loading()) {
        <div class="loading-grid">
          @for (i of [1, 2, 3]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (methods().length === 0) {
        <brew-card class="empty-state">
          <div class="empty-content">
            <span class="empty-icon">📖</span>
            <h3>No brew methods yet</h3>
            <p>Save your brewing recipes for quick access.</p>
            <a routerLink="new">
              <brew-button>Create Brew Method</brew-button>
            </a>
          </div>
        </brew-card>
      } @else {
        <div class="method-grid">
          @for (method of methods(); track method.id) {
            <a [routerLink]="[method.id]" class="method-link">
              <brew-card [hoverable]="true" class="method-card">
                <h3 class="method-name">{{ method.name }}</h3>
                @if (method.description) {
                  <p class="method-desc">
                    {{ method.description | slice : 0 : 80 }}{{ method.description.length > 80 ? '...' : '' }}
                  </p>
                }
                <div class="method-params">
                  @if (method.params.coffeeGrams) {
                    <span>{{ method.params.coffeeGrams }}g</span>
                  }
                  @if (method.params.ratio) {
                    <span>1:{{ method.params.ratio }}</span>
                  }
                  @if (method.params.brewTimeSeconds) {
                    <span>{{ method.params.brewTimeSeconds | formatTime }}</span>
                  }
                </div>
              </brew-card>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      max-width: var(--container-lg);
      margin: 0 auto;
      animation: fadeIn var(--duration-normal) var(--ease-out);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-6);
      gap: var(--space-4);

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0 0 var(--space-1);
      }

      .subtitle {
        color: var(--text-tertiary);
        margin: 0;
      }
    }

    .method-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }

    .method-link {
      text-decoration: none;
      color: inherit;
    }

    .method-card {
      height: 100%;
    }

    .method-name {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      margin: 0 0 var(--space-2);
    }

    .method-desc {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin: 0 0 var(--space-4);
      line-height: var(--leading-relaxed);
    }

    .method-params {
      display: flex;
      gap: var(--space-4);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--text-muted);
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
        margin-bottom: var(--space-6);
      }
    }

    .loading-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-4);
    }

    .skeleton-card {
      height: 140px;
      border-radius: var(--radius-xl);
      background: var(--surface-card);
      animation: pulse 1.5s ease-in-out infinite;
    }
  `,
})
export class MethodList implements OnInit {
  private firestoreService = inject(FirestoreService);

  loading = signal(true);
  methods = signal<BrewMethod[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      this.methods.set(await this.firestoreService.getAllBrewMethods());
    } finally {
      this.loading.set(false);
    }
  }
}
