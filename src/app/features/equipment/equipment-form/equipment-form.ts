import { Component, inject, signal, Input, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import {
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_ICONS,
  DEFAULT_CATEGORY_ICONS,
} from '@shared/constants/constants';
import type { Equipment, EquipmentCategory } from '@core/models/models';

// interface CustomFieldForm extends CustomFieldDefinition {
//   optionsString?: string;
// }

@Component({
  selector: 'brew-equipment-form',
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
        <h1>{{ isEdit ? 'Edit Equipment' : 'Add Equipment' }}</h1>
      </header>

      <form (ngSubmit)="onSubmit()" class="form-layout">
        <brew-card title="Basic Info" class="form-section">
          <brew-input
            label="Name"
            [(ngModel)]="formData.name"
            name="name"
            placeholder="e.g., Comandante C40"
            [required]="true"
          />
          <div class="form-grid">
            <div class="select-wrapper">
              <label class="select-label">Category</label>
              <select
                class="select-input"
                [(ngModel)]="formData.category"
                name="category"
              >
                @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </div>
            <brew-input
              label="Brand"
              [(ngModel)]="formData.brand"
              name="brand"
              placeholder="e.g., Comandante"
            />
          </div>
          <brew-input
            label="Model"
            [(ngModel)]="formData.model"
            name="model"
            placeholder="e.g., C40 MK4"
          />
        </brew-card>

        <brew-card title="Icon" class="form-section">
          <p class="hint">Choose an icon to represent this equipment</p>
          <div class="icon-grid">
            @for (icon of icons; track icon) {
            <button
              type="button"
              class="icon-btn"
              [class.selected]="formData.icon === icon"
              (click)="formData.icon = icon"
            >
              {{ icon }}
            </button>
            }
          </div>
        </brew-card>

        <!-- <brew-card title="Custom Fields" subtitle="Define settings specific to this equipment" class="form-section">
          <p class="hint">For grinders: add grind settings. For machines: add pressure, temp settings, etc.</p>

          @for (field of customFields; track field.id; let i = $index) {
            <div class="custom-field-row">
              <brew-input
                label="Label"
                [(ngModel)]="field.label"
                [name]="'fieldLabel' + i"
                placeholder="e.g., Clicks"
              />
              <div class="select-wrapper">
                <label class="select-label">Type</label>
                <select class="select-input" [(ngModel)]="field.type" [name]="'fieldType' + i">
                  <option value="number">Number</option>
                  <option value="text">Text</option>
                  <option value="range">Range</option>
                  <option value="select">Select</option>
                  <option value="toggle">Toggle</option>
                </select>
              </div>
              @if (field.type === 'number' || field.type === 'range') {
                <brew-input label="Min" type="number" [(ngModel)]="field.min" [name]="'fieldMin' + i" />
                <brew-input label="Max" type="number" [(ngModel)]="field.max" [name]="'fieldMax' + i" />
              }
              @if (field.type === 'select') {
                <brew-input
                  label="Options (comma separated)"
                  [(ngModel)]="field.optionsString"
                  [name]="'fieldOptions' + i"
                  placeholder="e.g., Fine,Medium,Coarse"
                />
              }
              <button type="button" class="remove-field" (click)="removeField(i)">×</button>
            </div>
          }

          <button type="button" class="add-field-btn" (click)="addField()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Custom Field
          </button>
        </brew-card> -->

        <brew-card title="Notes" class="form-section">
          <textarea
            class="textarea"
            [(ngModel)]="formData.notes"
            name="notes"
            rows="3"
            placeholder="Maintenance notes, calibration info, etc."
          ></textarea>
        </brew-card>

        <div class="form-actions">
          <brew-button type="button" variant="secondary" (onClick)="goBack()"
            >Cancel</brew-button
          >
          <brew-button
            type="submit"
            [loading]="saving()"
            [disabled]="!isValid()"
          >
            {{ isEdit ? 'Save' : 'Add Equipment' }}
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
        font-weight: var(--weight-medium);
        margin-bottom: var(--space-3);

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

    .form-section { margin-bottom: 0; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      margin-top: var(--space-4);
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .select-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
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
      text-transform: capitalize;

      &:focus {
        outline: none;
        border-color: var(--border-focus);
        box-shadow: var(--shadow-focus);
      }
    }

    .hint {
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-bottom: var(--space-4);
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
      gap: var(--space-2);
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
      background: var(--surface-subtle);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--duration-fast) var(--ease-default);

      &:hover { background: var(--color-cream-200); }
      &.selected {
        background: var(--color-copper-100);
        border-color: var(--color-copper-400);
      }
    }

    .custom-field-row {
      display: grid;
      grid-template-columns: 1fr auto 1fr 1fr auto;
      gap: var(--space-3);
      align-items: end;
      padding: var(--space-4);
      background: var(--surface-subtle);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-3);

      @media (max-width: 700px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .remove-field {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      color: var(--text-muted);
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-2);

      &:hover {
        background: var(--color-error-light);
        color: var(--color-error);
      }
    }

    .add-field-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      border: 2px dashed var(--border-default);
      border-radius: var(--radius-lg);
      color: var(--text-tertiary);
      font-weight: var(--weight-medium);
      transition: all var(--duration-fast) var(--ease-default);

      &:hover {
        border-color: var(--color-copper-400);
        color: var(--color-copper-500);
        background: var(--color-copper-50);
      }
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-subtle);
    }
  `,
})
export class EquipmentForm implements OnInit {
  id = input<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);

  saving = signal(false);
  categories = EQUIPMENT_CATEGORIES;
  icons = EQUIPMENT_ICONS;
  //customFields: CustomFieldForm[] = [];

  formData: Partial<Equipment> = {
    name: '',
    category: 'brewer',
    brand: '',
    model: '',
    notes: '',
    icon: '☕',
    archived: false,
    //customFields: [],
  };

  get isEdit(): boolean {
    return !!this.id();
  }

  async ngOnInit(): Promise<void> {
    if (this.id()) {
      const equip = await this.firestoreService.getEquipment(this.id()!);
      if (equip) {
        this.formData = { ...equip };
        // this.customFields = equip.customFields.map(f => ({
        //   ...f,
        //   optionsString: f.options?.join(', ') || '',
        // }));
      }
    }
  }

  addField(): void {
    // this.customFields.push({
    //   id: crypto.randomUUID(),
    //   label: '',
    //   type: 'number',
    //   required: false,
    // });
  }

  removeField(index: number): void {
    //this.customFields.splice(index, 1);
  }

  isValid(): boolean {
    return !!this.formData.name?.trim();
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;
    this.saving.set(true);

    try {
      // const fields: CustomFieldDefinition[] = this.customFields
      //   .filter(f => f.label?.trim())
      //   .map(f => ({
      //     id: f.id,
      //     label: f.label,
      //     type: f.type,
      //     required: f.required,
      //     min: f.min,
      //     max: f.max,
      //     step: f.step,
      //     unit: f.unit,
      //     options: f.type === 'select' && f.optionsString
      //       ? f.optionsString.split(',').map(s => s.trim()).filter(Boolean)
      //       : undefined,
      //     defaultValue: f.defaultValue,
      //   }));

      const data: Equipment = {
        ...(this.formData as Equipment),
        //customFields: fields,
      };

      if (this.isEdit) {
        await this.firestoreService.updateEquipment(this.id()!, data);
        this.toastService.success('Equipment updated!');
      } else {
        await this.firestoreService.createEquipment(data);
        this.toastService.success('Equipment added!');
      }

      this.router.navigate(['/equipment']);
    } catch {
      this.toastService.error('Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/equipment']);
  }
}
