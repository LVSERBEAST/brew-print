import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  Input,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { FormStateService } from '@core/services/form-state.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { RatingComponent } from '@shared/ui/rating/rating';
import { DEFAULT_BREW_PARAMS } from '@shared/constants/constants';
import type {
  Bean,
  Equipment,
  BrewMethod,
  BrewLog,
  BrewParams,
  InputMode,
} from '@core/models/models';

@Component({
  selector: 'brew-brew-log-form',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    Card,
    Button,
    InputComponent,
    RatingComponent,
  ],
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
        <h1>{{ isEdit ? 'Edit Brew' : 'Log New Brew' }}</h1>
      </header>

      <form (ngSubmit)="onSubmit()" class="form-layout">
        <!-- Beans Selection -->
        <brew-card title="Beans" class="form-section">
          <div class="bean-selection">
            @if (beans().length === 0) {
            <p class="no-items">
              No beans added yet.
              <a routerLink="/beans/new">Add beans first.</a>
            </p>
            } @else {
            <div class="checkbox-grid">
              @for (bean of beans(); track bean.id) {
              <label
                class="checkbox-item"
                [class.selected]="selectedBeans().includes(bean.id!)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedBeans().includes(bean.id!)"
                  (change)="toggleBean(bean.id!)"
                />
                <span class="checkbox-content">
                  <span class="checkbox-title">{{ bean.name }}</span>
                  <span class="checkbox-subtitle">{{ bean.roaster }}</span>
                </span>
              </label>
              }
            </div>
            }
          </div>
        </brew-card>

        <!-- Equipment Selection -->
        <brew-card title="Equipment" class="form-section">
          @if (equipment().length === 0) {
          <p class="no-items">
            No equipment added yet.
            <a routerLink="/equipment/new">Add equipment first.</a>
          </p>
          } @else {
          <div class="checkbox-grid">
            @for (equip of equipment(); track equip.id) {
            <label
              class="checkbox-item"
              [class.selected]="selectedEquipment().includes(equip.id!)"
            >
              <input
                type="checkbox"
                [checked]="selectedEquipment().includes(equip.id!)"
                (change)="toggleEquipment(equip.id!)"
              />
              <span class="checkbox-content">
                <span class="checkbox-title">{{ equip.name }}</span>
                <span class="checkbox-subtitle">{{ equip.category }}</span>
              </span>
            </label>
            }
          </div>
          }
        </brew-card>

        <!-- Brew Method Selection -->
        <brew-card title="Brew Method (Optional)" class="form-section">
          <div class="select-wrapper">
            <select
              class="select-input"
              [(ngModel)]="selectedMethodId"
              name="methodId"
              (ngModelChange)="onMethodChange()"
            >
              <option [ngValue]="undefined">No brew method</option>
              @for (method of methods(); track method.id) {
              <option [value]="method.id">{{ method.name }}</option>
              }
            </select>
            <svg
              class="select-arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </brew-card>

        <!-- Brew Parameters -->
        <brew-card title="Brew Parameters" class="form-section">
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
              [min]="1"
              [max]="30"
              [step]="0.5"
              prefix="1:"
              [(ngModel)]="params.ratio"
              name="ratio"
              (ngModelChange)="calculateFromRatio()"
            />
            <brew-input
              label="Coffee"
              type="number"
              [min]="1"
              suffix="g"
              [(ngModel)]="params.coffeeGrams"
              name="coffeeGrams"
              (ngModelChange)="calculateWaterFromRatio()"
            />
            <brew-input
              label="Water (calculated)"
              type="number"
              suffix="g"
              [readonly]="true"
              [(ngModel)]="params.waterGrams"
              name="waterGrams"
            />
            } @else {
            <brew-input
              label="Coffee"
              type="number"
              [min]="1"
              suffix="g"
              [(ngModel)]="params.coffeeGrams"
              name="coffeeGramsAbs"
              (ngModelChange)="calculateRatio()"
            />
            <brew-input
              label="Water"
              type="number"
              [min]="1"
              suffix="g"
              [(ngModel)]="params.waterGrams"
              name="waterGramsAbs"
              (ngModelChange)="calculateRatio()"
            />
            <brew-input
              label="Ratio (calculated)"
              type="text"
              [readonly]="true"
              [ngModel]="'1:' + params.ratio"
              name="ratioDisplay"
            />
            }
          </div>

          <div class="params-grid">
            <brew-input
              label="Water Temp"
              type="number"
              [min]="0"
              [max]="100"
              suffix="°C"
              [(ngModel)]="params.waterTemp"
              name="waterTemp"
            />
            <brew-input
              label="Brew Time"
              type="number"
              [min]="0"
              suffix="sec"
              [(ngModel)]="params.brewTimeSeconds"
              name="brewTime"
            />
            <brew-input
              label="Yield"
              type="number"
              [min]="0"
              suffix="g"
              [(ngModel)]="params.yieldGrams"
              name="yield"
            />
          </div>

          <brew-input
            label="Grind Description"
            type="text"
            placeholder="e.g., Medium-fine, 18 clicks on Comandante"
            [(ngModel)]="params.grindDescription"
            name="grindDescription"
          />
        </brew-card>

        <!-- Rating & Notes -->
        <brew-card title="Evaluation" class="form-section">
          <brew-rating label="Rating" [(ngModel)]="rating" name="rating" />

          <div class="textarea-wrapper">
            <label class="textarea-label">Notes</label>
            <textarea
              class="textarea"
              placeholder="How was this brew? What would you change?"
              [(ngModel)]="notes"
              name="notes"
              rows="4"
            ></textarea>
          </div>
        </brew-card>

        <!-- Save as Brew Method -->
        <button
          type="button"
          class="save-method-btn"
          (click)="saveBrewMethod()"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save as Brew Method
        </button>

        <!-- Actions -->
        <div class="form-actions">
          <brew-button type="button" variant="secondary" (onClick)="goBack()">
            Cancel
          </brew-button>
          <brew-button
            type="submit"
            [loading]="saving()"
            [disabled]="!isValid()"
          >
            {{ isEdit ? 'Save Changes' : 'Log Brew' }}
          </brew-button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .page {
      max-width: 800px;
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
        font-weight: var(--weight-medium);
        margin-bottom: var(--space-3);
        transition: color var(--duration-fast) var(--ease-default);

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

    .form-layout {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .form-section {
      margin-bottom: 0;
    }

    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--space-3);
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--surface-subtle);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);

      input {
        display: none;
      }

      &:hover {
        background: var(--color-cream-200);
      }

      &.selected {
        background: var(--color-copper-100);
        border-color: var(--color-copper-400);
      }
    }

    .checkbox-content {
      display: flex;
      flex-direction: column;
    }

    .checkbox-title {
      font-weight: var(--weight-medium);
      color: var(--text-primary);
    }

    .checkbox-subtitle {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .select-wrapper {
      position: relative;
    }

    .select-input {
      width: 100%;
      height: 48px;
      padding: 0 var(--space-10) 0 var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-size: var(--text-base);
      cursor: pointer;
      appearance: none;

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .select-arrow {
      position: absolute;
      right: var(--space-4);
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: var(--text-muted);
    }

    .input-mode-toggle {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
      padding: var(--space-1);
      background: var(--surface-subtle);
      border-radius: var(--radius-lg);
      width: fit-content;
      position: relative;
      z-index: 1;
    }

    .mode-btn {
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-tertiary);
      transition: all var(--duration-fast) var(--ease-default);
      position: relative;
      z-index: 2;

      &.active {
        background: var(--surface-card);
        color: var(--text-primary);
        box-shadow: var(--shadow-sm);
      }
    }

    .params-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .textarea-wrapper {
      margin-top: var(--space-5);
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
      min-height: 100px;

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .save-method-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-4);
      border: 2px dashed var(--border-default);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
      background: transparent;
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);

      &:hover {
        background: var(--color-copper-50);
        border-color: var(--color-copper-400);
        color: var(--color-copper-700);
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-subtle);
    }

    .no-items {
      color: var(--text-muted);

      a {
        color: var(--text-accent);
        font-weight: var(--weight-medium);
      }
    }
  `,
})
export class BrewLogForm implements OnInit {
  id = input<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  private formStateService = inject(FormStateService);

  loading = signal(true);
  saving = signal(false);
  beans = signal<Bean[]>([]);
  equipment = signal<Equipment[]>([]);
  methods = signal<BrewMethod[]>([]);
  selectedBeans = signal<string[]>([]);
  selectedEquipment = signal<string[]>([]);

  selectedMethodId?: string;
  params: BrewParams = { ...DEFAULT_BREW_PARAMS };
  rating = 0;
  notes = '';

  get isEdit(): boolean {
    return !!this.id();
  }

  async ngOnInit(): Promise<void> {
    const [beans, equipment, methods] = await Promise.all([
      this.firestoreService.getAllBeans(),
      this.firestoreService.getAllEquipment(),
      this.firestoreService.getAllBrewMethods(),
    ]);

    this.beans.set(beans);
    this.equipment.set(equipment);
    this.methods.set(methods);

    // Check for returning from method creation
    const returnedMethodId = history.state?.newMethodId;
    if (returnedMethodId) {
      // Refresh methods to get the new one
      const updatedMethods = await this.firestoreService.getAllBrewMethods();
      this.methods.set(updatedMethods);
      this.selectedMethodId = returnedMethodId;
      this.onMethodChange();
    }

    // Restore form state if available
    const savedState = this.formStateService.brewLogFormState;
    if (savedState) {
      this.selectedBeans.set(savedState.beanIds || []);
      this.selectedEquipment.set(savedState.equipmentIds || []);
      this.selectedMethodId = savedState.brewMethodId;
      this.params = savedState.params || { ...DEFAULT_BREW_PARAMS };
      this.rating = savedState.rating || 0;
      this.notes = savedState.notes || '';
      this.formStateService.clearBrewLogFormState();
    }

    if (this.id()) {
      const brew = await this.firestoreService.getBrewLog(this.id()!);
      if (brew) {
        this.selectedBeans.set(brew.beanIds);
        this.selectedEquipment.set(brew.equipmentIds);
        this.selectedMethodId = brew.brewMethodId;
        this.params = { ...brew.params };
        this.rating = brew.rating;
        this.notes = brew.notes || '';
      }
    }

    this.loading.set(false);
  }

  toggleBean(id: string): void {
    this.selectedBeans.update((beans) =>
      beans.includes(id) ? beans.filter((b) => b !== id) : [...beans, id]
    );
  }

  toggleEquipment(id: string): void {
    this.selectedEquipment.update((equip) =>
      equip.includes(id) ? equip.filter((e) => e !== id) : [...equip, id]
    );
  }

  onMethodChange(): void {
    if (this.selectedMethodId) {
      const method = this.methods().find((m) => m.id === this.selectedMethodId);
      if (method) {
        this.params = { ...method.params };
      }
    }
  }

  saveBrewMethod(): void {
    // Save form state before navigating
    this.formStateService.saveBrewLogFormState({
      beanIds: this.selectedBeans(),
      equipmentIds: this.selectedEquipment(),
      brewMethodId: this.selectedMethodId,
      params: this.params,
      rating: this.rating,
      notes: this.notes,
    });

    // Navigate to method form with current brew params as state
    this.router.navigate(['/methods/new'], {
      state: {
        fromBrewLog: true,
        brewParams: this.params,
      },
    });
  }

  calculateRatio(): void {
    if (this.params.coffeeGrams && this.params.waterGrams) {
      this.params.ratio =
        Math.round((this.params.waterGrams / this.params.coffeeGrams) * 10) /
        10;
    }
  }

  calculateFromRatio(): void {
    if (this.params.coffeeGrams && this.params.ratio) {
      this.params.waterGrams = Math.round(
        this.params.coffeeGrams * this.params.ratio
      );
    }
  }

  calculateWaterFromRatio(): void {
    this.calculateFromRatio();
  }

  isValid(): boolean {
    return (
      this.selectedBeans().length > 0 &&
      !!this.params.coffeeGrams &&
      !!this.params.waterGrams
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.saving.set(true);

    try {
      const data: Partial<BrewLog> = {
        beanIds: this.selectedBeans(),
        equipmentIds: this.selectedEquipment(),
        brewMethodId: this.selectedMethodId,
        params: this.params,
        rating: this.rating || 0,
        notes: this.notes || undefined,
      };

      if (this.isEdit) {
        await this.firestoreService.updateBrewLog(this.id()!, data);
        this.toastService.success('Brew updated!');
      } else {
        await this.firestoreService.createBrewLog(data as BrewLog);
        this.toastService.success('Brew logged!');
      }

      this.router.navigate(['/brews']);
    } catch (err) {
      console.log(err);
      this.toastService.error('Failed to save brew');
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/brews']);
  }
}
