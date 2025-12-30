import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Technique } from '@core/models';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'brew-technique-list',
  standalone: true,
  imports: [RouterLink, Card, Button, SlicePipe],
  templateUrl: 'technique-list.html',
  styleUrl: 'technique-list.scss'
})
export class TechniqueList implements OnInit {
  private firestoreService = inject(FirestoreService);
  loading = signal(true);
  techniques = signal<Technique[]>([]);
  
  async ngOnInit(): Promise<void> {
    try { this.techniques.set(await this.firestoreService.getAllTechniques()); }
    finally { this.loading.set(false); }
  }
  
  formatTime(sec: number): string {
    const m = Math.floor(sec / 60), s = sec % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }
}
