import { Component, Input } from '@angular/core';

@Component({
  selector: 'brew-card',
  standalone: true,
  template: `
    <div class="card" [class.card--hoverable]="hoverable" [class.card--clickable]="clickable">
      @if (title || headerTemplate) {
        <header class="card-header">
          @if (title) {
            <h3 class="card-title">{{ title }}</h3>
          }
          @if (subtitle) {
            <p class="card-subtitle">{{ subtitle }}</p>
          }
          <ng-content select="[card-header]" />
        </header>
      }
      
      <div class="card-body" [class.card-body--flush]="flush">
        <ng-content />
      </div>
      
      @if (hasFooter) {
        <footer class="card-footer">
          <ng-content select="[card-footer]" />
        </footer>
      }
    </div>
  `,
  styles: `
    .card {
      background: var(--surface-card);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: 
        box-shadow var(--duration-fast) var(--ease-default),
        transform var(--duration-fast) var(--ease-default);
    }
    
    .card--hoverable {
      &:hover {
        box-shadow: var(--shadow-md);
      }
    }
    
    .card--clickable {
      cursor: pointer;
      
      &:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }
    
    .card-header {
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--border-subtle);
    }
    
    .card-title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
      margin: 0;
    }
    
    .card-subtitle {
      font-size: var(--text-sm);
      color: var(--text-tertiary);
      margin: var(--space-1) 0 0;
    }
    
    .card-body {
      padding: var(--space-5) var(--space-6);
      
      &--flush {
        padding: 0;
      }
    }
    
    .card-footer {
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--border-subtle);
      background: var(--surface-subtle);
    }
  `
})
export class Card {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() hoverable = false;
  @Input() clickable = false;
  @Input() flush = false;
  @Input() headerTemplate = false;
  @Input() hasFooter = false;
}
