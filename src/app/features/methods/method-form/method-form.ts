import { Component, inject, signal, Input, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { FormStateService } from '@core/services/form-state.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { DEFAULT_BREW_PARAMS } from '@shared/constants/constants';
import type { BrewMethod, BrewParams, InputMode } from '@core/models/models';

@Component({
  selector: 'brew-method-form',
  standalone: true,
  imports: [FormsModule, Card, Button, InputComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <h1>{{ isEdit ? 'Edit Brew Method' : 'New Brew Method' }}</h1>
        @if (fromBrewLog) {
        <p class="from-brew-hint">Creating from brew parameters</p>
        }
      </header>

      <form (ngSubmit)="onSubmit()" class="form-layout">
        <brew-card title="Basic Info" class="form-section">
          <brew-input
            label="Name"
            [(ngModel)]="name"
            name="name"
            placeholder="e.g., Hoffmann V60"
            [required]="true"
          />
          <div class="textarea-wrapper">
            <label class="textarea-label">Description / Steps</label>
            <textarea
              class="textarea"
              [(ngModel)]="description"
              name="description"
              rows="4"
              placeholder="Describe the method, pour stages, timing..."
            ></textarea>
          </div>
        </brew-card>

        <brew-card title="Parameters" class="form-section">
          <div class="input-mode-toggle">
            <button
              type="button"
              class="mode-btn"
              [class.active]="params.inputMode === 'absolute'"
              (click)="params.inputMode = 'absolute'"
            >
              Absolute
            </button>
            <button
              type="button"
              class="mode-btn"
              [class.active]="params.inputMode === 'ratio'"
              (click)="params.inputMode = 'ratio'"
            >
              Ratio
            </button>
          </div>

          <div class="params-grid">
            @if (params.inputMode === 'ratio') {
            <brew-input
              label="Ratio"
              type="number"
              prefix="1:"
              [(ngModel)]="params.ratio"
              name="ratio"
              [min]="1"
              [max]="30"
              [step]="0.5"
              (ngModelChange)="calcWater()"
            />
            <brew-input
              label="Coffee"
              type="number"
              suffix="g"
              [(ngModel)]="params.coffeeGrams"
              name="coffee"
              [min]="1"
              (ngModelChange)="calcWater()"
            />
            <brew-input
              label="Water (calc)"
              type="number"
              suffix="g"
              [(ngModel)]="params.waterGrams"
              name="water"
              [readonly]="true"
            />
            } @else {
            <brew-input
              label="Coffee"
              type="number"
              suffix="g"
              [(ngModel)]="params.coffeeGrams"
              name="coffeeAbs"
              [min]="1"
              (ngModelChange)="calcRatio()"
            />
            <brew-input
              label="Water"
              type="number"
              suffix="g"
              [(ngModel)]="params.waterGrams"
              name="waterAbs"
              [min]="1"
              (ngModelChange)="calcRatio()"
            />
            <brew-input
              label="Ratio (calc)"
              type="text"
              [ngModel]="'1:' + params.ratio"
              name="ratioDisp"
              [readonly]="true"
            />
            }
          </div>

          <div class="params-grid">
            <brew-input
              label="Water Temp"
              type="number"
              suffix="°C"
              [(ngModel)]="params.waterTemp"
              name="temp"
              [min]="0"
              [max]="100"
            />
            <brew-input
              label="Brew Time"
              type="number"
              suffix="sec"
              [(ngModel)]="params.brewTimeSeconds"
              name="brewTime"
              [min]="0"
            />
            <brew-input
              label="Bloom Time"
              type="number"
              suffix="sec"
              [(ngModel)]="params.bloomTimeSeconds"
              name="bloomTime"
              [min]="0"
            />
          </div>

          <div class="params-grid">
            <brew-input
              label="Bloom Water"
              type="number"
              suffix="g"
              [(ngModel)]="params.bloomWaterGrams"
              name="bloomWater"
              [min]="0"
            />
            <brew-input
              label="Pre-infusion"
              type="number"
              suffix="sec"
              [(ngModel)]="params.preInfusionSeconds"
              name="preInfusion"
              [min]="0"
            />
            <brew-input
              label="Pressure"
              type="number"
              suffix="bars"
              [(ngModel)]="params.pressureBars"
              name="pressure"
              [min]="0"
            />
          </div>

          <brew-input
            label="Yield"
            type="number"
            suffix="g"
            [(ngModel)]="params.yieldGrams"
            name="yield"
            [min]="0"
          />
          <brew-input
            label="Grind Description"
            [(ngModel)]="params.grindDescription"
            name="grind"
            placeholder="e.g., Medium-fine, 18 clicks"
          />
        </brew-card>

        <div class="form-actions">
          <brew-button type="button" variant="secondary" (onClick)="goBack()">
            Cancel
          </brew-button>
          <brew-button type="submit" [loading]="saving()" [disabled]="!name">
            {{ isEdit ? 'Save' : 'Create' }}
          </brew-button>
        </div>
      </form>
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
        margin-bottom: var(--space-3);

        &:hover {
          color: var(--text-primary);
        }
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--text-3xl);
        margin: 0;
      }
    }

    .from-brew-hint {
      font-size: var(--text-sm);
      color: var(--color-copper-600);
      margin-top: var(--space-2);
    }

    .form-layout {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .form-section {
      margin-bottom: 0;
    }

    .textarea-wrapper {
      margin-top: var(--space-4);
    }

    .textarea-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      margin-bottom: var(--space-2);
    }

    .textarea {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-family: inherit;
      font-size: var(--text-base);
      resize: vertical;

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .input-mode-toggle {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
      padding: var(--space-1);
      background: var(--surface-subtle);
      border-radius: var(--radius-lg);
      width: fit-content;
    }

    .mode-btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-tertiary);

      &.active {
        background: var(--surface-card);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
      }
    }

    .params-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-subtle);
    }
  `,
})
export class MethodForm implements OnInit {
  id = input<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  private formStateService = inject(FormStateService);

  saving = signal(false);
  fromBrewLog = false;

  name = '';
  description = '';
  params: BrewParams = { ...DEFAULT_BREW_PARAMS };

  get isEdit(): boolean {
    return !!(this.id());
  }

  async ngOnInit(): Promise<void> {
    // Check if coming from brew log with pre-filled params
    const state = history.state;
    if (state?.fromBrewLog && state?.brewParams) {
      this.fromBrewLog = true;
      this.params = { ...DEFAULT_BREW_PARAMS, ...state.brewParams };
    }

    if (this.id()) {
      const method = await this.firestoreService.getBrewMethod(this.id()!);
      if (method) {
        this.name = method.name;
        this.description = method.description || '';
        this.params = { ...method.params };
      }
    }
  }

  calcRatio(): void {
    if (this.params.coffeeGrams && this.params.waterGrams) {
      this.params.ratio =
        Math.round((this.params.waterGrams / this.params.coffeeGrams) * 10) /
        10;
    }
  }

  calcWater(): void {
    if (this.params.coffeeGrams && this.params.ratio) {
      this.params.waterGrams = Math.round(
        this.params.coffeeGrams * this.params.ratio
      );
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.name) return;
    this.saving.set(true);

    try {
      const data: Partial<BrewMethod> = {
        name: this.name,
        description: this.description || undefined,
        params: this.params,
        archived: false,
      };

      let newId: string | undefined;

      if (this.isEdit) {
        await this.firestoreService.updateBrewMethod(this.id()!, data);
      } else {
        newId = await this.firestoreService.createBrewMethod(
          data as BrewMethod
        );
      }

      this.toastService.success(
        this.isEdit ? 'Brew method updated!' : 'Brew method created!'
      );

      // If coming from brew log, navigate back with new method ID
      if (this.fromBrewLog && newId) {
        this.router.navigate(['/brews/new'], {
          state: { newMethodId: newId },
        });
      } else {
        this.router.navigate(['/methods']);
      }
    } catch {
      this.toastService.error('Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    if (this.fromBrewLog) {
      this.router.navigate(['/brews/new']);
    } else {
      this.router.navigate(['/methods']);
    }
  }
}
