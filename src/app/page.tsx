'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) setTasks(await res.json());
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || addingTask) return;
    
    setAddingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      });
      if (res.ok) {
        const addedTask = await res.json();
        setTasks([addedTask, ...tasks]);
        setNewTask('');
        setBriefing(null);
      }
    } catch (error) {
      console.error('Failed to add task', error);
    } finally {
      setAddingTask(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
        setBriefing(null);
      }
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const generateBriefing = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/tasks/summary');
      if (res.ok) {
        const data = await res.json();
        setBriefing(data.summary);
      } else {
        setBriefing("Ah! I couldn't generate the briefing at this moment. The AI service might be unavailable. 😔");
      }
    } catch (error) {
      console.error(error);
      setBriefing("Failed to connect to the AI service. Please try again later. 😔");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <main className="container">
      <header className="header">
        <h1 className="title">Smart Task Manager</h1>
        <p className="subtitle">Premium Task Management with AI Briefings</p>
      </header>

      <button 
        className="btn btn-secondary" 
        onClick={generateBriefing}
        disabled={generating}
      >
        {generating ? <div className="spinner" /> : <Sparkles size={18} />}
        {generating ? 'Summoning AI...' : 'Generate AI Briefing'}
      </button>

      {briefing && (
        <div className="briefing">
          <div className="briefing-title">
            <Sparkles size={16} /> Daily Briefing
          </div>
          <div>{briefing}</div>
        </div>
      )}

      <form className="form" onSubmit={addTask}>
        <input
          type="text"
          className="input"
          placeholder="What needs to be done?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          disabled={addingTask}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={addingTask || !newTask.trim()}>
          {addingTask ? <div className="spinner" /> : <Plus size={18} />}
          Add Task
        </button>
      </form>

      {loading ? (
        <div className="empty-state">
          <div>Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          No tasks found. You're all caught up! ✨
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <span className="task-title">{task.title}</span>
              <button 
                className="btn btn-danger"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete Task"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
