import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { RatingComponent } from '@shared/ui/rating/rating';
import type {
  Bean,
  Equipment,
  Technique,
  BrewLog,
  InputMode,
} from '@core/models';

@Component({
  selector: 'brew-brew-log-form',
  standalone: true,
  imports: [FormsModule, Card, Button, InputComponent, RatingComponent],
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
                [class.selected]="selectedBeans().includes(bean.id)"
              >
                <input
                  type="checkbox"
                  [checked]="selectedBeans().includes(bean.id)"
                  (change)="toggleBean(bean.id)"
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
              [class.selected]="selectedEquipment().includes(equip.id)"
            >
              <input
                type="checkbox"
                [checked]="selectedEquipment().includes(equip.id)"
                (change)="toggleEquipment(equip.id)"
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

        <!-- Technique Selection -->
        <brew-card title="Technique (Optional)" class="form-section">
          <select
            class="select-input"
            [(ngModel)]="formData.techniqueId"
            name="techniqueId"
            (change)="onTechniqueChange()"
          >
            <option [ngValue]="undefined">No technique</option>
            @for (tech of techniques(); track tech.id) {
            <option [value]="tech.id">{{ tech.name }}</option>
            }
          </select>
        </brew-card>

        <!-- Brew Parameters -->
        <brew-card title="Brew Parameters" class="form-section">
          <div class="input-mode-toggle">
            <button
              type="button"
              class="mode-btn"
              [class.active]="formData.inputMode === 'absolute'"
              (click)="formData.inputMode = 'absolute'"
            >
              Absolute
            </button>
            <button
              type="button"
              class="mode-btn"
              [class.active]="formData.inputMode === 'ratio'"
              (click)="formData.inputMode = 'ratio'"
            >
              Ratio
            </button>
          </div>

          <div class="params-grid">
            @if (formData.inputMode === 'ratio') {
            <brew-input
              label="Ratio"
              type="number"
              [min]="1"
              [max]="30"
              [step]="0.5"
              prefix="1:"
              [(ngModel)]="formData.ratio"
              name="ratio"
              (ngModelChange)="calculateFromRatio()"
            />
            <brew-input
              label="Coffee"
              type="number"
              [min]="1"
              suffix="g"
              [(ngModel)]="formData.coffeeGrams"
              name="coffeeGrams"
              (ngModelChange)="calculateWaterFromRatio()"
            />
            <brew-input
              label="Water (calculated)"
              type="number"
              suffix="g"
              [readonly]="true"
              [(ngModel)]="formData.waterGrams"
              name="waterGrams"
            />
            } @else {
            <brew-input
              label="Coffee"
              type="number"
              [min]="1"
              suffix="g"
              [(ngModel)]="formData.coffeeGrams"
              name="coffeeGramsAbs"
              (ngModelChange)="calculateRatio()"
            />
            <brew-input
              label="Water"
              type="number"
              [min]="1"
              suffix="g"
              [(ngModel)]="formData.waterGrams"
              name="waterGramsAbs"
              (ngModelChange)="calculateRatio()"
            />
            <brew-input
              label="Ratio (calculated)"
              type="text"
              [readonly]="true"
              [ngModel]="'1:' + formData.ratio"
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
              [(ngModel)]="formData.waterTemp"
              name="waterTemp"
            />
            <brew-input
              label="Brew Time"
              type="number"
              [min]="0"
              suffix="sec"
              [(ngModel)]="formData.brewTimeSeconds"
              name="brewTime"
            />
            <brew-input
              label="Yield"
              type="number"
              [min]="0"
              suffix="g"
              [(ngModel)]="formData.yieldGrams"
              name="yield"
            />
          </div>

          <brew-input
            label="Grind Description"
            type="text"
            placeholder="e.g., Medium-fine, 18 clicks on Comandante"
            [(ngModel)]="formData.grindDescription"
            name="grindDescription"
          />
        </brew-card>

        <!-- Rating & Notes -->
        <brew-card title="Evaluation" class="form-section">
          <brew-rating
            label="Rating"
            [(ngModel)]="formData.rating"
            name="rating"
          />

          <div class="textarea-wrapper">
            <label class="textarea-label">Notes</label>
            <textarea
              class="textarea"
              placeholder="How was this brew? What would you change?"
              [(ngModel)]="formData.notes"
              name="notes"
              rows="4"
            ></textarea>
          </div>
        </brew-card>

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
        
        &:hover { color: var(--text-primary); }
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
      
      input { display: none; }
      
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
    
    .select-input {
      width: 100%;
      height: 48px;
      padding: 0 var(--space-4);
      background: var(--surface-card);
      border: 2px solid var(--border-default);
      border-radius: var(--radius-lg);
      font-size: var(--text-base);
      cursor: pointer;
      
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
      transition: all var(--duration-fast) var(--ease-default);
      
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
  @Input() id?: string;

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  beans = signal<Bean[]>([]);
  equipment = signal<Equipment[]>([]);
  techniques = signal<Technique[]>([]);
  selectedBeans = signal<string[]>([]);
  selectedEquipment = signal<string[]>([]);

  formData: Partial<BrewLog> = {
    inputMode: 'absolute',
    coffeeGrams: 18,
    waterGrams: 300,
    ratio: 16.7,
    waterTemp: 93,
    brewTimeSeconds: 180,
    rating: 0,
    notes: '',
    grindDescription: '',
  };

  get isEdit(): boolean {
    return !!this.id;
  }

  async ngOnInit(): Promise<void> {
    const [beans, equipment, techniques] = await Promise.all([
      this.firestoreService.getAllBeans(),
      this.firestoreService.getAllEquipment(),
      this.firestoreService.getAllTechniques(),
    ]);

    this.beans.set(beans);
    this.equipment.set(equipment);
    this.techniques.set(techniques);

    if (this.id) {
      const brew = await this.firestoreService.getBrewLog(this.id);
      if (brew) {
        this.selectedBeans.set(brew.beanIds);
        this.selectedEquipment.set(
          brew.equipmentUsages.map((e) => e.equipmentId)
        );
        this.formData = { ...brew };
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

  onTechniqueChange(): void {
    if (this.formData.techniqueId) {
      const technique = this.techniques().find(
        (t) => t.id === this.formData.techniqueId
      );
      if (technique) {
        this.formData.coffeeGrams =
          technique.coffeeGrams || this.formData.coffeeGrams;
        this.formData.waterGrams =
          technique.waterGrams || this.formData.waterGrams;
        this.formData.ratio = technique.ratio || this.formData.ratio;
        this.formData.waterTemp =
          technique.waterTemp || this.formData.waterTemp;
        this.formData.brewTimeSeconds =
          technique.brewTimeSeconds || this.formData.brewTimeSeconds;
        this.formData.grindDescription =
          technique.grindDescription || this.formData.grindDescription;
      }
    }
  }

  calculateRatio(): void {
    if (this.formData.coffeeGrams && this.formData.waterGrams) {
      this.formData.ratio =
        Math.round(
          (this.formData.waterGrams / this.formData.coffeeGrams) * 10
        ) / 10;
    }
  }

  calculateFromRatio(): void {
    if (this.formData.coffeeGrams && this.formData.ratio) {
      this.formData.waterGrams = Math.round(
        this.formData.coffeeGrams * this.formData.ratio
      );
    }
  }

  calculateWaterFromRatio(): void {
    this.calculateFromRatio();
  }

  isValid(): boolean {
    return (
      this.selectedBeans().length > 0 &&
      !!this.formData.coffeeGrams &&
      !!this.formData.waterGrams
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;

    this.saving.set(true);

    try {
      const data: BrewLog = {
        id: '', // FIX
        userId: '', // FIX
        date: new Date(),
        beanIds: this.selectedBeans(),
        equipmentUsages: this.selectedEquipment().map((id) => ({
          equipmentId: id,
          customFieldValues: [],
        })),
        techniqueId: this.formData.techniqueId,
        inputMode: this.formData.inputMode as InputMode,
        coffeeGrams: this.formData.coffeeGrams!,
        waterGrams: this.formData.waterGrams!,
        ratio: this.formData.ratio!,
        waterTemp: this.formData.waterTemp,
        brewTimeSeconds: this.formData.brewTimeSeconds,
        bloomTimeSeconds: this.formData.bloomTimeSeconds, // FIX
        bloomWaterGrams: this.formData.bloomWaterGrams, // FIX
        preInfusionSeconds: this.formData.preInfusionSeconds, // FIX
        pressureBars: this.formData.pressureBars, // FIX
        yieldGrams: this.formData.yieldGrams,
        grindDescription: this.formData.grindDescription,
        rating: this.formData.rating || 0,
        notes: this.formData.notes,
        customFields: [],
        customFieldValues: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (this.isEdit) {
        await this.firestoreService.updateBrewLog(this.id!, data);
        this.toastService.success('Brew updated!');
      } else {
        await this.firestoreService.createBrewLog(data);
        this.toastService.success('Brew logged!');
      }

      this.router.navigate(['/brews']);
    } catch (err) {
      this.toastService.error('Failed to save brew');
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/brews']);
  }
}
