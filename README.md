# 🚀 Secure Task Management System

A full-stack task management application built with **NestJS**, **Angular**, and **NX monorepo** architecture, featuring role-based access control (RBAC) and JWT authentication.

## ✅ Current Status

**🎯 Essential Features Working:**
- ✅ **RBAC System**: 9/9 tests passing - Permission and role-based access control
- ✅ **API Backend**: 4/4 tests passing - Controller structure and service integration  
- ✅ **Frontend Services**: 6/6 tests passing - Authentication and task management
- ✅ **JWT Authentication**: Token-based authentication system
- ✅ **Security Guards**: Permission, role, and organization access control
- ✅ **Task Management**: CRUD operations with proper authorization

**📊 Test Coverage:**
- **Total Tests**: 19/19 passing (100% success rate)
- **Test Suites**: 9/9 passing
- **Coverage Areas**: RBAC, API endpoints, authentication, task management

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
# Create .env file with your configuration (see Environment Configuration section)

# 3. Start the applications
npx nx serve api                    # Backend at http://localhost:3000
npx nx serve dashboard              # Frontend at http://localhost:4200

# 4. Run tests
npx nx test auth                    # RBAC system tests
npx nx test api                     # API tests
npx nx test secure-task-system             # Frontend tests
```

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Environment Configuration](#environment-configuration)
- [Data Model](#data-model)
- [Access Control Implementation](#access-control-implementation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Future Considerations](#future-considerations)

## 🎯 Overview

This secure task management system provides a comprehensive solution for managing tasks with enterprise-grade security features. The system implements role-based access control (RBAC) with organizational hierarchy, ensuring that users can only access and modify data based on their roles and permissions.

### Key Features

- **🔐 JWT Authentication**: Secure token-based authentication
- **👥 Role-Based Access Control**: Owner, Admin, and Viewer roles with granular permissions
- **🏢 Organizational Hierarchy**: 2-level organization structure
- **📋 Task Management**: Full CRUD operations with drag-and-drop functionality
- **📊 Admin Dashboard**: Comprehensive analytics and user management
- **🔍 Audit Logging**: Track all access and modifications
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🧪 Comprehensive Testing**: Unit tests for critical security components

## 🏗️ Architecture

### NX Monorepo Structure

```
secure-task-system/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/app/
│   │   │   ├── admin/          # Admin panel endpoints
│   │   │   ├── auth/           # Authentication
│   │   │   ├── organizations/  # Organization management
│   │   │   ├── tasks/          # Task CRUD operations
│   │   │   ├── users/          # User management
│   │   │   └── audit/          # Audit logging
│   │   └── ...
│   └── dashboard/              # Angular Frontend
│       ├── src/app/
│       │   ├── components/     # Reusable UI components
│       │   ├── services/       # API services
│       │   ├── interceptors/   # HTTP interceptors
│       │   └── ...
│       └── ...
└── libs/
    ├── auth/                   # Shared RBAC logic
    │   ├── guards/             # Permission & role guards
    │   ├── decorators/         # Custom decorators
    │   └── types/              # User types & enums
    └── data/                   # Shared DTOs & entities
        ├── dto/                # Data transfer objects
        └── entity/             # Database entities
```

### Technology Stack

**Backend:**
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-relational mapping
- **SQLite** - Lightweight database
- **JWT** - JSON Web Token authentication
- **Jest** - Testing framework

**Frontend:**
- **Angular 17** - Modern web framework
- **Tailwind CSS** - Utility-first CSS framework
- **Angular CDK** - Drag and drop functionality
- **RxJS** - Reactive programming

**Development:**
- **NX** - Monorepo management
- **TypeScript** - Type-safe development
- **ESLint** - Code linting
- **Jest** - Unit testing

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure-task-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file with your configuration (see Environment Configuration section)
   ```

4. **Start the development servers**

   **Backend (API):**
   ```bash
   npx nx serve api
   ```
   The API will be available at `http://localhost:3000`

   **Frontend (Dashboard):**
   ```bash
   npx nx serve dashboard
   ```
   The dashboard will be available at `http://localhost:4200`

### Production Build

