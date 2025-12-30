import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Bean, BrewLog } from '@core/models';

@Component({
  selector: 'brew-bean-detail',
  standalone: true,
  imports: [RouterLink, Card, Button],
  template: `
    <div class="page">
      @if (bean()) {
        <header class="page-header">
          <button class="back-btn" (click)="goBack()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          @if (bean()!.photoURL) {
            <div class="bean-hero">
              <img [src]="bean()!.photoURL" [alt]="bean()!.name" />
            </div>
          }
          <div class="header-content">
            <span class="roaster">{{ bean()!.roaster }}</span>
            <h1>{{ bean()!.name }}</h1>
            <div class="origin-info">{{ bean()!.origin }}{{ bean()!.region ? ' · ' + bean()!.region : '' }}</div>
          </div>
          <div class="header-actions">
            <a [routerLink]="['edit']"><brew-button variant="secondary">Edit</brew-button></a>
            <brew-button variant="danger" (onClick)="deleteBean()">Delete</brew-button>
          </div>
        </header>
        
        <div class="detail-grid">
          <brew-card title="Details">
            <dl class="detail-list">
              <div class="detail-item"><dt>Process</dt><dd>{{ bean()!.process }}</dd></div>
              <div class="detail-item"><dt>Roast</dt><dd>{{ bean()!.roastLevel }}</dd></div>
              @if (bean()!.variety) { <div class="detail-item"><dt>Variety</dt><dd>{{ bean()!.variety }}</dd></div> }
              @if (bean()!.roastDate) { <div class="detail-item"><dt>Roast Date</dt><dd>{{ bean()?.roastDate }}</dd></div> }
              @if (bean()!.price) { <div class="detail-item"><dt>Price</dt><dd>\${{ bean()!.price }}</dd></div> }
            </dl>
          </brew-card>
          
          <brew-card title="Remaining">
            <div class="weight-display">
              <span class="weight-value">{{ bean()!.weightRemaining }}g</span>
              <span class="weight-total">of {{ bean()!.weight }}g</span>
            </div>
            <div class="weight-bar">
              <div class="weight-fill" [style.width.%]="(bean()!.weightRemaining / bean()!.weight) * 100"></div>
            </div>
          </brew-card>
        </div>
        
        @if (bean()!.notes) {
          <brew-card title="Notes"><p class="notes">{{ bean()!.notes }}</p></brew-card>
        }
        
        <section class="brews-section">
          <h2>Brews with this Bean</h2>
          @if (brews().length === 0) {
            <p class="no-brews">No brews yet with these beans.</p>
          } @else {
            <div class="brew-list">
              @for (brew of brews(); track brew.id) {
                <a [routerLink]="['/brews', brew.id]" class="brew-item">
                  <brew-card [hoverable]="true">
                    <div class="brew-row">
                      <span class="brew-date">{{ brew.date }}</span>
                      <span class="brew-params">{{ brew.coffeeGrams }}g · 1:{{ brew.ratio }}</span>
                      <div class="brew-rating">@for (s of [1,2,3,4,5]; track s) { <span [class.filled]="brew.rating/2 >= s">★</span> }</div>
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
    .page { max-width: 800px; margin: 0 auto; animation: fadeIn var(--duration-normal) var(--ease-out); }
    .page-header { margin-bottom: var(--space-6); }
    .back-btn { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--text-tertiary); font-size: var(--text-sm); font-weight: var(--weight-medium); margin-bottom: var(--space-4); &:hover { color: var(--text-primary); } }
    .bean-hero { height: 200px; margin-bottom: var(--space-4); border-radius: var(--radius-xl); overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; } }
    .roaster { color: var(--text-accent); font-weight: var(--weight-medium); }
    h1 { font-family: var(--font-display); font-size: var(--text-3xl); margin: var(--space-1) 0; }
    .origin-info { color: var(--text-tertiary); margin-bottom: var(--space-4); }
    .header-actions { display: flex; gap: var(--space-3); }
    
    .detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-4); margin-bottom: var(--space-4); @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .detail-list { display: grid; gap: var(--space-3); }
    .detail-item { display: flex; justify-content: space-between; dt { color: var(--text-muted); } dd { font-weight: var(--weight-medium); text-transform: capitalize; } }
    
    .weight-display { text-align: center; margin-bottom: var(--space-3); .weight-value { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: var(--weight-semibold); display: block; } .weight-total { color: var(--text-muted); font-size: var(--text-sm); } }
    .weight-bar { height: 8px; background: var(--color-cream-200); border-radius: var(--radius-full); overflow: hidden; }
    .weight-fill { height: 100%; background: linear-gradient(90deg, var(--color-copper-400), var(--color-copper-500)); border-radius: var(--radius-full); }
    
    .notes { color: var(--text-secondary); line-height: var(--leading-relaxed); margin: 0; white-space: pre-wrap; }
    
    .brews-section { margin-top: var(--space-8); h2 { font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-4); } }
    .no-brews { color: var(--text-muted); }
    .brew-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .brew-item { text-decoration: none; color: inherit; }
    .brew-row { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
    .brew-date { font-weight: var(--weight-medium); }
    .brew-params { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted); }
    .brew-rating { display: flex; gap: 2px; span { color: var(--color-cream-300); &.filled { color: var(--color-copper-400); } } }
  `
})
export class BeanDetail implements OnInit {
  @Input() id!: string;
  
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  
  bean = signal<Bean | null>(null);
  brews = signal<BrewLog[]>([]);
  
  async ngOnInit(): Promise<void> {
    const [bean, brews] = await Promise.all([
      this.firestoreService.getBean(this.id),
      this.firestoreService.getBrewLogsByBean(this.id)
    ]);
    this.bean.set(bean);
    this.brews.set(brews);
  }
  
  async deleteBean(): Promise<void> {
    if (!confirm('Delete these beans?')) return;
    try {
      await this.firestoreService.deleteBean(this.id);
      this.toastService.success('Beans deleted');
      this.router.navigate(['/beans']);
    } catch { this.toastService.error('Failed to delete'); }
  }
  
  goBack(): void { this.router.navigate(['/beans']); }
}
