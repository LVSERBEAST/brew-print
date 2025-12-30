import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { BrewLog, Bean, Equipment, Technique } from '@core/models';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'brew-brew-log-list',
  standalone: true,
  imports: [RouterLink, Card, Button, SlicePipe],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Brew Log</h1>
          <p class="subtitle">{{ brewLogs().length }} brews recorded</p>
        </div>
        <a routerLink="new">
          <brew-button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Brew
          </brew-button>
        </a>
      </header>

      @if (loading()) {
      <div class="loading-grid">
        @for (i of [1,2,3,4,5,6]; track i) {
        <div class="skeleton-card"></div>
        }
      </div>
      } @else if (brewLogs().length === 0) {
      <brew-card class="empty-state">
        <div class="empty-content">
          <span class="empty-icon">☕</span>
          <h3>No brews yet</h3>
          <p>Start tracking your coffee journey.</p>
          <a routerLink="new">
            <brew-button>Log Your First Brew</brew-button>
          </a>
        </div>
      </brew-card>
      } @else {
      <div class="brew-grid">
        @for (brew of brewLogs(); track brew.id) {
        <a [routerLink]="[brew.id]" class="brew-link">
          <brew-card [hoverable]="true" class="brew-card">
            <div class="brew-header">
              <span class="brew-date">{{ brew.date }}</span>
              <div class="brew-rating">
                @for (star of [1,2,3,4,5]; track star) {
                <span class="star" [class.filled]="brew.rating / 2 >= star"
                  >★</span
                >
                }
              </div>
            </div>

            <h3 class="brew-beans">{{ getBeanNames(brew) }}</h3>

            <div class="brew-params">
              <div class="param">
                <span class="param-value">{{ brew.coffeeGrams }}</span>
                <span class="param-label">g coffee</span>
              </div>
              <div class="param">
                <span class="param-value">{{ brew.waterGrams }}</span>
                <span class="param-label">g water</span>
              </div>
              <div class="param">
                <span class="param-value">1:{{ brew.ratio }}</span>
                <span class="param-label">ratio</span>
              </div>
            </div>

            @if (brew.techniqueId) {
            <div class="brew-technique">
              {{ getTechniqueName(brew.techniqueId) }}
            </div>
            } @if (brew.notes) {
            <p class="brew-notes">
              {{ brew.notes | slice : 0 : 100
              }}{{ brew.notes.length > 100 ? '...' : '' }}
            </p>
            }
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
      flex-wrap: wrap;
      
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
    
    .brew-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-4);
    }
    
    .brew-link {
      text-decoration: none;
      color: inherit;
    }
    
    .brew-card {
      height: 100%;
    }
    
    .brew-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-3);
    }
    
    .brew-date {
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: var(--weight-medium);
    }
    
    .brew-rating {
      display: flex;
      gap: 2px;
      
      .star {
        color: var(--color-cream-300);
        font-size: var(--text-sm);
        
        &.filled { color: var(--color-copper-400); }
      }
    }
    
    .brew-beans {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      margin: 0 0 var(--space-4);
      color: var(--text-primary);
    }
    
    .brew-params {
      display: flex;
      gap: var(--space-4);
      margin-bottom: var(--space-3);
    }
    
    .param {
      display: flex;
      flex-direction: column;
    }
    
    .param-value {
      font-family: var(--font-mono);
      font-size: var(--text-lg);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }
    
    .param-label {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }
    
    .brew-technique {
      display: inline-block;
      padding: var(--space-1) var(--space-3);
      background: var(--color-copper-100);
      color: var(--color-copper-700);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      margin-bottom: var(--space-3);
    }
    
    .brew-notes {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin: 0;
      line-height: var(--leading-relaxed);
    }
    
    .empty-state { text-align: center; }
    
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
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-4);
    }
    
    .skeleton-card {
      height: 200px;
      border-radius: var(--radius-xl);
      @extend .skeleton !optional;
    }
  `,
})
export class BrewLogList implements OnInit {
  private firestoreService = inject(FirestoreService);

  loading = signal(true);
  brewLogs = signal<BrewLog[]>([]);
  beans = signal<Bean[]>([]);
  techniques = signal<Technique[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      const [brews, beans, techniques] = await Promise.all([
        this.firestoreService.getBrewLogs(),
        this.firestoreService.getAllBeans(),
        this.firestoreService.getAllTechniques(),
      ]);
      this.brewLogs.set(brews);
      this.beans.set(beans);
      this.techniques.set(techniques);
    } finally {
      this.loading.set(false);
    }
  }

  getBeanNames(brew: BrewLog): string {
    return (
      brew.beanIds
        .map((id) => this.beans().find((b) => b.id === id)?.name || 'Unknown')
        .join(', ') || 'No beans'
    );
  }

  getTechniqueName(id: string): string {
    return this.techniques().find((t) => t.id === id)?.name || 'Unknown';
  }
}
