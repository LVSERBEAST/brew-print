import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>('system');
  private _resolvedTheme = signal<'light' | 'dark'>('light');
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  theme = this._theme.asReadonly();
  resolvedTheme = this._resolvedTheme.asReadonly();

  constructor() {
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      if (this._theme() === 'system') {
        this._resolvedTheme.set(e.matches ? 'dark' : 'light');
        this.applyTheme();
      }
    });

    // Apply theme when it changes
    effect(() => {
      this.applyTheme();
    });

    // Initialize
    this.resolveTheme();
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.resolveTheme();
    localStorage.setItem('brewprint-theme', theme);
  }

  loadSavedTheme(): void {
    const saved = localStorage.getItem('brewprint-theme') as Theme | null;
    if (saved) {
      this._theme.set(saved);
      this.resolveTheme();
    }
  }

  private resolveTheme(): void {
    const theme = this._theme();
    if (theme === 'system') {
      this._resolvedTheme.set(this.mediaQuery.matches ? 'dark' : 'light');
    } else {
      this._resolvedTheme.set(theme);
    }
  }

  private applyTheme(): void {
    const resolved = this._resolvedTheme();
    document.documentElement.setAttribute('data-theme', resolved);

    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
