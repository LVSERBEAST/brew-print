import { Component, inject, signal, Input, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import { FormatTimePipe } from '@shared/pipes/format-time.pipe';
import { FormatDatePipe } from '@shared/pipes/format-date.pipe';
import type { BrewMethod, BrewLog } from '@core/models/models';

@Component({
  selector: 'brew-method-detail',
  standalone: true,
  imports: [RouterLink, Card, Button, FormatTimePipe, FormatDatePipe],
  template: `
    <div class="page">
      @if (method()) {
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
        <h1>{{ method()!.name }}</h1>
        <div class="header-actions">
          <a [routerLink]="['edit']">
            <brew-button variant="secondary">Edit</brew-button>
          </a>
          <brew-button variant="danger" (onClick)="deleteBrewMethod()"
            >Delete</brew-button
          >
        </div>
      </header>

      @if (method()!.description) {
      <brew-card title="Description">
        <p class="description">{{ method()!.description }}</p>
      </brew-card>
      }

      <brew-card title="Parameters">
        <div class="params-grid">
          @if (method()!.params.coffeeGrams) {
          <div class="param">
            <span class="param-value">{{ method()!.params.coffeeGrams }}</span>
            <span class="param-label">g coffee</span>
          </div>
          } @if (method()!.params.waterGrams) {
          <div class="param">
            <span class="param-value">{{ method()!.params.waterGrams }}</span>
            <span class="param-label">g water</span>
          </div>
          } @if (method()!.params.ratio) {
          <div class="param">
            <span class="param-value">1:{{ method()!.params.ratio }}</span>
            <span class="param-label">ratio</span>
          </div>
          } @if (method()!.params.waterTemp) {
          <div class="param">
            <span class="param-value">{{ method()!.params.waterTemp }}°</span>
            <span class="param-label">temp (C)</span>
          </div>
          } @if (method()!.params.brewTimeSeconds) {
          <div class="param">
            <span class="param-value">{{
              method()!.params.brewTimeSeconds | formatTime
            }}</span>
            <span class="param-label">brew time</span>
          </div>
          } @if (method()!.params.bloomTimeSeconds) {
          <div class="param">
            <span class="param-value"
              >{{ method()!.params.bloomTimeSeconds }}s</span
            >
            <span class="param-label">bloom</span>
          </div>
          } @if (method()!.params.yieldGrams) {
          <div class="param">
            <span class="param-value">{{ method()!.params.yieldGrams }}</span>
            <span class="param-label">g yield</span>
          </div>
          }
        </div>
        @if (method()!.params.grindDescription) {
        <div class="grind-info">
          <span class="grind-label">Grind:</span>
          {{ method()!.params.grindDescription }}
        </div>
        }
      </brew-card>

      <section class="brews-section">
        <h2>Used in {{ brews().length }} brews</h2>
        @if (brews().length > 0) {
        <div class="brew-list">
          @for (brew of brews().slice(0, 10); track brew.id) {
          <a [routerLink]="['/brews', brew.id]" class="brew-item">
            <brew-card [hoverable]="true">
              <div class="brew-row">
                <span class="brew-date">{{ brew.createdAt | formatDate }}</span>
                <span class="brew-params"
                  >{{ brew.params.coffeeGrams }}g · 1:{{
                    brew.params.ratio
                  }}</span
                >
              </div>
            </brew-card>
          </a>
          }
        </div>
        }
      </section>
      }
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
      margin-bottom: var(--space-4);

      &:hover {
        color: var(--text-primary);
      }
    }

    h1 {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      margin: 0 0 var(--space-4);
    }

    .header-actions {
      display: flex;
      gap: var(--space-3);
    }

    .description {
      color: var(--text-secondary);
      margin: 0;
      white-space: pre-wrap;
      line-height: var(--leading-relaxed);
    }

    brew-card {
      margin-bottom: var(--space-4);
    }

    .params-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-6);
    }

    .param {
      display: flex;
      flex-direction: column;
    }

    .param-value {
      font-family: var(--font-mono);
      font-size: var(--text-2xl);
      font-weight: var(--weight-semibold);
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

    .brews-section {
      margin-top: var(--space-6);

      h2 {
        font-family: var(--font-display);
        font-size: var(--text-xl);
        margin-bottom: var(--space-4);
      }
    }

    .brew-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .brew-item {
      text-decoration: none;
      color: inherit;
    }

    .brew-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brew-date {
      font-weight: var(--weight-medium);
    }

    .brew-params {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  `,
})
export class MethodDetail implements OnInit {
  id = input.required<string>();

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);

  method = signal<BrewMethod | null>(null);
  brews = signal<BrewLog[]>([]);

  async ngOnInit(): Promise<void> {
    const [method, brews] = await Promise.all([
      this.firestoreService.getBrewMethod(this.id()),
      this.firestoreService.getBrewLogsByBrewMethod(this.id()),
    ]);
    this.method.set(method);
    this.brews.set(brews);
  }

  async deleteBrewMethod(): Promise<void> {
    if (!confirm('Delete this brew method?')) return;
    try {
      await this.firestoreService.deleteBrewMethod(this.id());
      this.toastService.success('Deleted');
      this.router.navigate(['/methods']);
    } catch {
      this.toastService.error('Failed');
    }
  }

  goBack(): void {
    this.router.navigate(['/methods']);
  }
}
