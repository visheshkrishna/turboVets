import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DashboardData } from '../../services/admin.service';
import { AuthService, UserInfo } from '../../services/auth.service';
import { User, UserRole, CreateUserDto, Organization, CreateOrganizationDto, AuditLog } from '@secure-task-system/data';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styles: []
})
export class AdminPanelComponent implements OnInit {
  currentUser: UserInfo | null = null;
  activeTab = 'dashboard';
  
  // Data
  dashboardData: DashboardData | null = null;
  users: User[] = [];
  organizations: Organization[] = [];
  auditLogs: AuditLog[] = [];
  
  // UI State
  showCreateUserForm = false;
  showCreateOrgForm = false;
  showRoleChangeModal = false;
  isCreatingUser = false;
  isCreatingOrg = false;
  isChangingRole = false;
  
  // Role Change
  selectedUser: User | null = null;
  selectedNewRole: UserRole | null = null;
  availableRoles = [
    { value: UserRole.VIEWER, label: 'Viewer' },
    { value: UserRole.ADMIN, label: 'Admin' },
    { value: UserRole.OWNER, label: 'Owner' }
  ];
  
  // Forms
  newUser: CreateUserDto = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.VIEWER
  };
  
  newOrg: CreateOrganizationDto = {
    name: '',
    description: '',
    parentId: undefined
  };
  
  auditFilter = {
    action: '',
    resource: ''
  };
  
  tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'users', name: 'Users' },
    { id: 'organizations', name: 'Organizations' },
    { id: 'audit', name: 'Audit Logs' }
  ];

  private adminService = inject(AdminService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
    this.loadUsers();
    this.loadOrganizations();
    this.loadAuditLogs();
  }

  loadDashboardData() {
    this.adminService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadOrganizations() {
    this.adminService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });
  }

  loadAuditLogs() {
    this.adminService.getAuditLogs(this.auditFilter).subscribe({
      next: (response) => {
        this.auditLogs = response.logs;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
      }
    });
  }

  onCreateUser() {
    this.isCreatingUser = true;
    this.adminService.createUser(this.newUser).subscribe({
      next: (user) => {
        this.users.push(user);
        this.showCreateUserForm = false;
        this.resetNewUser();
        this.isCreatingUser = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.isCreatingUser = false;
      }
    });
  }

  onCreateOrganization() {
    this.isCreatingOrg = true;
    
    // Clean up the data before sending
    const orgData = {
      name: this.newOrg.name,
      description: this.newOrg.description,
      ...(this.newOrg.parentId && { parentId: this.newOrg.parentId })
    };
    
    console.log('Creating organization with data:', orgData);
    
    this.adminService.createOrganization(orgData).subscribe({
      next: (org) => {
        console.log('Organization created successfully:', org);
        this.organizations.push(org);
        this.showCreateOrgForm = false;
        this.resetNewOrg();
        this.isCreatingOrg = false;
        // Reload organizations to get the updated hierarchy
        this.loadOrganizations();
      },
      error: (error) => {
        console.error('Error creating organization:', error);
        this.isCreatingOrg = false;
      }
    });
  }

  editUser(user: User) {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user);
  }

  changeUserRole(user: User) {
    console.log('changeUserRole called with user:', user);
    this.selectedUser = user;
    this.selectedNewRole = user.role; // Initialize with current role
    
    // Set the modal to visible
    this.showRoleChangeModal = true;
    console.log('Modal should be visible:', this.showRoleChangeModal);
    console.log('Selected user:', this.selectedUser);
    console.log('Selected new role:', this.selectedNewRole);
    console.log('Available roles:', this.availableRoles);
    
    // Force change detection
    setTimeout(() => {
      console.log('After timeout - Modal visible:', this.showRoleChangeModal);
      console.log('After timeout - Selected user:', this.selectedUser);
    }, 100);
  }

  onRoleSelect(newRole: UserRole) {
    this.selectedNewRole = newRole;
  }

  confirmRoleChange() {
    if (!this.selectedUser || !this.selectedNewRole || this.selectedNewRole === this.selectedUser.role) {
      return;
    }
    
    this.isChangingRole = true;
    this.adminService.updateUserRole(this.selectedUser.id, this.selectedNewRole).subscribe({
      next: (response) => {
        console.log('Role updated successfully:', response);
        // Update the user in the local array
        if (this.selectedUser && this.selectedNewRole) {
          const userIndex = this.users.findIndex(u => u.id === this.selectedUser?.id);
          if (userIndex !== -1) {
            this.users[userIndex].role = this.selectedNewRole;
          }
        }
        this.closeRoleChangeModal();
        this.isChangingRole = false;
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        this.isChangingRole = false;
      }
    });
  }

  closeRoleChangeModal() {
    this.showRoleChangeModal = false;
    this.selectedUser = null;
    this.selectedNewRole = null;
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.email}?`)) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  createChildOrganization(parentOrg: Organization) {
    this.newOrg.parentId = parentOrg.id;
    this.showCreateOrgForm = true;
  }

  editOrganization(org: Organization) {
    // TODO: Implement edit organization functionality
    console.log('Edit organization:', org);
  }

  deleteOrganization(org: Organization) {
    if (confirm(`Are you sure you want to delete organization ${org.name}?`)) {
      this.adminService.deleteOrganization(org.id).subscribe({
        next: () => {
          this.organizations = this.organizations.filter(o => o.id !== org.id);
        },
        error: (error) => {
          console.error('Error deleting organization:', error);
        }
      });
    }
  }

  resetNewUser() {
    this.newUser = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: UserRole.VIEWER
    };
  }

  resetNewOrg() {
    this.newOrg = {
      name: '',
      description: '',
      parentId: undefined
    };
  }

  getRoleDistribution() {
    if (!this.dashboardData) return [];
    
    const total = this.dashboardData.overview.totalUsers;
    return [
      { name: 'Owner', count: this.dashboardData.usersByRole['owner'] || 0, color: 'bg-red-500', percentage: total > 0 ? ((this.dashboardData.usersByRole['owner'] || 0) / total) * 100 : 0 },
      { name: 'Admin', count: this.dashboardData.usersByRole['admin'] || 0, color: 'bg-blue-500', percentage: total > 0 ? ((this.dashboardData.usersByRole['admin'] || 0) / total) * 100 : 0 },
      { name: 'Viewer', count: this.dashboardData.usersByRole['viewer'] || 0, color: 'bg-green-500', percentage: total > 0 ? ((this.dashboardData.usersByRole['viewer'] || 0) / total) * 100 : 0 }
    ];
  }

  getTaskStatusDistribution() {
    if (!this.dashboardData) return [];
    
    const total = this.dashboardData.overview.totalTasks;
    return [
      { name: 'Open', count: this.dashboardData.tasksByStatus['open'] || 0, color: 'bg-gray-500', percentage: total > 0 ? ((this.dashboardData.tasksByStatus['open'] || 0) / total) * 100 : 0 },
      { name: 'In Progress', count: this.dashboardData.tasksByStatus['in_progress'] || 0, color: 'bg-yellow-500', percentage: total > 0 ? ((this.dashboardData.tasksByStatus['in_progress'] || 0) / total) * 100 : 0 },
      { name: 'Done', count: this.dashboardData.tasksByStatus['done'] || 0, color: 'bg-green-500', percentage: total > 0 ? ((this.dashboardData.tasksByStatus['done'] || 0) / total) * 100 : 0 }
    ];
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getActionBadgeClass(action: string): string {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Pie Chart Methods
  getPieChartData() {
    if (!this.dashboardData) return [];
    
    const total = this.dashboardData.overview.totalTasks;
    if (total === 0) return [];

    const data = [
      { 
        label: 'Done', 
        count: this.dashboardData.tasksByStatus['done'] || 0, 
        color: '#10b981', // green-500
        percentage: 0
      },
      { 
        label: 'In Progress', 
        count: this.dashboardData.tasksByStatus['in_progress'] || 0, 
        color: '#f59e0b', // yellow-500
        percentage: 0
      },
      { 
        label: 'Open', 
        count: this.dashboardData.tasksByStatus['open'] || 0, 
        color: '#6b7280', // gray-500
        percentage: 0
      }
    ];

    // Calculate percentages and pie chart segments
    const circumference = 2 * Math.PI * 40; // radius = 40
    let currentOffset = 0;

    return data.map(item => {
      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -currentOffset;
      
      currentOffset += (percentage / 100) * circumference;

      return {
        ...item,
        percentage,
        dashArray: strokeDasharray,
        dashOffset: strokeDashoffset
      };
    });
  }

  getTotalTasks(): number {
    return this.dashboardData?.overview.totalTasks || 0;
  }
}