import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskFormComponent } from './task-form.component';
import { Task, TaskStatus } from '@secure-task-system/data';
import { UsersService } from '../../../services/users.service';
import { of } from 'rxjs';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let mockUsersService: jasmine.SpyObj<UsersService>;

  beforeEach(async () => {
    const usersServiceSpy = jasmine.createSpyObj('UsersService', ['getUsers']);

    await TestBed.configureTestingModule({
      imports: [TaskFormComponent, ReactiveFormsModule],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    mockUsersService = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;

    mockUsersService.getUsers.and.returnValue(of([
      { id: 1, email: 'user1@example.com', firstName: 'User', lastName: 'One', role: 'admin', organizationId: 1 },
      { id: 2, email: 'user2@example.com', firstName: 'User', lastName: 'Two', role: 'viewer', organizationId: 1 }
    ]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values when no task is provided', () => {
    component.taskToEdit = null;
    component.ngOnInit();

    expect(component.taskForm.get('title')?.value).toBe('');
    expect(component.taskForm.get('description')?.value).toBe('');
    expect(component.taskForm.get('assigneeId')?.value).toBe('');
  });

  it('should initialize form with task values when task is provided', () => {
    const mockTask: Task = {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
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
    component.ngOnInit();

    expect(component.taskForm.get('title')?.value).toBe('Test Task');
    expect(component.taskForm.get('description')?.value).toBe('Test Description');
    expect(component.taskForm.get('assigneeId')?.value).toBe(1);
  });

  it('should emit saveTask event when form is valid and submitted', () => {
    spyOn(component.saveTask, 'emit');

    component.taskForm.patchValue({
      title: 'New Task',
      description: 'New Description',
      assigneeId: '1'
    });

    component.onSubmit();

    expect(component.saveTask.emit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New Description',
      assignedToId: 1
    });
  });

  it('should not emit saveTask event when form is invalid', () => {
    spyOn(component.saveTask, 'emit');

    component.taskForm.patchValue({
      title: '', // Invalid: empty title
      description: 'New Description',
      assigneeId: '1'
    });

    component.onSubmit();

    expect(component.saveTask.emit).not.toHaveBeenCalled();
  });

  it('should emit cancel event when onCancel is called', () => {
    spyOn(component.cancel, 'emit');

    component.onCancel();

    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
