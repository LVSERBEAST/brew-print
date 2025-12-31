import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Method, BrewLog } from '@core/models';

@Component({
  selector: 'brew-method-detail',
  standalone: true,
  imports: [RouterLink, Card, Button],
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
            <path d="m15 18-6-6 6-6" /></svg
          >Back
        </button>
        <h1>{{ method()!.name }}</h1>
        <div class="header-actions">
          <a [routerLink]="['edit']"
            ><brew-button variant="secondary">Edit</brew-button></a
          >
          <brew-button variant="danger" (onClick)="deleteBrewMethod()"
            >Delete</brew-button
          >
        </div>
      </header>

      @if (method()!.description) {
      <brew-card title="Description"
        ><p class="description">{{ method()!.description }}</p></brew-card
      >
      }

      <brew-card title="Parameters">
        <div class="params-grid">
          @if (method()!.coffeeGrams) {
          <div class="param">
            <span class="param-value">{{ method()!.coffeeGrams }}</span
            ><span class="param-label">g coffee</span>
          </div>
          } @if (method()!.waterGrams) {
          <div class="param">
            <span class="param-value">{{ method()!.waterGrams }}</span
            ><span class="param-label">g water</span>
          </div>
          } @if (method()!.ratio) {
          <div class="param">
            <span class="param-value">1:{{ method()!.ratio }}</span
            ><span class="param-label">ratio</span>
          </div>
          } @if (method()!.waterTemp) {
          <div class="param">
            <span class="param-value">{{ method()!.waterTemp }}°</span
            ><span class="param-label">temp (C)</span>
          </div>
          } @if (method()!.brewTimeSeconds) {
          <div class="param">
            <span class="param-value">{{
              formatTime(method()!.brewTimeSeconds!)
            }}</span
            ><span class="param-label">brew time</span>
          </div>
          } @if (method()!.bloomTimeSeconds) {
          <div class="param">
            <span class="param-value">{{ method()!.bloomTimeSeconds }}s</span
            ><span class="param-label">bloom</span>
          </div>
          }
        </div>
        @if (method()!.grindDescription) {
        <div class="grind-info">
          <span class="grind-label">Grind:</span>
          {{ method()!.grindDescription }}
        </div>
        }
      </brew-card>

      <section class="brews-section">
        <h2>Used in {{ brews().length }} brews</h2>
        @if (brews().length > 0) {
        <div class="brew-list">
          @for (brew of brews().slice(0, 10); track brew.id) {
          <a [routerLink]="['/brews', brew.id]" class="brew-item"
            ><brew-card [hoverable]="true"
              ><div class="brew-row">
                <span class="brew-date">{{ brew.date }}</span
                ><span class="brew-params"
                  >{{ brew.coffeeGrams }}g · 1:{{ brew.ratio }}</span
                >
              </div></brew-card
            ></a
          >
          }
        </div>
        }
      </section>
      }
    </div>
  `,
  styles: `
    .page { max-width: 800px; margin: 0 auto; animation: fadeIn var(--duration-normal) var(--ease-out); }
    .page-header { margin-bottom: var(--space-6); }
    .back-btn { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm); margin-bottom: var(--space-4); &:hover { color: var(--text-primary); } }
    h1 { font-family: var(--font-display); font-size: var(--text-3xl); margin: 0 0 var(--space-4); }
    .header-actions { display: flex; gap: var(--space-3); }
    .description { color: var(--text-secondary); margin: 0; white-space: pre-wrap; line-height: var(--leading-relaxed); }
    
    brew-card { margin-bottom: var(--space-4); }
    
    .params-grid { display: flex; flex-wrap: wrap; gap: var(--space-6); }
    .param { display: flex; flex-direction: column; }
    .param-value { font-family: var(--font-mono); font-size: var(--text-2xl); font-weight: var(--weight-semibold); }
    .param-label { font-size: var(--text-sm); color: var(--text-muted); }
    .grind-info { margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle); color: var(--text-secondary); .grind-label { font-weight: var(--weight-medium); color: var(--text-muted); } }
    
    .brews-section { margin-top: var(--space-6); h2 { font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-4); } }
    .brew-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .brew-item { text-decoration: none; color: inherit; }
    .brew-row { display: flex; justify-content: space-between; align-items: center; }
    .brew-date { font-weight: var(--weight-medium); }
    .brew-params { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted); }
  `,
})
export class MethodDetail implements OnInit {
  @Input() id!: string;

  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);

  method = signal<Method | null>(null);
  brews = signal<BrewLog[]>([]);

  async ngOnInit(): Promise<void> {
    const [tech, brews] = await Promise.all([
      this.firestoreService.getMethod(this.id),
      this.firestoreService.getBrewLogsByMethod(this.id),
    ]);
    this.method.set(tech);
    this.brews.set(brews);
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60),
      s = sec % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }

  async deleteBrewMethod(): Promise<void> {
    if (!confirm('Delete this brew method?')) return;
    try {
      await this.firestoreService.deleteMethod(this.id);
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
