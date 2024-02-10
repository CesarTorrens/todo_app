import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../interfaces/task.interface';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor() {
    effect(() => {
      const tasks = this.tasks();
      localStorage.setItem('tasks', JSON.stringify(tasks));
    });
  }

  ngOnInit() {
    const storage = localStorage.getItem('tasks');
    if (storage) {
      const tasks = JSON.parse(storage);
      this.tasks.set(tasks);
    }
  }

  tasks = signal<Task[]>([]);
  filter = signal<'all' | 'pending' | 'completed'>('all');

  tasksFiltered = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();
    if (filter === 'pending') return tasks.filter((task) => !task.completed);

    if (filter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  });

  newTaskCtrl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  addTask() {
    if (this.newTaskCtrl.valid) {
      const value = this.newTaskCtrl.value.trim();
      if (!value) return;
      let newId = Math.random();
      this.tasks().forEach((task) => {
        if (task.id === newId) {
          newId += Math.random();
        }
      });
      const newTask = { id: Math.random(), title: value, completed: false };
      this.tasks.update((oldTasks) => [...oldTasks, newTask]);
      // Para limpiar el valor del input
      this.newTaskCtrl.setValue('');
    }
  }

  deleteTask(id: number) {
    const tasksFiltered = this.tasks().filter((task) => task.id !== id);
    this.tasks.set(tasksFiltered);
  }

  toggleCompleted(taskId: number) {
    const ind = this.tasks().findIndex((task) => task.id === taskId);
    this.tasks.update((oldTasks) => {
      return oldTasks.map((task, i) => {
        if (i === ind) {
          return {
            ...task,
            completed: !task.completed,
          };
        }
        return task;
      });
    });
  }

  editTaskToggle(taskId: number) {
    const ind = this.tasks().findIndex((task) => task.id === taskId);
    if (this.tasks()[ind].completed) return;
    this.tasks.update((oldTasks) => {
      return oldTasks.map((task, i) => {
        if (i === ind) {
          return {
            ...task,
            editing: true,
          };
        }
        return {
          ...task,
          editing: false,
        };
      });
    });
  }

  editTask(taskId: number, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim();
    if (!value && value.length < 2) return;
    const ind = this.tasks().findIndex((task) => task.id === taskId);
    this.tasks.update((oldTasks) => {
      return oldTasks.map((task, i) => {
        if (i === ind) {
          return {
            ...task,
            title: value,
            editing: false,
          };
        }
        return task;
      });
    });
  }

  changeFilter(filter: 'all' | 'pending' | 'completed') {
    this.filter.set(filter);
  }
}
