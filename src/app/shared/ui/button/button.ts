import { Component, Input, Output, EventEmitter, input } from '@angular/core';
import { NgClass } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'brew-button',
  standalone: true,
  //imports: [NgClass],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-family: inherit;
      font-weight: var(--weight-semibold);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: 
        background var(--duration-fast) var(--ease-default),
        color var(--duration-fast) var(--ease-default),
        box-shadow var(--duration-fast) var(--ease-default),
        transform var(--duration-fast) var(--ease-default);
      white-space: nowrap;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }
      
      &:not(:disabled):hover {
        transform: translateY(-1px);
      }
      
      &:not(:disabled):active {
        transform: translateY(0);
      }
    }
    
    // Sizes
    .btn--sm {
      height: 36px;
      padding: 0 var(--space-4);
      font-size: var(--text-sm);
    }
    
    .btn--md {
      height: 44px;
      padding: 0 var(--space-5);
      font-size: var(--text-sm);
    }
    
    .btn--lg {
      height: 52px;
      padding: 0 var(--space-6);
      font-size: var(--text-base);
    }
    
    // Variants
    .btn--primary {
      background: linear-gradient(135deg, var(--color-copper-500) 0%, var(--color-copper-400) 100%);
      color: var(--color-white);
      box-shadow: 0 4px 12px rgba(196, 149, 106, 0.3);
      
      &:not(:disabled):hover {
        background: linear-gradient(135deg, var(--color-copper-600) 0%, var(--color-copper-500) 100%);
        box-shadow: 0 6px 16px rgba(196, 149, 106, 0.4);
      }
    }
    
    .btn--secondary {
      background: transparent;
      color: var(--text-secondary);
      border: 2px solid var(--border-default);
      
      &:not(:disabled):hover {
        background: var(--surface-subtle);
        border-color: var(--border-strong);
        color: var(--text-primary);
      }
    }
    
    .btn--ghost {
      background: transparent;
      color: var(--text-secondary);
      
      &:not(:disabled):hover {
        background: var(--surface-subtle);
        color: var(--text-primary);
      }
    }
    
    .btn--danger {
      background: var(--color-error);
      color: var(--color-white);
      
      &:not(:disabled):hover {
        background: var(--color-error-dark);
      }
    }
    
    // Full width
    .btn--full {
      width: 100%;
    }
    
    // Loading spinner
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
})
export class Button {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  
  @Output() onClick = new EventEmitter<MouseEvent>();
  
  get buttonClasses(): string {
    return [
      `btn--${this.variant()}`,
      `btn--${this.size()}`,
      this.fullWidth() ? 'btn--full' : ''
    ].filter(Boolean).join(' ');
  }
}
