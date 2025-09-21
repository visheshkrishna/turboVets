import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from '@secure-task-system/data';

describe('TasksService', () => {
  let service: TasksService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TasksService]
    });
    service = TestBed.inject(TasksService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tasks', () => {
    const mockResponse = {
      tasks: [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          status: 'open',
          category: 'work',
          priority: 1,
          createdById: 1,
          assignedToId: 1,
          organizationId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      total: 1
    };

    service.getTasks().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should create task', () => {
    const createTaskDto: CreateTaskDto = {
      title: 'New Task',
      description: 'New Description',
      category: 'work',
      priority: 1,
      assignedToId: 1
    };

    const mockResponse = {
      id: 1,
      title: 'New Task',
      description: 'New Description',
      status: 'open',
      category: 'work',
      priority: 1,
      createdById: 1,
      assignedToId: 1,
      organizationId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    service.createTask(createTaskDto).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createTaskDto);
    req.flush(mockResponse);
  });
});
