import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { LoginDto, RegisterDto, AuthResponseDto } from '@secure-task-system/data';

// Define a simplified user interface for the frontend
export interface UserInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Don't load user from storage in constructor to avoid circular dependency
    // This will be called manually after the app initializes
  }

  login(loginDto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/auth/login`, loginDto)
      .pipe(
        tap(response => {
          // Login successful
          this.setToken(response.access_token);
          this.currentUserSubject.next(response.user);
          // User data set
        })
      );
  }

  register(registerDto: RegisterDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.API_URL}/auth/register`, registerDto)
      .pipe(
        tap(response => {
          this.setToken(response.access_token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  public loadUserFromStorage(): void {
    const token = this.getToken();
    if (token) {
      // Get user profile to restore user state
      this.getProfile().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: (error) => {
          console.log('Auth Service - Profile load failed:', error);
          // Let the error interceptor handle 401 errors to avoid circular dependency
          // Just clear the user state locally
          this.currentUserSubject.next(null);
        }
      });
    }
  }

  getProfile(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_URL}/auth/profile`);
  }
}
