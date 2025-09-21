import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { Task, TaskStatus, UserRole } from '@secure-task-system/data';
import { TasksService } from '../../../services/tasks.service';
import { AuthService } from '../../../services/auth.service';
import { of, BehaviorSubject } from 'rxjs';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTasksService: jasmine.SpyObj<TasksService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    const tasksServiceSpy = jasmine.createSpyObj('TasksService', ['getTasks', 'createTask', 'updateTask', 'deleteTask']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    
    currentUserSubject = new BehaviorSubject({
      id: 1,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      organizationId: 1
    });

    authServiceSpy.currentUser$ = currentUserSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        { provide: TasksService, useValue: tasksServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    mockTasksService = TestBed.inject(TasksService) as jasmine.SpyObj<TasksService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    const mockTasks: Task[] = [
      {
        id: 1,
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.OPEN,
        category: 'work',
        priority: 1,
        createdById: 1,
        assignedToId: 1,
        organizationId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        title: 'Task 2',
        description: 'Description 2',
        status: TaskStatus.IN_PROGRESS,
        category: 'personal',
        priority: 2,
        createdById: 1,
        assignedToId: 2,
        organizationId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockTasksService.getTasks.and.returnValue(of({ tasks: mockTasks }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    component.ngOnInit();

    expect(mockTasksService.getTasks).toHaveBeenCalled();
    expect(component.todoTasks.length).toBe(1);
    expect(component.inProgressTasks.length).toBe(1);
    expect(component.doneTasks.length).toBe(0);
  });

  it('should handle task creation', () => {
    spyOn(component, 'loadTasks');
    mockTasksService.createTask.and.returnValue(of({}));

    const formData = {
      title: 'New Task',
      description: 'New Description',
      assigneeId: 1
    };

    component.onSaveTask(formData);

    expect(mockTasksService.createTask).toHaveBeenCalledWith(formData);
    expect(component.loadTasks).toHaveBeenCalled();
  });

  it('should handle task update', () => {
    spyOn(component, 'loadTasks');
    mockTasksService.updateTask.and.returnValue(of({}));

    const mockTask: Task = {
      id: 1,
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.OPEN,
      category: 'work',
      priority: 1,
      createdById: 1,
      assignedToId: 1,
      organizationId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    component.taskToEdit = mockTask;

    const formData = {
      title: 'New Title',
      description: 'New Description',
      assigneeId: 2
    };

    component.onSaveTask(formData);

    expect(mockTasksService.updateTask).toHaveBeenCalledWith(1, {
      ...mockTask,
      ...formData
    });
    expect(component.loadTasks).toHaveBeenCalled();
  });

  it('should handle task deletion', () => {
    spyOn(component, 'loadTasks');
    mockTasksService.deleteTask.and.returnValue(of({}));

    component.onDelete(1);

    expect(mockTasksService.deleteTask).toHaveBeenCalledWith(1);
    expect(component.loadTasks).toHaveBeenCalled();
  });

  it('should handle status change', () => {
    mockTasksService.updateTask.and.returnValue(of({}));

    const statusChangeEvent = {
      taskId: 1,
      status: TaskStatus.DONE
    };

    component.onChangeStatus(statusChangeEvent);

    expect(mockTasksService.updateTask).toHaveBeenCalledWith(1, { status: TaskStatus.DONE });
  });

  it('should show create button for admin users', () => {
    component.ngOnInit();
    fixture.detectChanges();

    component.canCreateTasks$.subscribe(canCreate => {
      expect(canCreate).toBe(true);
    });
  });

  it('should not show create button for viewer users', () => {
    currentUserSubject.next({
      id: 2,
      email: 'viewer@example.com',
      firstName: 'Viewer',
      lastName: 'User',
      role: UserRole.VIEWER,
      organizationId: 1
    });

    component.ngOnInit();
    fixture.detectChanges();

    component.canCreateTasks$.subscribe(canCreate => {
      expect(canCreate).toBe(false);
    });
  });
});
