import { Injectable, signal } from '@angular/core';
import type { BrewParams } from '@core/models/models';

export interface BrewLogFormState {
  beanIds: string[];
  equipmentIds: string[];
  brewMethodId?: string;
  params: BrewParams;
  rating: number;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private _brewLogFormState = signal<BrewLogFormState | null>(null);

  get brewLogFormState() {
    return this._brewLogFormState();
  }

  saveBrewLogFormState(state: BrewLogFormState): void {
    this._brewLogFormState.set(state);
  }

  clearBrewLogFormState(): void {
    this._brewLogFormState.set(null);
  }

  hasBrewLogFormState(): boolean {
    return this._brewLogFormState() !== null;
  }
}
