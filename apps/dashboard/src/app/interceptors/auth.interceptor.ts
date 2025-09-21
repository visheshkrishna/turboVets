import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Use lazy injection to avoid circular dependency
  const injector = inject(Injector);
  const authService = injector.get(AuthService);
  const authToken = authService.getToken();
  
  // Auth interceptor processing request

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    // Authorization header set
    return next(authReq);
  }

  // No token, proceeding without auth
  return next(req);
};
