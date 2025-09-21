import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Use lazy injection to avoid circular dependency
  const injector = inject(Injector);
  const authService = injector.get(AuthService);
  const authToken = authService.getToken();
  
  console.log('Auth Interceptor - Request URL:', req.url);
  console.log('Auth Interceptor - Token found:', !!authToken);
  console.log('Auth Interceptor - Token value:', authToken ? authToken.substring(0, 20) + '...' : 'null');

  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    console.log('Auth Interceptor - Authorization header set:', authReq.headers.get('Authorization'));
    return next(authReq);
  }

  console.log('Auth Interceptor - No token, proceeding without auth');
  return next(req);
};