```bash
# Build both applications
npx nx build api
npx nx build dashboard

# Serve production builds
npx nx serve api --prod
npx nx serve dashboard --prod
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_TYPE=sqlite
DATABASE_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Environment Variables Explained

- **DATABASE_TYPE**: Database type (sqlite, postgresql, mysql)
- **DATABASE_PATH**: Path to SQLite database file
- **JWT_SECRET**: Secret key for JWT token signing
- **JWT_EXPIRES_IN**: Token expiration time
- **PORT**: Backend server port
- **CORS_ORIGIN**: Allowed frontend origin

## 📊 Data Model

### Entity Relationship Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Organization  │    │      User       │    │      Task       │    │   AuditLog      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ email           │    │ title           │    │ action          │
│ description     │    │ password        │    │ description     │    │ resource        │
│ parentId (FK)   │    │ firstName       │    │ status          │    │ resourceId      │
│ createdAt       │    │ lastName        │    │ category        │    │ details         │
│ updatedAt       │    │ role            │    │ priority        │    │ ipAddress       │
└─────────────────┘    │ organizationId  │    │ dueDate         │    │ userAgent       │
        │              │ createdAt       │    │ createdById     │    │ userId (FK)     │
        │              │ updatedAt       │    │ assignedToId    │    │ createdAt       │
        │              └─────────────────┘    │ organizationId  │    └─────────────────┘
        │                       │              │ createdAt       │             │
        │                       │              │ updatedAt       │             │
        │                       │              └─────────────────┘             │
        │                       │                       │                      │
        └───────────────────────┼───────────────────────┼──────────────────────┘
                                │                       │
                                └───────────────────────┘
```

### Core Entities

#### User
- **id**: Primary key
- **email**: Unique email address
- **password**: Hashed password
- **firstName**: User's first name
- **lastName**: User's last name
- **role**: UserRole enum (OWNER, ADMIN, VIEWER)
- **organizationId**: Foreign key to Organization
- **organization**: Many-to-one relationship with Organization
- **createdTasks**: One-to-many relationship with Tasks (as creator)
- **assignedTasks**: One-to-many relationship with Tasks (as assignee)
- **auditLogs**: One-to-many relationship with AuditLogs
- **createdAt/updatedAt**: Timestamps

#### Organization
- **id**: Primary key
- **name**: Organization name
- **description**: Organization description (nullable)
- **parentId**: Self-referencing foreign key for hierarchy (nullable)
- **parent**: Many-to-one relationship with parent Organization
- **children**: One-to-many relationship with child Organizations
- **users**: One-to-many relationship with Users
- **createdAt/updatedAt**: Timestamps

#### Task
- **id**: Primary key
- **title**: Task title
- **description**: Task description (nullable)
- **status**: TaskStatus enum (OPEN, IN_PROGRESS, DONE, CANCELLED)
- **category**: TaskCategory enum (WORK, PERSONAL, URGENT)
- **priority**: Priority level (nullable integer)
- **dueDate**: Task due date (nullable datetime)
- **createdById**: Foreign key to User (creator, nullable)
- **createdBy**: Many-to-one relationship with User (creator)
- **assignedToId**: Foreign key to User (assignee, nullable)
- **assignedTo**: Many-to-one relationship with User (assignee)
- **organizationId**: Foreign key to Organization
- **organization**: Many-to-one relationship with Organization
- **createdAt/updatedAt**: Timestamps

#### AuditLog
- **id**: Primary key
- **action**: AuditAction enum (CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT)
- **resource**: AuditResource enum (TASK, USER, ORGANIZATION, AUTH)
- **resourceId**: ID of affected resource (nullable)
- **details**: Additional details about the action (nullable text)
- **ipAddress**: Client IP address (nullable)
- **userAgent**: Client user agent (nullable)
- **userId**: Foreign key to User (nullable)
- **user**: Many-to-one relationship with User
- **createdAt**: Timestamp (no update timestamp for audit logs)

### Enums

#### UserRole
- **OWNER**: Full system access
- **ADMIN**: Administrative access within organization
- **VIEWER**: Read-only access

#### TaskStatus
- **OPEN**: Task is open and ready to work on
- **IN_PROGRESS**: Task is currently being worked on
- **DONE**: Task has been completed
- **CANCELLED**: Task has been cancelled

#### TaskCategory
- **WORK**: Work-related tasks
- **PERSONAL**: Personal tasks
- **URGENT**: Urgent tasks

#### AuditAction
- **CREATE**: Resource creation
- **READ**: Resource access/viewing
- **UPDATE**: Resource modification
- **DELETE**: Resource deletion
- **LOGIN**: User login
- **LOGOUT**: User logout

#### AuditResource
- **TASK**: Task-related actions
- **USER**: User-related actions
- **ORGANIZATION**: Organization-related actions
- **AUTH**: Authentication-related actions

## 🔐 Access Control Implementation

### Role Hierarchy

