import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus, UserRole, User } from '@secure-task-system/data';
import { TaskCardComponent } from '../task-card/task-card.component';
import { TaskFiltersComponent, TaskFilters } from '../task-filters/task-filters.component';
import { TasksService } from '../../services/tasks.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService, UserInfo } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, TaskFormComponent, TaskFiltersComponent, DragDropModule],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];
  TaskStatus = TaskStatus;
  isLoading = false;
  error: string | null = null;
  showEditForm = false;
  taskToEdit: Task | null = null;
  canCreateTasks$: Observable<boolean>;
  canUpdateTasks$: Observable<boolean>;
  canDragTasks$: Observable<boolean>;
  users: User[] = [];
  currentFilters: TaskFilters = {};
  
  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
    private usersService: UsersService,
  ) {
    this.canCreateTasks$ = this.authService.currentUser$.pipe(
      map((user: UserInfo | null) => {
        const userRole = user?.role;
        return userRole === UserRole.ADMIN || userRole === UserRole.OWNER;
      })
    );
    
    this.canUpdateTasks$ = this.authService.currentUser$.pipe(
      map((user: UserInfo | null) => {
        const userRole = user?.role;
        // Only admins and owners can create/edit/delete tasks
        return userRole === UserRole.ADMIN || userRole === UserRole.OWNER;
      })
    );
    
    this.canDragTasks$ = this.authService.currentUser$.pipe(
      map((user: UserInfo | null) => {
        const userRole = user?.role;
        // Viewers can move cards (update task status) but not create/edit/delete tasks
        return userRole === UserRole.ADMIN || userRole === UserRole.OWNER || userRole === UserRole.VIEWER;
      })
    );
  }

  ngOnInit() {
    this.loadUsers();
    this.loadTasks();
  }

  loadUsers() {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadTasks() {
    console.log('🔄 Loading tasks...');
    this.isLoading = true;
    this.error = null;
    
    // Clear existing tasks to ensure fresh data
    this.todoTasks = [];
    this.inProgressTasks = [];
    this.doneTasks = [];
    
    this.tasksService.getTasks(this.currentFilters).subscribe({
      next: (response: { tasks: Task[]; total: number }) => {
        console.log('📋 Tasks loaded from API:', response);
        const tasks = response.tasks;
        this.todoTasks = tasks.filter((t: Task) => t.status === TaskStatus.OPEN);
        this.inProgressTasks = tasks.filter((t: Task) => t.status === TaskStatus.IN_PROGRESS);
        this.doneTasks = tasks.filter((t: Task) => t.status === TaskStatus.DONE);
        
        console.log('📊 Task distribution:', {
          todo: this.todoTasks.length,
          inProgress: this.inProgressTasks.length,
          done: this.doneTasks.length
        });
        
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Failed to load tasks:', error);
        if (error.status === 401) {
          console.log('🔐 Authentication failed, redirecting to login');
          this.authService.logout();
          // Redirect to login - this will be handled by the auth guard
          window.location.href = '/login';
        } else {
          this.error = 'Failed to load tasks.';
        }
        this.isLoading = false;
      }
    });
  }

  onFiltersChange(filters: TaskFilters) {
    console.log('🔍 Filters changed:', filters);
    this.currentFilters = filters;
    this.loadTasks();
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between different columns
      const newStatus = event.container.id as TaskStatus;
      
      // Get the task directly from the drag data (most reliable method)
      const task = event.item.data;
      
      if (!task) {
        console.error('❌ Task data not found in drag event');
        return;
      }
      
      console.log('🔄 Moving task:', {
        taskId: task.id,
        taskTitle: task.title,
        oldStatus: task.status,
        newStatus: newStatus
      });
      
      // Store original state for potential rollback
      const originalStatus = task.status;
      const originalArray = event.previousContainer.data;
      const targetArray = event.container.data;
      
      // Update the task status immediately in the UI
      task.status = newStatus;
      
      // Remove the task from the original array
      const taskIndex = originalArray.findIndex(t => t.id === task.id);
      if (taskIndex !== -1) {
        const [movedTask] = originalArray.splice(taskIndex, 1);
        // Add to the target array
        targetArray.push(movedTask);
      }
      
      // Update the task status in the backend
      console.log('🚀 Making API call to update task status...');
      this.tasksService.updateTask(task.id, { status: newStatus }).subscribe({
        next: (updatedTask) => {
          // Success - task status updated in backend
          console.log(`✅ Task ${task.id} moved to ${newStatus}`, updatedTask);
          // Update the local task with the server response
          Object.assign(task, updatedTask);
        },
        error: (err: any) => {
          // Error - rollback the UI changes
          console.error('❌ Failed to update task status:', err);
          
          if (err.status === 401) {
            console.log('🔐 Authentication failed during task status update, redirecting to login');
            this.authService.logout();
            window.location.href = '/login';
            return;
          }
          
          if (err.status === 403) {
            console.log('🚫 Permission denied - viewer cannot update task status');
            this.error = 'You do not have permission to update task status. Viewers can only view tasks.';
            return;
          }
          
          this.error = 'Failed to update task status.';
          
          // Rollback: restore original status and move task back
          task.status = originalStatus;
          
          // Remove from current array and add back to original array
          const currentArray = event.container.data;
          const taskIndex = currentArray.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            const [movedTask] = currentArray.splice(taskIndex, 1);
            originalArray.push(movedTask);
          }
        }
      });
    }
  }

  onEdit(task: Task | null) {
    this.taskToEdit = task ? { ...task } : null;
    this.showEditForm = true;
  }

  onDelete(taskId: number) {
    this.tasksService.deleteTask(taskId).subscribe({
      next: () => this.loadTasks(),
      error: (err: any) => this.error = 'Failed to delete task.',
    });
  }


  onCancelEdit() {
    this.showEditForm = false;
    this.taskToEdit = null;
  }

  /**
   * Main handler that decides whether to create or update a task.
   */
  onSaveTask(formData: any) {
    if (this.taskToEdit) {
      this.handleUpdateTask(formData);
    } else {
      this.handleCreateTask(formData);
    }
  }

  /**
   * Handles the logic for CREATING a new task.
   */
  private handleCreateTask(formData: any) {
    this.error = null;
    this.isLoading = true;
    this.tasksService.createTask(formData).subscribe({
      next: () => {
        this.showEditForm = false;
        this.isLoading = false;
        this.loadTasks();
      },
      error: (err: any) => {
        console.error('❌ Failed to create task:', err);
        if (err.status === 401) {
          console.log('🔐 Authentication failed during task creation, redirecting to login');
          this.authService.logout();
          window.location.href = '/login';
        } else {
          this.error = err.error?.message || 'Failed to create task.';
        }
        this.isLoading = false;
      },
    });
  }

  /**
   * Handles the logic for UPDATING an existing task.
   */
  private handleUpdateTask(formData: any) {
    if (!this.taskToEdit) return;

    // Create a payload that merges the original task with form changes.
    const updatePayload: Partial<Task> = {
      ...this.taskToEdit,
      ...formData,
    };
    
    this.error = null;
    this.isLoading = true;
    this.tasksService.updateTask(this.taskToEdit.id, updatePayload).subscribe({
      next: () => {
        this.showEditForm = false;
        this.taskToEdit = null;
        this.isLoading = false;
        this.loadTasks();
      },
      error: (err: any) => {
        console.error('❌ Failed to update task:', err);
        if (err.status === 401) {
          console.log('🔐 Authentication failed during task update, redirecting to login');
          this.authService.logout();
          window.location.href = '/login';
        } else {
          this.error = err.error?.message || 'Failed to update task.';
        }
        this.isLoading = false;
      },
    });
  }
}
