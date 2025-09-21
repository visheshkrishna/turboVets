import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { UserRole, Permission } from '../types/user.types';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionsGuard, Reflector],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no permissions are required', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: UserRole.ADMIN }
        })
      })
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(context as any);

    expect(result).toBe(true);
  });

  it('should allow access when user has required permission', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: UserRole.ADMIN }
        })
      })
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.TASK_CREATE]);

    const result = guard.canActivate(context as any);

    expect(result).toBe(true);
  });

  it('should deny access when user does not have required permission', () => {
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: UserRole.VIEWER }
        })
      })
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Permission.TASK_CREATE]);

    const result = guard.canActivate(context as any);

    expect(result).toBe(false);
  });
});
