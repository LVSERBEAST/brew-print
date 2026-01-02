import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.loading).pipe(
    filter((loading) => !loading),
    take(1),
    map(
      () =>
        authService.isAuthenticated() || router.createUrlTree(['/auth/login'])
    )
  );
};
