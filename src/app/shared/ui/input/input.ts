import { Component, Input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'brew-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-wrapper" [class.input-wrapper--error]="error" [class.input-wrapper--disabled]="disabled">
      @if (label) {
        <label class="input-label" [for]="inputId">
          {{ label }}
          @if (required) {
            <span class="required">*</span>
          }
        </label>
      }
      
      <div class="input-container">
        @if (prefix) {
          <span class="input-prefix">{{ prefix }}</span>
        }
        
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value()"
          [min]="min"
          [max]="max"
          [step]="step"
          (input)="onInput($event)"
          (blur)="onTouched()"
          class="input"
          [class.input--has-prefix]="prefix"
          [class.input--has-suffix]="suffix"
        />
        
        @if (suffix) {
          <span class="input-suffix">{{ suffix }}</span>
        }
      </div>
      
      @if (error) {
        <span class="input-error">{{ error }}</span>
      } @else if (hint) {
        <span class="input-hint">{{ hint }}</span>
      }
    </div>
  `,
  styles: `
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .input-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      
      .required {
        color: var(--color-error);
        margin-left: 2px;
      }
    }
    
    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .input {
      width: 100%;
      height: 48px;
      padding: 0 var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-family: inherit;
      font-size: var(--text-base);
      color: var(--text-primary);
      transition: 
        border-color var(--duration-fast) var(--ease-default),
        box-shadow var(--duration-fast) var(--ease-default);
      
      &::placeholder {
        color: var(--text-muted);
      }
      
      &:hover:not(:disabled) {
        border-color: var(--border-strong);
      }
      
      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--surface-subtle);
      }
      
      &--has-prefix {
        padding-left: var(--space-10);
      }
      
      &--has-suffix {
        padding-right: var(--space-10);
      }
    }
    
    .input-wrapper--error {
      .input {
        border-color: var(--color-error);
        
        &:focus {
          box-shadow: var(--shadow-focus-error);
        }
      }
    }
    
    .input-prefix,
    .input-suffix {
      position: absolute;
      color: var(--text-muted);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      pointer-events: none;
    }
    
    .input-prefix {
      left: var(--space-4);
    }
    
    .input-suffix {
      right: var(--space-4);
    }
    
    .input-error {
      font-size: var(--text-sm);
      color: var(--color-error);
    }
    
    .input-hint {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  `
})
export class InputComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel' | 'url' = 'text';
  @Input() hint?: string;
  @Input() error?: string;
  @Input() prefix?: string;
  @Input() suffix?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() inputId = `input-${Math.random().toString(36).slice(2, 9)}`;
  
  value = signal<string | number>('');
  
  private onChange: (value: string | number) => void = () => {};
  onTouched: () => void = () => {};
  
  writeValue(value: string | number): void {
    this.value.set(value ?? '');
  }
  
  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
  
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.type === 'number' ? parseFloat(input.value) || 0 : input.value;
    this.value.set(value);
    this.onChange(value);
  }
}
