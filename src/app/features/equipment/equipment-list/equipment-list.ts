import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Equipment, EquipmentCategory } from '@core/models';

const CATEGORY_ICONS: Record<EquipmentCategory, string> = {
  brewer: '☕', grinder: '⚙️', kettle: '🫖', scale: '⚖️', machine: '🔧', accessory: '🔩', other: '📦'
};

@Component({
  selector: 'brew-equipment-list',
  standalone: true,
  imports: [RouterLink, Card, Button],
  template: `
    <div class="page">
      <header class="page-header">
        <div><h1>Equipment</h1><p class="subtitle">{{ equipment().length }} items</p></div>
        <a routerLink="new"><brew-button><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Equipment</brew-button></a>
      </header>
      
      <div class="category-tabs">
        <button class="tab" [class.active]="activeCategory() === 'all'" (click)="activeCategory.set('all')">All</button>
        @for (cat of categories; track cat) {
          <button class="tab" [class.active]="activeCategory() === cat" (click)="activeCategory.set(cat)">{{ cat }}</button>
        }
      </div>
      
      @if (loading()) {
        <div class="loading-grid">@for (i of [1,2,3,4]; track i) { <div class="skeleton-card"></div> }</div>
      } @else if (filteredEquipment().length === 0) {
        <brew-card class="empty-state">
          <div class="empty-content">
            <span class="empty-icon">⚙️</span>
            <h3>No equipment</h3>
            <p>Add your brewing gear to track usage.</p>
            <a routerLink="new"><brew-button>Add Equipment</brew-button></a>
          </div>
        </brew-card>
      } @else {
        <div class="equipment-grid">
          @for (item of filteredEquipment(); track item.id) {
            <a [routerLink]="[item.id]" class="equip-link">
              <brew-card [hoverable]="true" class="equip-card">
                <div class="equip-icon">{{ getCategoryIcon(item.category) }}</div>
                <h3 class="equip-name">{{ item.name }}</h3>
                <span class="equip-category">{{ item.category }}</span>
                @if (item.brand) { <span class="equip-brand">{{ item.brand }}{{ item.model ? ' ' + item.model : '' }}</span> }
                @if (item.customFields.length > 0) {
                  <div class="custom-fields-badge">{{ item.customFields.length }} custom fields</div>
                }
              </brew-card>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .page { max-width: var(--container-lg); margin: 0 auto; animation: fadeIn var(--duration-normal) var(--ease-out); }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-5); gap: var(--space-4); h1 { font-family: var(--font-display); font-size: var(--text-3xl); margin: 0 0 var(--space-1); } .subtitle { color: var(--text-tertiary); margin: 0; } }
    
    .category-tabs { display: flex; gap: var(--space-2); margin-bottom: var(--space-6); flex-wrap: wrap; }
    .tab { padding: var(--space-2) var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--text-tertiary); background: var(--surface-subtle); text-transform: capitalize; transition: all var(--duration-fast) var(--ease-default); &:hover { color: var(--text-primary); } &.active { background: var(--color-copper-500); color: white; } }
    
    .equipment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
    .equip-link { text-decoration: none; color: inherit; }
    .equip-card { text-align: center; }
    .equip-icon { font-size: 2.5rem; margin-bottom: var(--space-3); }
    .equip-name { font-family: var(--font-display); font-size: var(--text-lg); margin: 0 0 var(--space-1); }
    .equip-category { display: block; font-size: var(--text-sm); color: var(--text-accent); text-transform: capitalize; margin-bottom: var(--space-2); }
    .equip-brand { display: block; font-size: var(--text-sm); color: var(--text-muted); }
    .custom-fields-badge { display: inline-block; margin-top: var(--space-3); padding: var(--space-1) var(--space-2); background: var(--surface-subtle); border-radius: var(--radius-sm); font-size: var(--text-xs); color: var(--text-tertiary); }
    
    .empty-state { text-align: center; }
    .empty-content { padding: var(--space-12) var(--space-4); .empty-icon { font-size: 3rem; display: block; margin-bottom: var(--space-4); opacity: 0.5; } h3 { font-family: var(--font-display); margin: 0 0 var(--space-2); } p { color: var(--text-tertiary); margin-bottom: var(--space-6); } }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
    .skeleton-card { height: 180px; border-radius: var(--radius-xl); @extend .skeleton !optional; }
  `
})
export class EquipmentList implements OnInit {
  private firestoreService = inject(FirestoreService);
  
  loading = signal(true);
  equipment = signal<Equipment[]>([]);
  activeCategory = signal<string>('all');
  
  categories: EquipmentCategory[] = ['brewer', 'grinder', 'kettle', 'scale', 'machine', 'accessory', 'other'];
  
  filteredEquipment = computed(() => {
    const cat = this.activeCategory();
    return cat === 'all' ? this.equipment() : this.equipment().filter(e => e.category === cat);
  });
  
  async ngOnInit(): Promise<void> {
    try { this.equipment.set(await this.firestoreService.getAllEquipment()); }
    finally { this.loading.set(false); }
  }
  
  getCategoryIcon(cat: EquipmentCategory): string { return CATEGORY_ICONS[cat] || '📦'; }
}