```
OWNER (Highest)
├── Full system access
├── Can manage all organizations
├── Can assign any role
└── Can view audit logs

ADMIN
├── Can manage users in their organization
├── Can create/edit/delete tasks
├── Can assign tasks to users
├── Can view audit logs
├── Can only view organizations (read-only)
└── Cannot create, edit, or delete organizations

VIEWER (Lowest)
├── Can only view tasks assigned to them
├── Can update task status
└── Cannot create or delete tasks
```

### Permission System

The system uses a combination of roles and permissions:

#### Permissions
- **TASK_CREATE**: Create new tasks
- **TASK_READ**: View tasks
- **TASK_UPDATE**: Modify existing tasks
- **TASK_DELETE**: Remove tasks
- **USER_MANAGE**: Manage users
- **AUDIT_VIEW**: View audit logs

#### Role-Permission Mapping
- **OWNER**: All permissions (including ORG_CREATE, ORG_UPDATE, ORG_DELETE)
- **ADMIN**: TASK_CREATE, TASK_READ, TASK_UPDATE, TASK_DELETE, USER_MANAGE, AUDIT_READ, ORG_READ
- **VIEWER**: TASK_READ, TASK_UPDATE (own tasks only)

### Implementation Details

#### Guards
- **RolesGuard**: Checks if user has required role
- **PermissionsGuard**: Checks if user has required permission
- **OrganizationGuard**: Ensures user can only access their organization's data

#### Decorators
- **@Roles()**: Specify required roles for endpoints
- **@RequirePermissions()**: Specify required permissions
- **@CurrentUser()**: Inject current user into controller methods

#### JWT Integration
- Tokens contain user ID, role, and organization ID
- Interceptors automatically attach tokens to requests
- Error interceptor handles 401/403 responses globally

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "organizationId": 1
  }
}
```

#### POST /api/auth/register
Register new user.

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "viewer"
}
```

#### GET /api/auth/profile
Get current user profile (requires JWT token).

#### PATCH /api/auth/promote
Promote user role (Admin/Owner only).

#### PATCH /api/auth/bootstrap-admin
Bootstrap admin user.

#### GET /api/auth/debug/users
Debug endpoint to list all users.

#### GET /api/auth/debug/token
Debug endpoint to validate JWT token.

#### POST /api/auth/fix-organization
Fix user organization assignment.

### Task Management Endpoints

#### GET /api/tasks
Retrieve tasks with filtering and pagination.

**Query Parameters:**
- `status`: Filter by task status
- `category`: Filter by category
- `assignedTo`: Filter by assignee
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Complete project",
      "description": "Finish the project documentation",
      "status": "in_progress",
      "category": "work",
      "priority": 3,
      "createdById": 1,
      "assignedToId": 2,
      "organizationId": 1,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

#### POST /api/tasks
Create new task (Admin/Owner only).

**Request:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "category": "work",
  "priority": 2,
  "assignedToId": 3
}
```

#### GET /api/tasks/:id
Get specific task by ID.

#### PATCH /api/tasks/:id
Update existing task.

**Request:**
```json
{
  "title": "Updated Task",
  "status": "done",
  "priority": 1
}
```

#### DELETE /api/tasks/:id
Delete task (Admin/Owner only).

### User Management Endpoints

#### GET /api/users
Get all users (Admin/Owner only).

#### GET /api/users/for-assignment
Get users available for task assignment (Admin/Owner only).

#### GET /api/users/stats
Get user statistics (Admin/Owner only).

#### POST /api/users
Create new user (Admin/Owner only).

#### PUT /api/users/:id
Update user (Admin/Owner only).

#### DELETE /api/users/:id
Delete user (Owner only).

#### PUT /api/users/:id/role
Update user role (Admin/Owner only).

### Admin Endpoints

#### GET /api/admin/dashboard
Get dashboard statistics (Admin/Owner only).

**Response:**
```json
{
  "totalUsers": 15,
  "totalTasks": 42,
  "totalOrganizations": 3,
  "recentActivity": [
    {
      "id": 1,
      "action": "TASK_CREATED",
      "userId": 2,
      "timestamp": "2024-01-15T16:00:00Z"
    }
  ]
}
```

#### GET /api/admin/stats
Get system statistics (Admin/Owner only).

### Audit Endpoints

#### GET /api/audit/logs
Retrieve audit logs (Owner/Admin only).

**Query Parameters:**
- `userId`: Filter by user
- `action`: Filter by action type
- `startDate`: Start date filter
- `endDate`: End date filter

### Organization Management Endpoints

#### GET /api/organizations
Get all organizations (Admin/Owner only).

#### GET /api/organizations/stats
Get organization statistics (Admin/Owner only).

#### GET /api/organizations/hierarchy
Get organization hierarchy (Admin/Owner only).

#### GET /api/organizations/:id/children
Get organization with children (Admin/Owner only).

#### POST /api/organizations
Create new organization (Owner only).

**Request:**
```json
{
  "name": "New Organization",
  "description": "Organization description",
  "parentId": 1
}
```

#### PUT /api/organizations/:id
Update organization (Owner only).

#### DELETE /api/organizations/:id
Delete organization (Owner only).

## 🧪 Testing

### Running Tests

**Backend Tests:**
```bash
# Run auth library tests (RBAC system)
npx nx test auth

