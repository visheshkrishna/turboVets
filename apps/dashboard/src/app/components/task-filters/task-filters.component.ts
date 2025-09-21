import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, TaskStatus, TaskCategory } from '@secure-task-system/data';

export interface TaskFilters {
  search?: string;
  status?: string;
  category?: string;
  priority?: number;
  assignedToId?: number;
  createdById?: number;
  sortBy?: string;
  sortOrder?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Filter Button -->
    <div class="mb-6">
      <button
        (click)="toggleFilters()"
        class="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <svg 
          class="w-4 h-4"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
        </svg>
        <span class="text-sm font-medium">Filter & Sort</span>
        <span *ngIf="hasActiveFilters()" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Active
        </span>
      </button>
    </div>

    <!-- Filter Modal -->
    <div *ngIf="isExpanded" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" (click)="toggleFilters()">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto transform transition-all duration-300 ease-out" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Filter & Sort Tasks</h3>
          <button
            (click)="toggleFilters()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6">

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            [(ngModel)]="filters.search"
            placeholder="Search tasks..."
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>

        <!-- Status Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            [(ngModel)]="filters.status"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="open">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            [(ngModel)]="filters.category"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <!-- Priority Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            [(ngModel)]="filters.priority"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option [value]="1">1 - Low</option>
            <option [value]="2">2 - Medium</option>
            <option [value]="3">3 - High</option>
            <option [value]="4">4 - Critical</option>
            <option [value]="5">5 - Urgent</option>
          </select>
        </div>

        <!-- Assigned To Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            [(ngModel)]="filters.assignedToId"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Users</option>
            <option *ngFor="let user of users" [value]="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>

        <!-- Created By Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Created By</label>
          <select
            [(ngModel)]="filters.createdById"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Creators</option>
            <option *ngFor="let user of users" [value]="user.id">
              {{ user.firstName }} {{ user.lastName }}
            </option>
          </select>
        </div>

        <!-- Sort By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            [(ngModel)]="filters.sortBy"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <!-- Sort Order -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <select
            [(ngModel)]="filters.sortOrder"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      <!-- Date Range Filters -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            [(ngModel)]="filters.dateFrom"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            [(ngModel)]="filters.dateTo"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
        </div>
      </div>

      <!-- Active Filters Summary -->
      <div *ngIf="hasActiveFilters()" class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex flex-wrap gap-2">
          <span class="text-sm text-gray-600">Active filters:</span>
          <span *ngIf="filters.search" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Search: "{{ filters.search }}"
            <button (click)="removeFilter('search')" class="ml-1 text-blue-600 hover:text-blue-800">×</button>
          </span>
          <span *ngIf="filters.status" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Status: {{ getStatusLabel(filters.status) }}
            <button (click)="removeFilter('status')" class="ml-1 text-green-600 hover:text-green-800">×</button>
          </span>
          <span *ngIf="filters.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Category: {{ filters.category }}
            <button (click)="removeFilter('category')" class="ml-1 text-purple-600 hover:text-purple-800">×</button>
          </span>
          <span *ngIf="filters.priority" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Priority: {{ filters.priority }}
            <button (click)="removeFilter('priority')" class="ml-1 text-orange-600 hover:text-orange-800">×</button>
          </span>
        </div>
        </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center space-x-2">
            <button
              (click)="clearFilters()"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div class="flex items-center space-x-3">
            <button
              (click)="toggleFilters()"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="applyFilters()"
              class="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TaskFiltersComponent implements OnInit {
  @Input() users: User[] = [];
  @Output() filtersChange = new EventEmitter<TaskFilters>();

  isExpanded = false;
  filters: TaskFilters = {
    search: '',
    status: '',
    category: '',
    priority: undefined,
    assignedToId: undefined,
    createdById: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateFrom: '',
    dateTo: ''
  };

  ngOnInit() {
    // Don't emit initial filters - wait for user to apply
  }

  onFilterChange() {
    // Clean up empty values and format dates
    const cleanFilters: TaskFilters = {};
    
    Object.keys(this.filters).forEach(key => {
      const value = this.filters[key as keyof TaskFilters];
      if (value !== '' && value !== undefined && value !== null) {
        // Format date fields to ISO string
        if (key === 'dateFrom' || key === 'dateTo') {
          if (value) {
            // Convert date string to ISO format for backend
            const date = new Date(value as string);
            (cleanFilters as any)[key] = date.toISOString().split('T')[0];
          }
        } else {
          (cleanFilters as any)[key] = value;
        }
      }
    });

    console.log('🔍 TaskFilters: Emitting filters:', cleanFilters);
    this.filtersChange.emit(cleanFilters);
  }

  clearFilters() {
    this.filters = {
      search: '',
      status: '',
      category: '',
      priority: undefined,
      assignedToId: undefined,
      createdById: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      dateFrom: '',
      dateTo: ''
    };
    this.onFilterChange();
  }

  removeFilter(filterKey: string) {
    if (filterKey === 'priority' || filterKey === 'assignedToId' || filterKey === 'createdById') {
      (this.filters as any)[filterKey] = undefined;
    } else {
      (this.filters as any)[filterKey] = '';
    }
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.status ||
      this.filters.category ||
      this.filters.priority ||
      this.filters.assignedToId ||
      this.filters.createdById ||
      this.filters.dateFrom ||
      this.filters.dateTo
    );
  }

  getStatusLabel(status: string): string {
    const statusLabels: { [key: string]: string } = {
      'open': 'To Do',
      'in_progress': 'In Progress',
      'done': 'Done'
    };
    return statusLabels[status] || status;
  }

  toggleFilters() {
    this.isExpanded = !this.isExpanded;
  }

  applyQuickFilter(filterKey: string, value: string) {
    // Clear other filters first
    this.clearFilters();
    // Apply the quick filter
    (this.filters as any)[filterKey] = value;
    this.onFilterChange();
  }

  applyFilters() {
    this.onFilterChange();
    this.toggleFilters();
  }
}
