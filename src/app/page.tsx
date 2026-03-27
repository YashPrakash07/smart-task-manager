'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Trash2, Plus, CheckCircle2, Circle, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || addingTask) return;
    
    setAddingTask(true);
    const taskTitle = newTask;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskTitle }),
      });
      if (res.ok) {
        const addedTask = await res.json();
        setTasks([addedTask, ...tasks]);
        setNewTask('');
        setBriefing(null);
        toast.success('Task deployed successfully');
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      console.error('Failed to add task', error);
      toast.error('Network error while adding task');
    } finally {
      setAddingTask(false);
    }
  };

  const deleteTask = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(tasks.filter((t) => t.id !== id));
        setBriefing(null);
        toast.success(`Removed: ${title}`);
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task', error);
      toast.error('Network error while deleting task');
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        setTasks(
          tasks.map((t) =>
            t.id === task.id ? { ...t, completed: !t.completed } : t
          )
        );
        toast.success(task.completed ? 'Task marked active' : 'Task completed! ✨');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to toggle task', error);
      toast.error('Network error while updating status');
    }
  };

  const generateBriefing = async () => {
    if (generating) return;
    setGenerating(true);
    setBriefing('');
    const toastId = toast.loading('Summoning AI for your briefing...');
    
    try {
      const res = await fetch('/api/tasks/summary');
      
      if (!res.ok) {
        setBriefing("Ah! I couldn't generate the briefing at this moment. 😔");
        toast.error('AI service temporarily unavailable', { id: toastId });
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader || !decoder) {
        const data = await res.json();
        setBriefing(data.summary);
        toast.success('Briefing generated!', { id: toastId });
        return;
      }

      toast.dismiss(toastId);

      let content = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        setBriefing(content);
      }
      
      toast.success('Briefing complete! ✨');
    } catch (error) {
      console.error(error);
      setBriefing("Failed to connect to the AI service. Please try again later. 😔");
      toast.error('Failed to connect to AI service', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="brand">
          <h1>SmartTask</h1>
          <p>Productivity Engine with AI Core</p>
        </div>
        <LayoutDashboard size={22} color="#64748b" />
      </header>

      <div className="app-container">
        {/* Sidebar / AI Column */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <BrainCircuit size={20} style={{ color: '#4f46e5' }} />
              <h2 style={{ margin: 0 }}>AI System</h2>
            </div>
            
            <button 
              className="btn btn-secondary" 
              onClick={generateBriefing}
              disabled={generating}
              style={{ marginBottom: '1.5rem' }}
            >
              {generating ? <div className="spinner" /> : <Sparkles size={18} />}
              {generating ? 'Streaming...' : 'Generate Daily Briefing'}
            </button>

            {briefing !== null && (
              <div className="briefing-box">
                <div className="briefing-header">
                  <Sparkles size={14} /> Briefing
                </div>
                <div>{briefing || 'Initializing neural link...'}</div>
              </div>
            )}
            
            {briefing === null && !generating && (
              <div className="empty-state" style={{ padding: '2rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                <p style={{ fontSize: '0.875rem' }}>Want a quick summary? Let our AI analyze your tasks!</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Section */}
        <section className="main-view">
          <form className="form" onSubmit={addTask}>
            <input
              type="text"
              className="input"
              placeholder="Deploy a new objective..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={addingTask}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={addingTask || !newTask.trim()}>
              {addingTask ? <div className="spinner" /> : <Plus size={20} />}
              <span>Add Task</span>
            </button>
          </form>

          {loading ? (
            <div className="empty-state">
              <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
              <p>Synchronizing workspace...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 700 }}>Workspace Clear</p>
              <p>Everything is currently up to date. ✨</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'task-completed' : ''}`}>
                  <div className="task-content">
                    <button
                      className={`btn-toggle ${task.completed ? 'completed' : ''}`}
                      onClick={() => toggleTask(task)}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <span className="task-title">{task.title}</span>
                  </div>
                  <button 
                    className="btn-delete"
                    onClick={() => deleteTask(task.id, task.title)}
                    aria-label="Remove Objective"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
