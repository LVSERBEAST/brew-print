import { Component, inject, signal, Input, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { ToastService } from '@core/services/toast.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Equipment, BrewLog } from '@core/models';

@Component({
  selector: 'brew-equipment-detail',
  standalone: true,
  imports: [RouterLink, Card, Button],
  template: `
    <div class="page">
      @if (equipment()) {
        <header class="page-header">
          <button class="back-btn" (click)="goBack()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>Back</button>
          <span class="category-badge">{{ equipment()!.category }}</span>
          <h1>{{ equipment()!.name }}</h1>
          @if (equipment()!.brand) { <p class="brand">{{ equipment()!.brand }}{{ equipment()!.model ? ' ' + equipment()!.model : '' }}</p> }
          <div class="header-actions">
            <a [routerLink]="['edit']"><brew-button variant="secondary">Edit</brew-button></a>
            <brew-button variant="danger" (onClick)="deleteEquipment()">Delete</brew-button>
          </div>
        </header>
        
        @if (equipment()!.customFields.length > 0) {
          <brew-card title="Custom Fields">
            <div class="fields-list">
              @for (field of equipment()!.customFields; track field.id) {
                <div class="field-item">
                  <span class="field-label">{{ field.label }}</span>
                  <span class="field-type">{{ field.type }}{{ field.min !== undefined ? ' (' + field.min + '-' + field.max + ')' : '' }}</span>
                </div>
              }
            </div>
          </brew-card>
        }
        
        @if (equipment()!.notes) {
          <brew-card title="Notes"><p class="notes">{{ equipment()!.notes }}</p></brew-card>
        }
        
        <section class="brews-section">
          <h2>Used in {{ brews().length }} brews</h2>
          @if (brews().length > 0) {
            <div class="brew-list">
              @for (brew of brews().slice(0, 10); track brew.id) {
                <a [routerLink]="['/brews', brew.id]" class="brew-item">
                  <brew-card [hoverable]="true">
                    <div class="brew-row">
                      <span class="brew-date">{{ brew.date }}</span>
                      <span class="brew-params">{{ brew.coffeeGrams }}g · 1:{{ brew.ratio }}</span>
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
    .category-badge { display: inline-block; padding: var(--space-1) var(--space-3); background: var(--color-copper-100); color: var(--color-copper-700); border-radius: var(--radius-md); font-size: var(--text-sm); font-weight: var(--weight-medium); text-transform: capitalize; margin-bottom: var(--space-2); }
    h1 { font-family: var(--font-display); font-size: var(--text-3xl); margin: 0; }
    .brand { color: var(--text-tertiary); margin: var(--space-2) 0 var(--space-4); }
    .header-actions { display: flex; gap: var(--space-3); }
    
    .fields-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .field-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--surface-subtle); border-radius: var(--radius-md); }
    .field-label { font-weight: var(--weight-medium); }
    .field-type { font-size: var(--text-sm); color: var(--text-muted); text-transform: capitalize; }
    
    .notes { color: var(--text-secondary); margin: 0; white-space: pre-wrap; }
    
    brew-card { margin-bottom: var(--space-4); }
    
    .brews-section { margin-top: var(--space-6); h2 { font-family: var(--font-display); font-size: var(--text-xl); margin-bottom: var(--space-4); } }
    .brew-list { display: flex; flex-direction: column; gap: var(--space-3); }
    .brew-item { text-decoration: none; color: inherit; }
    .brew-row { display: flex; justify-content: space-between; align-items: center; }
    .brew-date { font-weight: var(--weight-medium); }
    .brew-params { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted); }
  `
})
export class EquipmentDetail implements OnInit {
  @Input() id!: string;
  
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private toastService = inject(ToastService);
  
  equipment = signal<Equipment | null>(null);
  brews = signal<BrewLog[]>([]);
  
  async ngOnInit(): Promise<void> {
    const [equip, brews] = await Promise.all([
      this.firestoreService.getEquipment(this.id),
      this.firestoreService.getBrewLogsByEquipment(this.id)
    ]);
    this.equipment.set(equip);
    this.brews.set(brews);
  }
  
  async deleteEquipment(): Promise<void> {
    if (!confirm('Delete this equipment?')) return;
    try {
      await this.firestoreService.deleteEquipment(this.id);
      this.toastService.success('Equipment deleted');
      this.router.navigate(['/equipment']);
    } catch { this.toastService.error('Failed to delete'); }
  }
  
  goBack(): void { this.router.navigate(['/equipment']); }
}
