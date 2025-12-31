import { Component, Input, forwardRef, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'brew-rating',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
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
        (mouseleave)="onMouseLeave()"
      >
        <div 
          class="stars-container"
          #starsContainer
          (click)="onClick($event)"
          (mousemove)="onMouseMove($event)"
        >
          @for (star of [1, 2, 3, 4, 5]; track star) {
            <svg
              class="star"
              [class.star--filled]="getStarFill(star, hoverValue() || value()) === 'full'"
              [class.star--half]="getStarFill(star, hoverValue() || value()) === 'half'"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              stroke-width="1"
            >
              <defs>
                <linearGradient [id]="'star-half-' + star">
                  <stop offset="50%" stop-color="var(--color-copper-400)" />
                  <stop offset="50%" stop-color="var(--color-cream-300)" />
                </linearGradient>
              </defs>
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                [attr.fill]="getStarFillAttr(star, hoverValue() || value())"
              />
            </svg>
          }
        </div>

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
      gap: var(--space-3);
    }

    .stars-container {
      display: flex;
      gap: 2px;
      cursor: pointer;
      padding: var(--space-1);
      margin: calc(-1 * var(--space-1));
      border-radius: var(--radius-md);
      transition: background var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--surface-subtle);
      }
    }

    .star {
      color: var(--color-cream-300);
      transition: transform var(--duration-fast) var(--ease-bounce);
      flex-shrink: 0;

      &--filled {
        color: var(--color-copper-400);
      }

      &--half {
        color: var(--color-copper-400);
      }
    }

    .rating--readonly,
    .rating--disabled {
      .stars-container {
        cursor: default;
        pointer-events: none;

        &:hover {
          background: transparent;
        }
      }
    }

    .rating--disabled {
      opacity: 0.5;
    }

    .rating-value {
      font-family: var(--font-mono);
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--text-tertiary);
      min-width: 2.5em;
    }

    .rating-hint {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  `,
})
export class RatingComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() allowHalf = true;
  @Input() disabled = false;
  @Input() readonly = false;

  @ViewChild('starsContainer') starsContainer!: ElementRef<HTMLDivElement>;

  value = signal(0);
  hoverValue = signal(0);

  displayValue = computed(() => {
    const v = this.hoverValue() || this.value();
    return v ? v.toFixed(1) : '—';
  });

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number): void {
    // Convert from 1-10 scale to 0.5-5 for display
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

  private getValueFromPosition(event: MouseEvent): number {
    if (!this.starsContainer) return 0;

    const container = this.starsContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const starWidth = rect.width / 5;

    // Calculate which star and position within star
    const starIndex = Math.floor(x / starWidth);
    const positionInStar = (x % starWidth) / starWidth;

    let value: number;
    if (this.allowHalf) {
      // First half = 0.5, second half = 1.0
      value = starIndex + (positionInStar < 0.5 ? 0.5 : 1);
    } else {
      value = starIndex + 1;
    }

    // Clamp between 0.5 and 5
    return Math.max(0.5, Math.min(5, value));
  }

  onMouseMove(event: MouseEvent): void {
    if (this.disabled || this.readonly) return;
    const value = this.getValueFromPosition(event);
    this.hoverValue.set(value);
  }

  onMouseLeave(): void {
    this.hoverValue.set(0);
  }

  onClick(event: MouseEvent): void {
    if (this.disabled || this.readonly) return;

    const value = this.getValueFromPosition(event);
    this.value.set(value);
    // Convert to 1-10 scale for storage
    this.onChange(value * 2);
    this.onTouched();
  }

  getStarFill(star: number, currentValue: number): 'full' | 'half' | 'empty' {
    if (currentValue >= star) return 'full';
    if (currentValue >= star - 0.5) return 'half';
    return 'empty';
  }

  getStarFillAttr(star: number, currentValue: number): string {
    const fill = this.getStarFill(star, currentValue);
    if (fill === 'full') return 'var(--color-copper-400)';
    if (fill === 'half') return `url(#star-half-${star})`;
    return 'var(--color-cream-300)';
  }
}
