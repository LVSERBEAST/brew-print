import { Component, inject, signal, Input, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { FormatTimePipe } from '@shared/pipes/format-time.pipe';
import { FormatDatePipe } from '@shared/pipes/format-date.pipe';
import {
  getBeanNames,
  getEquipmentName,
  getBrewMethodName,
} from '@shared/utils/utils';
import type { BrewLog, Bean, Equipment, BrewMethod } from '@core/models/models';

@Component({
  selector: 'brew-brew-log-detail',
  standalone: true,
  imports: [RouterLink, Card, Button, FormatTimePipe, FormatDatePipe],
  template: `
    <div class="page">
      @if (loading()) {
      <div class="skeleton-detail"></div>
      } @else if (brew()) {
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
        <div class="header-content">
          <span class="brew-date">{{ brew()?.createdAt | formatDate }}</span>
          <h1>{{ getBeanNamesDisplay() }}</h1>
          <div class="brew-rating-large">
            @for (star of [1, 2, 3, 4, 5]; track star) {
            <span class="star" [class.filled]="brew()!.rating / 2 >= star"
              >★</span
            >
            }
            <span class="rating-value">{{
              (brew()!.rating / 2).toFixed(1)
            }}</span>
          </div>
        </div>
        <div class="header-actions">
          <a [routerLink]="['edit']">
            <brew-button variant="secondary">Edit</brew-button>
          </a>
          <brew-button variant="danger" (onClick)="deleteBrew()"
            >Delete</brew-button
          >
        </div>
      </header>

      <!-- Parameters -->
      <brew-card title="Brew Parameters" class="detail-card">
        <div class="params-display">
          <div class="param-item">
            <span class="param-value">{{ brew()!.params.coffeeGrams }}</span>
            <span class="param-label">g coffee</span>
          </div>
          <div class="param-item">
            <span class="param-value">{{ brew()!.params.waterGrams }}</span>
            <span class="param-label">g water</span>
          </div>
          <div class="param-item">
            <span class="param-value">1:{{ brew()!.params.ratio }}</span>
            <span class="param-label">ratio</span>
          </div>
          @if (brew()!.params.waterTemp) {
          <div class="param-item">
            <span class="param-value">{{ brew()!.params.waterTemp }}°</span>
            <span class="param-label">temp (C)</span>
          </div>
          } @if (brew()!.params.brewTimeSeconds) {
          <div class="param-item">
            <span class="param-value">{{
              brew()!.params.brewTimeSeconds | formatTime
            }}</span>
            <span class="param-label">brew time</span>
          </div>
          } @if (brew()!.params.yieldGrams) {
          <div class="param-item">
            <span class="param-value">{{ brew()!.params.yieldGrams }}</span>
            <span class="param-label">g yield</span>
          </div>
          }
        </div>
        @if (brew()!.params.grindDescription) {
        <div class="grind-info">
          <span class="grind-label">Grind:</span>
          {{ brew()!.params.grindDescription }}
        </div>
        }
      </brew-card>

      <!-- Equipment -->
      @if (brew()!.equipmentIds.length > 0) {
      <brew-card title="Equipment Used" class="detail-card">
        <div class="tag-list">
          @for (equipId of brew()!.equipmentIds; track equipId) {
          <span class="tag">{{ getEquipmentNameById(equipId) }}</span>
          }
        </div>
      </brew-card>
      }

      <!-- Method -->
      @if (method()) {
      <brew-card title="Method" class="detail-card">
        <h3 class="method-name">{{ method()!.name }}</h3>
        @if (method()!.description) {
        <p class="method-desc">{{ method()!.description }}</p>
        }
      </brew-card>
      }

      <!-- Notes -->
      @if (brew()!.notes) {
      <brew-card title="Notes" class="detail-card">
        <p class="notes-text">{{ brew()!.notes }}</p>
      </brew-card>
      } }
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
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-tertiary);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      margin-bottom: var(--space-4);
      transition: color var(--duration-fast) var(--ease-default);

      &:hover {
        color: var(--text-primary);
      }
    }

    .header-content {
      margin-bottom: var(--space-4);
    }

    .brew-date {
      font-size: var(--text-sm);
      color: var(--text-muted);
      font-weight: var(--weight-medium);
    }

    h1 {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      margin: var(--space-1) 0 var(--space-3);
    }

    .brew-rating-large {
      display: flex;
      align-items: center;
      gap: var(--space-1);

      .star {
        font-size: var(--text-xl);
        color: var(--color-cream-300);

        &.filled {
          color: var(--color-copper-400);
        }
      }

      .rating-value {
        margin-left: var(--space-2);
        font-family: var(--font-mono);
        font-size: var(--text-lg);
        color: var(--text-secondary);
      }
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
    }

    .detail-card {
      margin-bottom: var(--space-4);
    }

    .params-display {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-6);
    }

    .param-item {
      display: flex;
      flex-direction: column;
    }

    .param-value {
      font-family: var(--font-mono);
      font-size: var(--text-2xl);
      font-weight: var(--weight-semibold);
      color: var(--text-primary);
    }

    .param-label {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }

    .grind-info {
      margin-top: var(--space-4);
      padding-top: var(--space-4);
      border-top: 1px solid var(--border-subtle);
      color: var(--text-secondary);

      .grind-label {
        font-weight: var(--weight-medium);
        color: var(--text-muted);
      }
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .tag {
      padding: var(--space-2) var(--space-3);
      background: var(--surface-subtle);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--text-secondary);
    }

    .method-name {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      margin: 0 0 var(--space-2);
    }

    .method-desc {
      color: var(--text-secondary);
      margin: 0;
    }

    .notes-text {
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      margin: 0;
      white-space: pre-wrap;
    }

    .skeleton-detail {
      height: 400px;
      border-radius: var(--radius-xl);
      background: var(--surface-card);
      animation: pulse 1.5s ease-in-out infinite;
    }
  `,
})
export class BrewLogDetail implements OnInit {
  id = input.required<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);

  loading = signal(true);
  brew = signal<BrewLog | null>(null);
  beans = signal<Bean[]>([]);
  equipment = signal<Equipment[]>([]);
  method = signal<BrewMethod | null>(null);

  async ngOnInit(): Promise<void> {
    const [brew, beans, equipment] = await Promise.all([
      this.firestoreService.getBrewLog(this.id()),
      this.firestoreService.getAllBeans(),
      this.firestoreService.getAllEquipment(),
    ]);

    this.brew.set(brew);
    this.beans.set(beans);
    this.equipment.set(equipment);

    if (brew?.brewMethodId) {
      const method = await this.firestoreService.getBrewMethod(
        brew.brewMethodId
      );
      this.method.set(method);
    }

    this.loading.set(false);
  }

  getBeanNamesDisplay(): string {
    const brew = this.brew();
    if (!brew) return '';
    return getBeanNames(brew.beanIds, this.beans());
  }

  getEquipmentNameById(id: string): string {
    return getEquipmentName(id, this.equipment());
  }

  async deleteBrew(): Promise<void> {
    if (!confirm('Delete this brew?')) return;

    try {
      await this.firestoreService.deleteBrewLog(this.id());
      this.toastService.success('Brew deleted');
      this.router.navigate(['/brews']);
    } catch {
      this.toastService.error('Failed to delete');
    }
  }

  goBack(): void {
    this.router.navigate(['/brews']);
  }
}
