'use client';

import { Trash2, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string, title: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className={`task-item ${task.completed ? 'task-completed' : ''}`}>
      <div className="task-content">
        <button
          className={`btn-toggle ${task.completed ? 'completed' : ''}`}
          onClick={() => onToggle(task)}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        <span className="task-title">{task.title}</span>
      </div>
      <button 
        className="btn-delete"
        onClick={() => onDelete(task.id, task.title)}
        aria-label="Remove Objective"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
