import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'brew-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="toast" 
          [class]="'toast--' + toast.type"
          (click)="toastService.dismiss(toast.id)"
        >
          <span class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              }
              @case ('error') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              }
              @case ('warning') {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              }
              @default {
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              }
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id); $event.stopPropagation()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      top: var(--space-4);
      right: var(--space-4);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 400px;
      
      @media (max-width: 480px) {
        left: var(--space-4);
        right: var(--space-4);
        max-width: none;
      }
    }
    
    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      background: var(--surface-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border-left: 4px solid;
      cursor: pointer;
      animation: slideInRight var(--duration-normal) var(--ease-out);
      
      &--success {
        border-left-color: var(--color-success);
        
        .toast-icon { color: var(--color-success); }
      }
      
      &--error {
        border-left-color: var(--color-error);
        
        .toast-icon { color: var(--color-error); }
      }
      
      &--warning {
        border-left-color: var(--color-warning);
        
        .toast-icon { color: var(--color-warning); }
      }
      
      &--info {
        border-left-color: var(--color-info);
        
        .toast-icon { color: var(--color-info); }
      }
    }
    
    .toast-icon {
      display: flex;
      flex-shrink: 0;
    }
    
    .toast-message {
      flex: 1;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-primary);
      line-height: var(--leading-snug);
    }
    
    .toast-close {
      display: flex;
      flex-shrink: 0;
      color: var(--text-muted);
      transition: color var(--duration-fast) var(--ease-default);
      
      &:hover {
        color: var(--text-primary);
      }
    }
  `
})
export class ToastContainer {
  toastService = inject(ToastService);
}
