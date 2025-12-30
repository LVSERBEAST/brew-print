import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { StorageService } from '@core/services/storage.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { InputComponent } from '@shared/ui/input/input';
import type { Bean, RoastLevel, ProcessMethod } from '@core/models';

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
              [(ngModel)]="formData.name"
              name="name"
              placeholder="e.g., Ethiopia Yirgacheffe"
              [required]="true"
            />
            <brew-input
              label="Roaster"
              [(ngModel)]="formData.roaster"
              name="roaster"
              placeholder="e.g., Counter Culture"
              [required]="true"
            />
          </div>

          <div class="form-grid">
            <brew-input
              label="Origin"
              [(ngModel)]="formData.origin"
              name="origin"
              placeholder="e.g., Ethiopia"
              [required]="true"
            />
            <brew-input
              label="Region"
              [(ngModel)]="formData.region"
              name="region"
              placeholder="e.g., Gedeb"
            />
          </div>

          <brew-input
            label="Variety"
            [(ngModel)]="formData.variety"
            name="variety"
            placeholder="e.g., Heirloom, Bourbon"
          />
        </brew-card>

        <brew-card title="Processing" class="form-section">
          <div class="form-grid">
            <div class="select-wrapper">
              <label class="select-label">Process</label>
              <select
                class="select-input"
                [(ngModel)]="formData.process"
                name="process"
              >
                <option value="washed">Washed</option>
                <option value="natural">Natural</option>
                <option value="honey">Honey</option>
                <option value="anaerobic">Anaerobic</option>
                <option value="experimental">Experimental</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="select-wrapper">
              <label class="select-label">Roast Level</label>
              <select
                class="select-input"
                [(ngModel)]="formData.roastLevel"
                name="roastLevel"
              >
                <option value="light">Light</option>
                <option value="light-medium">Light-Medium</option>
                <option value="medium">Medium</option>
                <option value="medium-dark">Medium-Dark</option>
                <option value="dark">Dark</option>
              </select>
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

        <brew-card title="Quantity" class="form-section">
          <div class="form-grid">
            <brew-input
              label="Total Weight"
              type="number"
              suffix="g"
              [(ngModel)]="formData.weight"
              name="weight"
              [min]="1"
              [required]="true"
            />
            <brew-input
              label="Remaining"
              type="number"
              suffix="g"
              [(ngModel)]="formData.weightRemaining"
              name="weightRemaining"
              [min]="0"
            />
          </div>
          <brew-input
            label="Price"
            type="number"
            prefix="$"
            [(ngModel)]="formData.price"
            name="price"
            [min]="0"
            [step]="0.01"
          />
        </brew-card>

        <brew-card title="Photo" class="form-section">
          <div class="photo-upload">
            @if (photoPreview()) {
            <div class="photo-preview">
              <img [src]="photoPreview()" alt="Bean photo" />
              <button
                type="button"
                class="remove-photo"
                (click)="removePhoto()"
              >
                ×
              </button>
            </div>
            } @else {
            <label class="upload-area">
              <input
                type="file"
                accept="image/*"
                (change)="onPhotoSelect($event)"
                hidden
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Upload photo</span>
            </label>
            }
          </div>
        </brew-card>

        <brew-card title="Notes" class="form-section">
          <textarea
            class="textarea"
            [(ngModel)]="formData.notes"
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
            >{{ isEdit ? 'Save' : 'Add Beans' }}</brew-button
          >
        </div>
      </form>
    </div>
  `,
  styles: `
    .page { max-width: 700px; margin: 0 auto; animation: fadeIn var(--duration-normal) var(--ease-out); }
    
    .page-header {
      margin-bottom: var(--space-6);
      .back-btn { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm); font-weight: var(--weight-medium); margin-bottom: var(--space-3); &:hover { color: var(--text-primary); } }
      h1 { font-family: var(--font-display); font-size: var(--text-3xl); margin: 0; }
    }
    
    .form-layout { display: flex; flex-direction: column; gap: var(--space-5); }
    .form-section { margin-bottom: 0; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4); &:last-child { margin-bottom: 0; } }
    
    .select-wrapper { display: flex; flex-direction: column; gap: var(--space-2); }
    .select-label { font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--text-secondary); }
    .select-input { width: 100%; height: 48px; padding: 0 var(--space-4); background: var(--surface-card); border: 2px solid var(--border-default); border-radius: var(--radius-lg); font-size: var(--text-base); cursor: pointer; &:focus { outline: none; border-color: var(--border-focus); box-shadow: var(--shadow-focus); } }
    
    .photo-upload { .photo-preview { position: relative; width: 200px; height: 200px; border-radius: var(--radius-lg); overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } .remove-photo { position: absolute; top: var(--space-2); right: var(--space-2); width: 28px; height: 28px; background: var(--surface-card); border-radius: var(--radius-full); font-size: 18px; color: var(--text-secondary); display: flex; align-items: center; justify-content: center; &:hover { background: var(--color-error-light); color: var(--color-error); } } } .upload-area { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-2); width: 200px; height: 150px; border: 2px dashed var(--border-default); border-radius: var(--radius-lg); color: var(--text-muted); cursor: pointer; transition: all var(--duration-fast) var(--ease-default); &:hover { border-color: var(--color-copper-400); color: var(--color-copper-500); background: var(--color-copper-50); } } }
    
    .textarea { width: 100%; padding: var(--space-3) var(--space-4); background: var(--surface-card); border: 2px solid var(--border-default); border-radius: var(--radius-lg); font-family: inherit; font-size: var(--text-base); resize: vertical; min-height: 100px; &:focus { outline: none; border-color: var(--border-focus); box-shadow: var(--shadow-focus); } }
    
    .form-actions { display: flex; justify-content: flex-end; gap: var(--space-3); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle); }
  `,
})
export class BeanForm implements OnInit {
  @Input() id?: string;

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);

  saving = signal(false);
  photoPreview = signal<string | null>(null);
  photoFile: File | null = null;

  roastDateString = '';
  purchaseDateString = '';

  formData: Partial<Bean> = {
    name: '',
    roaster: '',
    origin: '',
    region: '',
    variety: '',
    process: 'washed' as ProcessMethod,
    roastLevel: 'medium' as RoastLevel,
    weight: 250,
    weightRemaining: 250,
    price: undefined,
    notes: '',
    archived: false,
    customFields: [],
    customFieldValues: [],
  };

  get isEdit(): boolean {
    return !!this.id;
  }

  async ngOnInit(): Promise<void> {
    if (this.id) {
      const bean = await this.firestoreService.getBean(this.id);
      if (bean) {
        this.formData = { ...bean };
        if (bean.photoURL) this.photoPreview.set(bean.photoURL);
        if (bean.roastDate)
          this.roastDateString = bean.roastDate.toDateString();
        if (bean.purchaseDate)
          this.purchaseDateString = bean.purchaseDate.toDateString();
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
    this.formData.photoURL = undefined;
  }

  isValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.roaster &&
      this.formData.origin &&
      this.formData.weight
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.isValid()) return;
    this.saving.set(true);

    try {
      const data: Bean = {
        ...(this.formData as Bean),
        roastDate: this.roastDateString
          ? ({
              seconds: new Date(this.roastDateString).getTime() / 1000,
              nanoseconds: 0,
            } as any)
          : undefined,
        purchaseDate: this.purchaseDateString
          ? ({
              seconds: new Date(this.purchaseDateString).getTime() / 1000,
              nanoseconds: 0,
            } as any)
          : undefined,
      };

      let beanId = this.id;
      if (this.isEdit) {
        await this.firestoreService.updateBean(this.id!, data);
      } else {
        beanId = await this.firestoreService.createBean(data);
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
