'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

interface TaskFormProps {
  onAdd: (title: string) => Promise<void>;
  disabled?: boolean;
}

export function TaskForm({ onAdd, disabled }: TaskFormProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || disabled) return;
    await onAdd(title);
    setTitle('');
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        placeholder="Deploy a new objective..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || !title.trim()}>
        {disabled ? <div className="spinner" /> : <Plus size={20} />}
        <span>Add Task</span>
      </button>
    </form>
  );
}
