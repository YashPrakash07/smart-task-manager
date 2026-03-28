'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { TaskForm } from '@/components/TaskForm';
import { TaskItem } from '@/components/TaskItem';
import { BriefingCard } from '@/components/BriefingCard';

/**
 * Interface representing a task object from the database.
 */
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  // Initialize workspace by fetching tasks on first mount
  useEffect(() => {
    fetchTasks();
  }, []);

  /**
   * Fetches the current task list from the API and updates local state.
   */
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

  /**
   * Handles adding a new task objective to the database and UI.
   * @param title The name of the task to be created.
   */
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
        // Prepend new task and clear any existing AI briefing
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

  /**
   * Permanently removes a task objective.
   * @param id Unique identifier of the task.
   * @param title Title of the task (for the toast notification).
   */
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

  /**
   * Toggles the completion status of a task and re-sorts the list.
   * Completed tasks move to the bottom.
   * @param task The task object to be toggled.
   */
  const toggleTask = async (task: Task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      
      if (res.ok) {
        // Map the updated state and then apply immediate re-sorting
        const updatedTasks = tasks.map((t) =>
          t.id === task.id ? { ...t, completed: !t.completed } : t
        );
        
        // RE-SORTING LOGIC: Active tasks (top) vs Completed tasks (bottom)
        const sortedTasks = [...updatedTasks].sort((a, b) => {
          if (a.completed === b.completed) {
            // Tie-break with creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          // Move completed tasks to the bottom
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

  /**
   * Connects to the AI summary engine and streams the daily briefing response.
   */
  const generateBriefing = async () => {
    if (generating) return;
    setGenerating(true);
    setBriefing('');
    const toastId = toast.loading('Summoning AI for your briefing...');
    
    try {
      const res = await fetch('/api/tasks/summary');
      
      // Handle standard API errors
      if (!res.ok) {
        setBriefing("Ah! I couldn't generate the briefing at this moment. 😔");
        toast.error('AI service temporarily unavailable', { id: toastId });
        return;
      }

      // INITIALIZE STREAM READING
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      // Fallback for browsers that don't fully support streaming response body
      if (!reader || !decoder) {
        const data = await res.json();
        setBriefing(data.summary);
        toast.success('Briefing generated!', { id: toastId });
        return;
      }

      toast.dismiss(toastId);

      let content = '';
      // LOOP UNTIL STREAM IS CLOSED: Reads and joins text chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        setBriefing(content); // Update UI incrementally for typing effect
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
      {/* GLOBAL HEADER */}
      <header className="app-header">
        <div className="brand">
          <h1>SmartTask</h1>
          <p>Productivity Engine with AI Core</p>
        </div>
        <LayoutDashboard size={22} color="#64748b" />
      </header>

      <div className="app-container">
        {/* SIDE PANEL: Handles AI Briefing interactions */}
        <aside className="sidebar">
          <BriefingCard 
            briefing={briefing} 
            generating={generating} 
            onGenerate={generateBriefing} 
          />
        </aside>

        {/* MAIN FOCUS AREA: Task Management */}
        <section className="main-view">
          <TaskForm onAdd={addTask} disabled={addingTask} />

          {/* DYNAMIC LIST VIEW: Handles Loading, Empty, and Task states */}
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
