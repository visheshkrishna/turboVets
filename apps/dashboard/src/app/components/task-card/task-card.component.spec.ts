import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { Task, TaskStatus } from '@secure-task-system/data';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event when onEdit is called', () => {
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

    component.task = mockTask;
    spyOn(component.edit, 'emit');

    component.onEdit();

    expect(component.edit.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should emit delete event when onDelete is called', () => {
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

    component.task = mockTask;
    spyOn(component.delete, 'emit');
    spyOn(window, 'confirm').and.returnValue(true);

    component.onDelete();

    expect(component.delete.emit).toHaveBeenCalledWith(1);
  });

  it('should emit statusChange event when onChangeStatus is called', () => {
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

    component.task = mockTask;
    spyOn(component.statusChange, 'emit');

    component.onChangeStatus(TaskStatus.IN_PROGRESS);

    expect(component.statusChange.emit).toHaveBeenCalledWith({
      taskId: 1,
      status: TaskStatus.IN_PROGRESS
    });
  });
});
