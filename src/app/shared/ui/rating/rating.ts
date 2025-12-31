import { Component, Input, forwardRef, signal, computed } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'brew-rating',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ],
  template: `
    <div class="rating-wrapper">
      @if (label) {
        <label class="rating-label">{{ label }}</label>
      }
      
      <div 
        class="rating" 
        [class.rating--readonly]="readonly"
        [class.rating--disabled]="disabled"
        (mouseleave)="hoverValue.set(0)"
      >
        @for (star of stars; track star) {
          <div class="star-container">
            <button
              type="button"
              class="star"
              [class.star--filled]="getStarFill(star) === 'full'"
              [class.star--half]="getStarFill(star) === 'half'"
              [class.star--hovered]="hoverValue() >= star"
              [disabled]="disabled || readonly"
              (mouseenter)="onHover(star)"
              (click)="onSelect(star)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                @if (getStarFill(star) === 'half') {
                  <defs>
                    <linearGradient [id]="'half-' + star">
                      <stop offset="50%" stop-color="currentColor"/>
                      <stop offset="50%" stop-color="transparent"/>
                    </linearGradient>
                  </defs>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" [attr.fill]="'url(#half-' + star + ')'"/>
                } @else {
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                }
              </svg>
            </button>
            
            @if (allowHalf && star < 5) {
              <button
                type="button"
                class="star-half-click"
                [disabled]="disabled || readonly"
                (mouseenter)="onHover(star + 0.5)"
                (click)="onSelect(star + 0.5)"
              ></button>
            }
          </div>
        }
        
        <span class="rating-value">{{ displayValue() }}</span>
      </div>
      
      @if (hint) {
        <span class="rating-hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: `
    .rating-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .rating-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    
    .star-container {
      position: relative;
      display: flex;
    }
    
    .star {
      display: flex;
      color: var(--color-cream-300);
      transition: 
        color var(--duration-fast) var(--ease-default),
        transform var(--duration-fast) var(--ease-bounce);
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      
      &:not(:disabled):hover {
        transform: scale(1.1);
      }
      
      &:not(:disabled):active {
        transform: scale(0.95);
      }
      
      &--filled,
      &--half {
        color: var(--color-copper-400);
      }
      
      &--hovered {
        color: var(--color-copper-500);
      }
      
      &:disabled {
        cursor: default;
      }
    }
    
    .star-half-click {
      position: absolute;
      left: 0;
      top: 0;
      width: 50%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      z-index: 1;
      
      &:disabled {
        cursor: default;
      }
    }
    
    .rating--readonly,
    .rating--disabled {
      .star, .star-half-click {
        cursor: default;
        
        &:hover {
          transform: none;
        }
      }
    }
    
    .rating--disabled {
      opacity: 0.5;
    }
    
    .rating-value {
      margin-left: var(--space-2);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-tertiary);
      min-width: 2.5em;
    }
    
    .rating-hint {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  `
})
export class RatingComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() allowHalf = true;
  @Input() disabled = false;
  @Input() readonly = false;
  
  stars = [1, 2, 3, 4, 5];
  value = signal(0);
  hoverValue = signal(0);
  
  displayValue = computed(() => {
    const v = this.hoverValue() || this.value();
    return v ? v.toFixed(1) : '—';
  });
  
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};
  
  writeValue(value: number): void {
    // Convert from 1-10 scale to 1-5 for display
    this.value.set((value || 0) / 2);
  }
  
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  getStarFill(star: number): 'full' | 'half' | 'empty' {
    const currentValue = this.hoverValue() || this.value();
    if (currentValue >= star) return 'full';
    if (currentValue >= star - 0.5) return 'half';
    return 'empty';
  }
  
  onHover(value: number): void {
    if (!this.disabled && !this.readonly) {
      this.hoverValue.set(value);
    }
  }
  
  onSelect(value: number): void {
    if (!this.disabled && !this.readonly) {
      this.value.set(value);
      // Convert to 1-10 scale for storage
      this.onChange(value * 2);
      this.onTouched();
    }
  }
}
