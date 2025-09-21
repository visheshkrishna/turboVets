import { UserRole, Permission } from './auth';

describe('auth', () => {
  it('should export UserRole enum', () => {
    expect(UserRole.OWNER).toBe('owner');
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.VIEWER).toBe('viewer');
  });

  it('should export Permission enum', () => {
    expect(Permission.TASK_CREATE).toBe('task:create');
    expect(Permission.TASK_READ).toBe('task:read');
    expect(Permission.TASK_UPDATE).toBe('task:update');
    expect(Permission.TASK_DELETE).toBe('task:delete');
  });
});
