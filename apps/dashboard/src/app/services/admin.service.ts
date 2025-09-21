import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole, CreateUserDto, UpdateUserDto, Organization, CreateOrganizationDto, UpdateOrganizationDto, AuditLog } from '@secure-task-system/data';

export interface SystemStats {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
    totalTasks: number;
  };
  usersByRole: Record<string, number>;
  tasksByStatus: Record<string, number>;
  recent: {
    users: User[];
    tasks: any[];
  };
}

export interface DashboardData extends SystemStats {
  organizationStats: any;
  userActivity: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // System Statistics
  getSystemStats(): Observable<SystemStats> {
    return this.http.get<SystemStats>(`${this.API_URL}/admin/stats`);
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.API_URL}/admin/dashboard`);
  }

  // User Management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getUserStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/users/stats`);
  }

  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, userData);
  }

  updateUser(id: number, userData: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/users/${id}`);
  }

  updateUserRole(id: number, role: UserRole): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.API_URL}/users/${id}/role`, { role });
  }

  // Organization Management
  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(`${this.API_URL}/organizations`);
  }

  getOrganizationStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/organizations/stats`);
  }

  createOrganization(orgData: CreateOrganizationDto): Observable<Organization> {
    return this.http.post<Organization>(`${this.API_URL}/organizations`, orgData);
  }

  updateOrganization(id: number, orgData: UpdateOrganizationDto): Observable<Organization> {
    return this.http.put<Organization>(`${this.API_URL}/organizations/${id}`, orgData);
  }

  deleteOrganization(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/organizations/${id}`);
  }

  // Audit Logs
  getAuditLogs(params?: any): Observable<{ logs: AuditLog[]; total: number }> {
    return this.http.get<{ logs: AuditLog[]; total: number }>(`${this.API_URL}/audit/logs`, { params });
  }
}
