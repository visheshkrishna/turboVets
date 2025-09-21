import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, User } from '@secure-task-system/data';
import { UsersService } from '../../services/users.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
})
export class TaskFormComponent implements OnInit, OnChanges {
  @Input() taskToEdit: Task | null = null;
  @Output() saveTask = new EventEmitter<any>(); // Emits the raw form value
  @Output() cancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  users$: Observable<User[]>;

  constructor(private usersService: UsersService) {
    this.users$ = this.usersService.getUsersForAssignment();
    this.initForm();
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['taskToEdit']) {
      this.initForm();
    }
  }

  private initForm() {
    this.taskForm = new FormGroup({
      title: new FormControl(this.taskToEdit?.title || '', [Validators.required, Validators.minLength(3)]),
      description: new FormControl(this.taskToEdit?.description || '', [Validators.required]),
      assigneeId: new FormControl(this.taskToEdit?.assignedToId || '', [Validators.required]),
      priority: new FormControl(this.taskToEdit?.priority || 1, [Validators.required, Validators.min(1), Validators.max(5)]),
      dueDate: new FormControl(this.taskToEdit?.dueDate ? new Date(this.taskToEdit.dueDate).toISOString().split('T')[0] : ''),
      category: new FormControl(this.taskToEdit?.category || 'work', [Validators.required]),
    });
  }

  // --- START OF THE FIX ---
  // Add these public getters to expose the form controls to the template
  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }

  get assigneeId() {
    return this.taskForm.get('assigneeId');
  }

  get priority() {
    return this.taskForm.get('priority');
  }

  get dueDate() {
    return this.taskForm.get('dueDate');
  }

  get category() {
    return this.taskForm.get('category');
  }
  // --- END OF THE FIX ---

  onSubmit() {
    if (this.taskForm.valid) {
      const formData = this.taskForm.value;
      const taskData = {
        title: formData.title,
        description: formData.description,
        assignedToId: parseInt(formData.assigneeId),
        priority: parseInt(formData.priority),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        category: formData.category
      };
      this.saveTask.emit(taskData);
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}