import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { FirestoreService } from '@core/services/firestore.service';
import { Card } from '@shared/ui/card/card';
import { Button } from '@shared/ui/button/button';
import type { BrewLog, Bean, BrewStatistics, StreakInfo } from '@core/models';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'brew-dashboard',
  standalone: true,
  imports: [RouterLink, Card, Button, DecimalPipe],
  templateUrl: 'dashboard.html',
  styleUrl: 'dashboard.scss',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private firestoreService = inject(FirestoreService);

  user = this.authService.currentUser;

  loading = signal(true);
  recentBrews = signal<BrewLog[]>([]);
  beans = signal<Bean[]>([]);
  stats = signal<BrewStatistics | null>(null);

  brewsByDay = computed(() => this.stats()?.brewsByDay || []);

  weekDays = [
    { label: 'M' },
    { label: 'T' },
    { label: 'W' },
    { label: 'T' },
    { label: 'F' },
    { label: 'S' },
    { label: 'S' },
  ];

  today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  userName = computed(() => {
    const name = this.user()?.displayName || 'there';
    return name.split(' ')[0];
  });

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  async ngOnInit(): Promise<void> {
    try {
      const [brews, beans, stats] = await Promise.all([
        this.firestoreService.getRecentBrewLogs(5),
        this.firestoreService.getAllBeans(),
        this.firestoreService.getBrewStatistics(),
      ]);

      this.recentBrews.set(brews);
      this.beans.set(beans);
      this.stats.set(stats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getBeanNames(brew: BrewLog): string {
    return brew.beanIds
      .map((id) => this.beans().find((b) => b.id === id)?.name || 'Unknown')
      .join(', ');
  }

  isStreakDay(index: number): boolean {
    const streak = this.user()?.stats?.currentStreak || 0;
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1; // Convert to Mon=0

    // Show streak from today backwards
    const dayIndex = adjustedToday - index;
    return dayIndex >= 0 && dayIndex < streak;
  }

  getBarHeight(count: number): number {
    const max = Math.max(...this.brewsByDay().map((d) => d.count), 1);
    return Math.max((count / max) * 100, 4);
  }

  isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split('T')[0];
  }
}
