import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '../../services/auth.service';
import { TaskListComponent } from '../task-list/task-list.component';
import { TaskFormComponent } from '../task-form/task-form.component';
import { AdminPanelComponent } from '../admin-panel/admin-panel.component';
import { TasksService } from '../../services/tasks.service';
import { Task, CreateTaskDto, UpdateTaskDto } from '@secure-task-system/data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskListComponent, TaskFormComponent, AdminPanelComponent],
  template: `
    <div class="h-screen flex">
      <!-- Sidebar -->
      <div class="w-64 bg-gray-800 text-white flex flex-col min-h-screen top-0 left-0">
        <!-- Sidebar Header -->
        <div class="p-6 border-b border-gray-700">
          <h1 class="text-xl font-semibold">Task Management System</h1>
        </div>
        
        <!-- Navigation -->
        <nav class="flex-1 p-4">
          <div class="space-y-2">
            <button
              (click)="showSection = 'tasks'"
              [class]="showSection === 'tasks' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
              class="w-full text-left px-4 py-3 rounded-lg transition-colors duration-200"
            >
              Tasks
            </button>
            <button
              *ngIf="isAdminOrOwner()"
              (click)="showSection = 'admin'"
              [class]="showSection === 'admin' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
              class="w-full text-left px-4 py-3 rounded-lg transition-colors duration-200"
            >
              Admin Panel
            </button>
          </div>
        </nav>
        
        <!-- User Info - Fixed at bottom -->
        <div class="p-4 border-t border-gray-700 mt-auto">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium">{{ currentUser?.firstName?.charAt(0) }}{{ currentUser?.lastName?.charAt(0) }}</span>
            </div>
            <div>
              <p class="text-sm font-medium">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
              <p class="text-xs text-gray-400">{{ currentUser?.role }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 bg-gray-100 flex flex-col">
        <!-- Top Header -->
        <div class="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ showSection === 'tasks' ? 'Tasks Board' : 'Admin Panel' }}
            </h2>
            <div class="flex items-center space-x-3">
              <button
                *ngIf="showSection === 'tasks'"
                (click)="onCreateTask()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                + Add New Task
              </button>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6">
            <!-- Error Message -->
            <div *ngIf="errorMessage" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {{ errorMessage }}
            </div>
            
            <!-- Admin Panel Section -->
            <div *ngIf="showSection === 'admin'">
              <app-admin-panel></app-admin-panel>
            </div>
            
            <!-- Task Management Section -->
            <div *ngIf="showSection === 'tasks'">
              <app-task-list></app-task-list>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Form Modal -->
      <div *ngIf="showTaskForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <app-task-form
            [taskToEdit]="selectedTask"
            (saveTask)="onTaskSaved($event)"
            (cancel)="closeTaskForm()"
          ></app-task-form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: UserInfo | null = null;
  showTaskForm = false;
  selectedTask: Task | null = null;
  isCreatingTask = false;
  errorMessage = '';
  showSection: 'tasks' | 'admin' = 'tasks';
  refreshTaskListTrigger = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private tasksService: TasksService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleBadgeClass(role?: string): string {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'owner';
  }

  isAdminOrOwner(): boolean {
    return this.currentUser?.role === 'admin' || this.currentUser?.role === 'owner';
  }

  onCreateTask(): void {
    this.selectedTask = null;
    this.showTaskForm = true;
  }

  onEditTask(task: Task): void {
    this.selectedTask = task;
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.selectedTask = null;
  }

  refreshTaskList(): void {
    // Trigger refresh by incrementing the counter
    this.refreshTaskListTrigger++;
  }

  onTaskSaved(formData: any): void {
    this.isCreatingTask = true;
    this.errorMessage = '';

    if (this.selectedTask) {
      // Update existing task
      const updateDto: UpdateTaskDto = {
        title: formData.title,
        description: formData.description,
        status: this.selectedTask.status,
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate
      };

      this.tasksService.updateTask(this.selectedTask.id, updateDto).subscribe({
        next: () => {
          this.isCreatingTask = false;
          this.closeTaskForm();
          // Refresh task list
          window.location.reload();
        },
        error: (error) => {
          this.isCreatingTask = false;
          this.errorMessage = error.error?.message || 'Error updating task. Please try again.';
          console.error('Error updating task:', error);
        }
      });
    } else {
      // Create new task
      const createDto: CreateTaskDto = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        dueDate: formData.dueDate
      };

      this.tasksService.createTask(createDto).subscribe({
        next: () => {
          this.isCreatingTask = false;
          this.closeTaskForm();
          // Refresh task list by reloading the page
          window.location.reload();
        },
        error: (error) => {
          this.isCreatingTask = false;
          this.errorMessage = error.error?.message || 'Error creating task. Please try again.';
          console.error('Error creating task:', error);
        }
      });
    }
  }
}
