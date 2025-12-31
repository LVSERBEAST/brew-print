import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Bean } from '@core/models';

// Default bean placeholder SVG as data URI
const DEFAULT_BEAN_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23f5efe5' width='200' height='200'/%3E%3Cg transform='translate(100,100)'%3E%3Cellipse cx='-15' cy='0' rx='35' ry='50' fill='%23c4956a' transform='rotate(-20)'/%3E%3Cellipse cx='15' cy='0' rx='35' ry='50' fill='%23b8864e' transform='rotate(20)'/%3E%3Cpath d='M-5,-45 Q0,-20 -5,45' stroke='%239a6d3a' stroke-width='3' fill='none'/%3E%3Cpath d='M5,-45 Q0,-20 5,45' stroke='%239a6d3a' stroke-width='3' fill='none'/%3E%3C/g%3E%3C/svg%3E`;

@Component({
  selector: 'brew-bean-list',
  standalone: true,
  imports: [RouterLink, Card, Button],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Beans</h1>
          <p class="subtitle">{{ beans().length }} varieties</p>
        </div>
        <a routerLink="new">
          <brew-button>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Beans
          </brew-button>
        </a>
      </header>
      
      @if (loading()) {
        <div class="loading-list">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (beans().length === 0) {
        <brew-card class="empty-state">
          <div class="empty-content">
            <span class="empty-icon">🫘</span>
            <h3>No beans yet</h3>
            <p>Add your first coffee beans to start tracking.</p>
            <a routerLink="new">
              <brew-button>Add Your First Beans</brew-button>
            </a>
          </div>
        </brew-card>
      } @else {
        <div class="bean-list">
          @for (bean of beans(); track bean.id) {
            <a [routerLink]="[bean.id]" class="bean-link">
              <brew-card [hoverable]="true" class="bean-card">
                <div class="bean-row">
                  <div class="bean-image">
                    <img [src]="bean.photoURL || defaultImage" [alt]="bean.name" />
                  </div>
                  <div class="bean-content">
                    <span class="bean-roaster">{{ bean.roaster }}</span>
                    <h3 class="bean-name">{{ bean.name }}</h3>
                    <div class="bean-meta">
                      <span class="bean-origin">{{ bean.origin }}</span>
                      <span class="bean-process">{{ bean.process }}</span>
                    </div>
                  </div>
                  @if (bean.weight) {
                    <div class="bean-weight">
                      <div class="weight-bar">
                        <div class="weight-fill" [style.width.%]="getWeightPercent(bean)"></div>
                      </div>
                      <span class="weight-text">{{ bean.weightRemaining || 0 }}{{ bean.weightUnit || 'g' }} left</span>
                    </div>
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
    
    .bean-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    
    .bean-link {
      text-decoration: none;
      color: inherit;
    }
    
    .bean-card {
      height: 100%;
    }
    
    .bean-row {
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }
    
    .bean-image {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--surface-subtle);
      flex-shrink: 0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .bean-content {
      flex: 1;
      min-width: 0;
    }
    
    .bean-roaster {
      font-size: var(--text-sm);
      color: var(--text-accent);
      font-weight: var(--weight-medium);
    }
    
    .bean-name {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      margin: var(--space-1) 0 var(--space-2);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .bean-meta {
      display: flex;
      gap: var(--space-3);
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
    
    .bean-weight {
      flex-shrink: 0;
      width: 100px;
      text-align: right;
      
      @media (max-width: 500px) {
        display: none;
      }
      
      .weight-bar {
        height: 6px;
        background: var(--color-cream-200);
        border-radius: var(--radius-full);
        overflow: hidden;
        margin-bottom: var(--space-1);
      }
      
      .weight-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--color-copper-400), var(--color-copper-500));
        border-radius: var(--radius-full);
        transition: width var(--duration-slow) var(--ease-out);
      }
      
      .weight-text {
        font-size: var(--text-xs);
        color: var(--text-muted);
        font-family: var(--font-mono);
      }
    }
    
    .empty-state { text-align: center; }
    
    .empty-content {
      padding: var(--space-12) var(--space-4);
      
      .empty-icon { font-size: 3rem; display: block; margin-bottom: var(--space-4); opacity: 0.5; }
      h3 { font-family: var(--font-display); margin: 0 0 var(--space-2); }
      p { color: var(--text-tertiary); margin-bottom: var(--space-6); }
    }
    
    .loading-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    
    .skeleton-card { height: 88px; border-radius: var(--radius-xl); @extend .skeleton !optional; }
  `
})
export class BeanList implements OnInit {
  private firestoreService = inject(FirestoreService);
  
  loading = signal(true);
  beans = signal<Bean[]>([]);
  defaultImage = DEFAULT_BEAN_IMAGE;
  
  async ngOnInit(): Promise<void> {
    try {
      const beans = await this.firestoreService.getAllBeans();
      this.beans.set(beans);
    } finally {
      this.loading.set(false);
    }
  }
  
  getWeightPercent(bean: Bean): number {
    if (!bean.weight || bean.weight === 0) return 0;
    return ((bean.weightRemaining || 0) / bean.weight) * 100;
  }
}
