import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { Method } from '@core/models';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'brew-method-list',
  standalone: true,
  imports: [RouterLink, Card, Button, SlicePipe],
  templateUrl: 'method-list.html',
  styleUrl: 'method-list.scss',
})
export class MethodList implements OnInit {
  private firestoreService = inject(FirestoreService);
  loading = signal(true);
  methods = signal<Method[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      this.methods.set(await this.firestoreService.getAllMethods());
    } finally {
      this.loading.set(false);
    }
  }

  formatTime(sec: number): string {
    const m = Math.floor(sec / 60),
      s = sec % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
  }
}
