'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { BriefingCard } from '@/components/BriefingCard';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
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

  const addTask = async (title: string) => {
    setAddingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const addedTask = await res.json();
        setTasks([addedTask, ...tasks]);
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
        const updatedTasks = tasks.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        );
        
        // Re-sort: Active tasks first (createdAt DESC), then Completed tasks (createdAt DESC)
        const sortedTasks = [...updatedTasks].sort((a, b) => {
          if (a.completed === b.completed) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.completed ? 1 : -1;
        });
        
        setTasks(sortedTasks);
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
        <aside className="sidebar">
          <BriefingCard 
            briefing={briefing} 
            generating={generating} 
            onGenerate={generateBriefing} 
          />
        </aside>

        <section className="main-view">
          <TaskForm onAdd={addTask} disabled={addingTask} />

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
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask} 
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
