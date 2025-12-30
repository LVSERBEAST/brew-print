import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  
  toasts = computed(() => this._toasts());
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
  
  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      message,
      duration
    };
    
    this._toasts.update(toasts => [...toasts, toast]);
    
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast.id), duration);
    }
  }
  
  success(message: string, duration = 4000): void {
    this.show(message, 'success', duration);
  }
  
  error(message: string, duration = 6000): void {
    this.show(message, 'error', duration);
  }
  
  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }
  
  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }
  
  dismiss(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
  
  clear(): void {
    this._toasts.set([]);
  }
}
