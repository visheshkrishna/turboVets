import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Task, 
  CreateTaskDto, 
  UpdateTaskDto, 
  GetTasksQueryDto 
} from '@secure-task-system/data';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getTasks(queryDto?: GetTasksQueryDto): Observable<{ tasks: Task[]; total: number }> {
    let params = new HttpParams();
    
    if (queryDto) {
      if (queryDto.page) params = params.set('page', queryDto.page.toString());
      if (queryDto.limit) params = params.set('limit', queryDto.limit.toString());
      if (queryDto.status) params = params.set('status', queryDto.status);
      if (queryDto.priority) params = params.set('priority', queryDto.priority.toString());
      if (queryDto.category) params = params.set('category', queryDto.category);
      if (queryDto.search) params = params.set('search', queryDto.search);
      if (queryDto.assignedToId) params = params.set('assignedToId', queryDto.assignedToId.toString());
      if (queryDto.createdById) params = params.set('createdById', queryDto.createdById.toString());
      if (queryDto.sortBy) params = params.set('sortBy', queryDto.sortBy);
      if (queryDto.sortOrder) params = params.set('sortOrder', queryDto.sortOrder);
      if (queryDto.dateFrom) params = params.set('dateFrom', queryDto.dateFrom);
      if (queryDto.dateTo) params = params.set('dateTo', queryDto.dateTo);
    }

    return this.http.get<{ tasks: Task[]; total: number }>(`${this.API_URL}/tasks`, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`);
  }

  createTask(createTaskDto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, createTaskDto);
  }

  updateTask(id: number, updateTaskDto: UpdateTaskDto): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/tasks/${id}`, updateTaskDto);
  }

  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/tasks/${id}`);
  }
}
