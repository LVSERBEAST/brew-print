import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Shell } from '@shared/components/shell/shell';
import { ToastContainer } from '@shared/ui/toast/toast-container';

@Component({
  selector: 'brew-root',
  standalone: true,
  imports: [RouterOutlet, Shell, ToastContainer],
  templateUrl: 'app.html',
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }

    .auth-layout {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--surface-base) 0%, var(--surface-subtle) 100%);
      padding: var(--space-4);
    }

    .loading-screen {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-base);
    }

    .loading-icon {
      font-size: 3rem;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.95); }
    }
  `,
})
export class App {
  authService = inject(AuthService);
}
