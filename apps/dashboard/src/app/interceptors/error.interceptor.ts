import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Use lazy injection to avoid circular dependency
  const injector = inject(Injector);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('Error Interceptor - Error caught:', error);
      
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        console.log('Error Interceptor - 401 Unauthorized, logging out and redirecting');
        const authService = injector.get(AuthService);
        authService.logout();
        // Redirect to login page
        window.location.href = '/login';
      }
      
      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.log('Error Interceptor - 403 Forbidden:', error.error?.message || 'Access denied');
        // Don't logout for 403, just show error
      }
      
      return throwError(() => error);
    })
  );
};