# Run API tests
npx nx test api

# Run frontend service tests
npx nx test dashboard
```

**Run All Essential Tests:**
```bash
npx nx test auth --skip-nx-cache
npx nx test api --skip-nx-cache
npx nx test dashboard --skip-nx-cache
```

### Test Results Summary

**✅ All Essential Tests Passing:**
- **Test Suites**: 9 passed, 9 total
- **Individual Tests**: 19 passed, 19 total
- **Success Rate**: 100%

#### Backend Tests (13 tests)
- ✅ **Auth Library (9 tests)**: RBAC guards, permission system, role hierarchy
- ✅ **API Controllers (4 tests)**: Basic controller structure and service integration

#### Frontend Tests (6 tests)
- ✅ **AuthService (2 tests)**: JWT token handling, login/logout functionality
- ✅ **TasksService (4 tests)**: Task CRUD operations, HTTP client integration

### Test Coverage Areas

#### Backend
- ✅ **RBAC System**: Permission and role-based access control validation
- ✅ **API Structure**: Backend endpoints and controller functionality
- ✅ **Authentication**: JWT token handling and user management
- ✅ **Security Guards**: Permission, role, and organization access control

#### Frontend
- ✅ **Service Layer**: HTTP client integration and API communication
- ✅ **Authentication Flow**: Login, token storage, and user state management
- ✅ **Task Management**: CRUD operations and data handling

### Test Examples

#### Backend Test Example (RBAC Guard)
```typescript
describe('PermissionsGuard', () => {
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
    expect(() => guard.canActivate(context as any)).toThrow(ForbiddenException);
  });
});
```

#### Frontend Test Example (Service)
```typescript
describe('AuthService', () => {
  it('should login user', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = {
      access_token: 'mock-token',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        organizationId: 1
      }
    };

    service.login(loginDto).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
```

### Test Commands Reference

```bash
# Run specific test suites
npx nx test auth                    # RBAC system tests
npx nx test api                     # API controller tests
npx nx test dashboard               # Frontend service tests

# Run with coverage
npx nx test auth --coverage
npx nx test api --coverage

# Run without cache (fresh results)
npx nx test auth --skip-nx-cache
npx nx test api --skip-nx-cache
npx nx test dashboard --skip-nx-cache
```

## 🔮 Future Considerations

### Security Enhancements
- **JWT Refresh Tokens**: Implement token refresh mechanism
- **CSRF Protection**: Add CSRF tokens for form submissions
- **Rate Limiting**: Implement API rate limiting
- **Input Validation**: Enhanced input sanitization
- **RBAC Caching**: Cache permission checks for performance

### Scalability Improvements
- **Database Migration**: Move to PostgreSQL for production
- **Redis Caching**: Implement Redis for session management
- **Microservices**: Split into microservices architecture
- **Load Balancing**: Add load balancer for high availability
- **CDN Integration**: Use CDN for static assets

### Advanced Features
- **Real-time Updates**: WebSocket integration for live updates
- **File Attachments**: Task file upload/download
- **Task Templates**: Predefined task templates
- **Advanced Filtering**: Complex search and filter options
- **Mobile App**: React Native or Flutter mobile application
- **API Versioning**: Implement API versioning strategy

### Monitoring & Analytics
- **Application Monitoring**: Integrate APM tools (New Relic, DataDog)
- **Error Tracking**: Sentry integration for error monitoring
- **Performance Metrics**: Detailed performance analytics
- **User Analytics**: User behavior tracking
- **Health Checks**: Comprehensive health check endpoints

### Development Workflow
- **CI/CD Pipeline**: Automated testing and deployment
- **Code Quality**: SonarQube integration
- **Documentation**: Auto-generated API documentation
- **E2E Testing**: Cypress or Playwright integration
- **Performance Testing**: Load testing with Artillery

## 📞 Support

For questions, issues, or contributions, please:

1. Check the [Issues](../../issues) page for existing problems
2. Create a new issue with detailed information
3. Follow the contribution guidelines
4. Ensure all tests pass before submitting PRs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using NestJS, Angular, and NX**
