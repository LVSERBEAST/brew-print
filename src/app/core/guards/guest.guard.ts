import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  while (authService.loading()) {
    await new Promise(r => setTimeout(r, 50));
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};