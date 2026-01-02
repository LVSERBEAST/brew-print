import { Component, inject, signal, Input, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { StorageService } from '@core/services/storage.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import { DEFAULT_BEAN_IMAGE } from '@shared/constants/constants';
import type {
  Bean,
  RoastLevel,
  ProcessMethod,
  WeightUnit,
} from '@core/models/models';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'brew-bean-form',
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
        <h1>{{ isEdit ? 'Edit Beans' : 'Add Beans' }}</h1>
      </header>

      <form (ngSubmit)="onSubmit()" class="form-layout">
        <brew-card title="Basic Info" class="form-section">
          <div class="form-grid">
            <brew-input
              label="Name"
              [(ngModel)]="name"
              name="name"
              placeholder="e.g., Ethiopia Yirgacheffe"
              [required]="true"
            />
            <brew-input
              label="Roaster"
              [(ngModel)]="roaster"
              name="roaster"
              placeholder="e.g., Counter Culture"
            />
          </div>

          <div class="form-grid">
            <brew-input
              label="Origin"
              [(ngModel)]="origin"
              name="origin"
              placeholder="e.g., Ethiopia"
            />
            <brew-input
              label="Region"
              [(ngModel)]="region"
              name="region"
              placeholder="e.g., Gedeb"
            />
          </div>

          <brew-input
            label="Variety"
            [(ngModel)]="variety"
            name="variety"
            placeholder="e.g., Heirloom, Bourbon"
          />
        </brew-card>

        <brew-card title="Processing" class="form-section">
          <div class="form-grid">
            <div class="select-wrapper">
              <label class="select-label">Process</label>
              <div class="select-container">
                <select
                  class="select-input"
                  [(ngModel)]="process"
                  name="process"
                >
                  <option value="washed">Washed</option>
                  <option value="natural">Natural</option>
                  <option value="honey">Honey</option>
                  <option value="anaerobic">Anaerobic</option>
                  <option value="experimental">Experimental</option>
                  <option value="other">Other</option>
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
            </div>

            <div class="select-wrapper">
              <label class="select-label">Roast Level</label>
              <div class="select-container">
                <select
                  class="select-input"
                  [(ngModel)]="roastLevel"
                  name="roastLevel"
                >
                  <option value="light">Light</option>
                  <option value="light-medium">Light-Medium</option>
                  <option value="medium">Medium</option>
                  <option value="medium-dark">Medium-Dark</option>
                  <option value="dark">Dark</option>
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
            </div>
          </div>

          <div class="form-grid">
            <brew-input
              label="Roast Date"
              type="date"
              [(ngModel)]="roastDateString"
              name="roastDate"
            />
            <brew-input
              label="Purchase Date"
              type="date"
              [(ngModel)]="purchaseDateString"
              name="purchaseDate"
            />
          </div>
        </brew-card>

        <brew-card title="Quantity (Optional)" class="form-section">
          <div class="form-grid-three">
            <brew-input
              label="Total Weight"
              type="number"
              [(ngModel)]="weight"
              name="weight"
              [min]="0"
              placeholder="e.g., 250"
            />
            <brew-input
              label="Remaining"
              type="number"
              [(ngModel)]="weightRemaining"
              name="weightRemaining"
              [min]="0"
              placeholder="e.g., 200"
            />
            <div class="select-wrapper">
              <label class="select-label">Unit</label>
              <div class="select-container">
                <select
                  class="select-input"
                  [(ngModel)]="weightUnit"
                  name="weightUnit"
                >
                  <option value="g">Grams (g)</option>
                  <option value="oz">Ounces (oz)</option>
                  <option value="lb">Pounds (lb)</option>
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
            </div>
          </div>
          <brew-input
            label="Price"
            type="number"
            prefix="$"
            [(ngModel)]="price"
            name="price"
            [min]="0"
            [step]="0.01"
          />
        </brew-card>

        <brew-card title="Photo" class="form-section">
          <div class="photo-upload">
            <div class="photo-preview">
              <img [src]="photoPreview() || defaultImage" alt="Bean photo" />
              @if (photoPreview()) {
              <button
                type="button"
                class="remove-photo"
                (click)="removePhoto()"
              >
                ×
              </button>
              }
            </div>
            <label class="upload-btn">
              <input
                type="file"
                accept="image/*"
                (change)="onPhotoSelect($event)"
                hidden
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {{ photoPreview() ? 'Change' : 'Upload' }} Photo
            </label>
          </div>
        </brew-card>

        <brew-card title="Notes" class="form-section">
          <textarea
            class="textarea"
            [(ngModel)]="notes"
            name="notes"
            rows="4"
            placeholder="Tasting notes, brewing tips, etc."
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
            {{ isEdit ? 'Save' : 'Add Beans' }}
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

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-4);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .form-grid-three {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--space-4);
      margin-bottom: var(--space-4);

      @media (max-width: 500px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      min-width: 120px;
    }

    .select-label {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
    }

    .select-container {
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

    .photo-upload {
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);

      .photo-preview {
        position: relative;
        width: 120px;
        height: 120px;
        border-radius: var(--radius-lg);
        overflow: hidden;
        background: var(--surface-subtle);
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-photo {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          width: 28px;
          height: 28px;
          background: var(--surface-card);
          border-radius: var(--radius-full);
          font-size: 18px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);

          &:hover {
            background: var(--color-error-light);
            color: var(--color-error);
          }
        }
      }

      .upload-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-4);
        border: 2px dashed var(--border-default);
        border-radius: var(--radius-lg);
        color: var(--text-tertiary);
        font-weight: var(--weight-medium);
        font-size: var(--text-sm);
        cursor: pointer;
        transition: all var(--duration-fast) var(--ease-default);

        &:hover {
          border-color: var(--color-copper-400);
          color: var(--color-copper-500);
          background: var(--color-copper-50);
        }
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
  `,
})
export class BeanForm implements OnInit {
  id = input<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);

  saving = signal(false);
  photoPreview = signal<string | null>(null);
  photoFile: File | null = null;
  defaultImage = DEFAULT_BEAN_IMAGE;

  // Form fields
  name = '';
  roaster = '';
  origin = '';
  region = '';
  variety = '';
  process: ProcessMethod = 'washed';
  roastLevel: RoastLevel = 'medium';
  roastDateString = '';
  purchaseDateString = '';
  weight?: number;
  weightRemaining?: number;
  weightUnit: WeightUnit = 'g';
  price?: number;
  notes = '';
  photoURL?: string;

  get isEdit(): boolean {
    return !!this.id();
  }

  async ngOnInit(): Promise<void> {
    if (this.id()) {
      const bean = await this.firestoreService.getBean(this.id()!);
      if (bean) {
        this.name = bean.name;
        this.roaster = bean.roaster || '';
        this.origin = bean.origin || '';
        this.region = bean.region || '';
        this.variety = bean.variety || '';
        this.process = bean.process || 'washed';
        this.roastLevel = bean.roastLevel || 'medium';
        this.weight = bean.weight;
        this.weightRemaining = bean.weightRemaining;
        this.weightUnit = bean.weightUnit || 'g';
        this.price = bean.price;
        this.notes = bean.notes || '';
        this.photoURL = bean.photoURL;

        if (bean.photoURL) {
          this.photoPreview.set(bean.photoURL);
        }

        // Handle Firestore Timestamp for dates
        if (bean.roastDate) {
          const date =
            bean.roastDate instanceof Timestamp
              ? bean.roastDate.toDate()
              : new Date(bean.roastDate as any);
          this.roastDateString = date.toISOString().split('T')[0];
        }
        if (bean.purchaseDate) {
          const date =
            bean.purchaseDate instanceof Timestamp
              ? bean.purchaseDate.toDate()
              : new Date(bean.purchaseDate as any);
          this.purchaseDateString = date.toISOString().split('T')[0];
        }
      }
    }
  }

  onPhotoSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.photoFile = file;
      const reader = new FileReader();
      reader.onload = () => this.photoPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoFile = null;
    this.photoPreview.set(null);
    this.photoURL = undefined;
  }

  isValid(): boolean {
    // Only name is required
    return !!this.name;
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;
    this.saving.set(true);

    try {
      const data: Partial<Bean> = {
        name: this.name,
        roaster: this.roaster || undefined,
        origin: this.origin || undefined,
        region: this.region || undefined,
        variety: this.variety || undefined,
        process: this.process,
        roastLevel: this.roastLevel,
        roastDate: this.roastDateString
          ? Timestamp.fromDate(new Date(this.roastDateString))
          : undefined,
        purchaseDate: this.purchaseDateString
          ? Timestamp.fromDate(new Date(this.purchaseDateString))
          : undefined,
        weight: this.weight,
        weightRemaining: this.weightRemaining,
        weightUnit: this.weightUnit,
        price: this.price,
        notes: this.notes || undefined,
        photoURL: this.photoURL,
        archived: false,
      };

      let beanId = this.id();
      if (this.isEdit) {
        await this.firestoreService.updateBean(this.id()!, data);
      } else {
        beanId = await this.firestoreService.createBean(data as Bean);
      }

      if (this.photoFile && beanId) {
        const photoURL = await this.storageService.uploadBeanPhoto(
          this.photoFile,
          beanId
        );
        await this.firestoreService.updateBean(beanId, { photoURL });
      }

      this.toastService.success(
        this.isEdit ? 'Beans updated!' : 'Beans added!'
      );
      this.router.navigate(['/beans']);
    } catch {
      this.toastService.error('Failed to save beans');
    } finally {
      this.saving.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/beans']);
  }
}
