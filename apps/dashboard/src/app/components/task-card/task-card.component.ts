import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '@secure-task-system/data'; // Import Task and TaskStatus
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-card.component.html',
  styleUrls: [],
})
export class TaskCardComponent {
  @Input() task!: Task; // Input property to receive a task object
  @Input() canEdit: boolean = true; // Input property to control edit/delete permissions
  @Input() canDrag: boolean = true; // Input property to control drag permissions
  @Output() edit = new EventEmitter<Task>(); // Event for editing a task
  @Output() delete = new EventEmitter<number>(); // Event for deleting a task (emits task ID)
  @Output() statusChange = new EventEmitter<{ taskId: number, status: TaskStatus }>(); // Event for changing status

  TaskStatus = TaskStatus; // Make enum available in template

  onEdit() {
    this.edit.emit(this.task);
  }

  onDelete() {
    if (confirm(`Are you sure you want to delete task "${this.task.title}"?`)) {
      this.delete.emit(this.task.id);
    }
  }

  onChangeStatus(newStatus: TaskStatus) {
    this.statusChange.emit({ taskId: this.task.id, status: newStatus });
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
