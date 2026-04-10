'use client';

import { useState } from 'react';
import { tasks as initialTasks, taskProjects, getTeamMember, getTaskProject } from '@/lib/data';
import { Task, TaskPriority } from '@/lib/types';
import Avatar from '@/components/Avatar';

const priorityConfig: Record<TaskPriority, { label: string; color: string; flag: string }> = {
  1: { label: 'Urgent', color: 'text-red-500', flag: 'bg-red-500' },
  2: { label: 'High', color: 'text-amber-500', flag: 'bg-amber-500' },
  3: { label: 'Medium', color: 'text-blue-500', flag: 'bg-blue-500' },
  4: { label: 'Low', color: 'text-slate-400', flag: 'bg-slate-400' },
};

type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

const kanbanColumns: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { status: 'review', label: 'Review', color: 'bg-amber-500' },
  { status: 'done', label: 'Done', color: 'bg-emerald-500' },
];

type ViewMode = 'today' | 'upcoming' | 'project' | 'completed' | 'board';

// Derive a kanban status from task state
function getTaskKanbanStatus(task: Task): TaskStatus {
  if (task.completed) return 'done';
  if (task.labels?.includes('review') || task.labels?.includes('qa')) return 'review';
  if (task.priority <= 2 && task.dueDate && task.dueDate <= '2026-04-05') return 'in-progress';
  return 'todo';
}

export default function TasksPage() {
  const [taskList, setTaskList] = useState<Task[]>(() =>
    initialTasks.map(t => ({ ...t, _kanbanStatus: getTaskKanbanStatus(t) } as Task & { _kanbanStatus?: TaskStatus }))
  );
  const [kanbanStatuses, setKanbanStatuses] = useState<Record<string, TaskStatus>>(() => {
    const map: Record<string, TaskStatus> = {};
    initialTasks.forEach(t => { map[t.id] = getTaskKanbanStatus(t); });
    return map;
  });
  const [view, setView] = useState<ViewMode>('today');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const today = '2026-04-03';

  function toggleComplete(taskId: string) {
    setTaskList(prev =>
      prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    );
    setKanbanStatuses(prev => {
      const task = taskList.find(t => t.id === taskId);
      if (!task) return prev;
      return { ...prev, [taskId]: task.completed ? 'todo' : 'done' };
    });
  }

  function moveTaskKanban(taskId: string, newStatus: TaskStatus) {
    setKanbanStatuses(prev => ({ ...prev, [taskId]: newStatus }));
    if (newStatus === 'done') {
      setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    } else {
      setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, completed: false } : t));
    }
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    const id = `tk-${Date.now()}`;
    const newTask: Task = {
      id,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 3,
      dueDate: today,
      createdAt: new Date().toISOString(),
      projectId: selectedProject || undefined,
    };
    setTaskList(prev => [newTask, ...prev]);
    setKanbanStatuses(prev => ({ ...prev, [id]: 'todo' }));
    setNewTaskTitle('');
    setShowAddTask(false);
  }

  // Filter tasks based on view
  let filteredTasks: Task[];
  let viewTitle: string;

  switch (view) {
    case 'today':
      filteredTasks = taskList.filter(t => t.dueDate === today && !t.completed);
      viewTitle = 'Today';
      break;
    case 'upcoming':
      filteredTasks = taskList
        .filter(t => !t.completed && t.dueDate && t.dueDate > today)
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      viewTitle = 'Upcoming';
      break;
    case 'project':
      filteredTasks = taskList.filter(t =>
        t.projectId === selectedProject && !t.completed
      );
      viewTitle = taskProjects.find(p => p.id === selectedProject)?.name || 'Project';
      break;
    case 'completed':
      filteredTasks = taskList.filter(t => t.completed);
      viewTitle = 'Completed';
      break;
    case 'board':
      filteredTasks = taskList;
      viewTitle = 'Board';
      break;
  }

  function groupByDate(tasks: Task[]): { label: string; date: string; tasks: Task[] }[] {
    const groups: Record<string, Task[]> = {};
    tasks.forEach(t => {
      const d = t.dueDate || 'No date';
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    });
    return Object.entries(groups).map(([date, dateTasks]) => {
      const d = new Date(date + 'T00:00:00');
      const diffDays = Math.floor((d.getTime() - new Date(today + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
      let label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      if (diffDays === 1) label = 'Tomorrow — ' + label;
      else if (diffDays <= 7) label = d.toLocaleDateString('en-US', { weekday: 'long' }) + ' — ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label, date, tasks: dateTasks };
    });
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-card-border">
        <h2 className="text-lg font-bold text-foreground">Tasks</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <button
          onClick={() => { setView('today'); setSidebarOpen(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
            view === 'today' ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Today
          </span>
          <span className="text-xs text-muted">{taskList.filter(t => t.dueDate === today && !t.completed).length}</span>
        </button>
        <button
          onClick={() => { setView('upcoming'); setSidebarOpen(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
            view === 'upcoming' ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Upcoming
          </span>
          <span className="text-xs text-muted">{taskList.filter(t => !t.completed && t.dueDate && t.dueDate > today).length}</span>
        </button>
        <button
          onClick={() => { setView('board'); setSidebarOpen(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
            view === 'board' ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Board
          </span>
        </button>
        <button
          onClick={() => { setView('completed'); setSidebarOpen(false); }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
            view === 'completed' ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground hover:bg-slate-100'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Completed
          </span>
          <span className="text-xs text-muted">{taskList.filter(t => t.completed).length}</span>
        </button>

        <div className="px-3 pt-5 pb-2">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Projects</p>
        </div>
        {taskProjects.map(proj => {
          const count = taskList.filter(t => t.projectId === proj.id && !t.completed).length;
          const isActive = view === 'project' && selectedProject === proj.id;
          return (
            <button
              key={proj.id}
              onClick={() => { setView('project'); setSelectedProject(proj.id); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                isActive ? 'bg-accent/10 text-accent font-semibold' : 'text-foreground hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: proj.color }} />
                {proj.name}
              </span>
              {count > 0 && <span className="text-xs text-muted">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  function TaskRow({ task }: { task: Task }) {
    const proj = task.projectId ? getTaskProject(task.projectId) : null;
    const assignee = task.assigneeId ? getTeamMember(task.assigneeId) : null;
    const isExpanded = expandedTask === task.id;
    const pri = priorityConfig[task.priority];

    return (
      <div className="group">
        <div
          className={`flex items-start gap-3 px-3 sm:px-4 py-2.5 rounded-lg transition-colors hover:bg-slate-50 ${
            task.completed ? 'opacity-60' : ''
          }`}
        >
          <button
            onClick={() => toggleComplete(task.id)}
            className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-accent border-accent'
                : `border-current ${pri.color} hover:bg-current/10`
            }`}
          >
            {task.completed && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
          >
            <p className={`text-sm ${task.completed ? 'line-through text-muted' : 'text-foreground font-medium'}`}>
              {task.title}
            </p>
            {isExpanded && task.description && (
              <p className="text-xs text-muted mt-1.5 leading-relaxed">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {proj && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: proj.color }}>
                  {proj.name}
                </span>
              )}
              {task.labels?.map(label => (
                <span key={label} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-muted">
                  {label}
                </span>
              ))}
              {task.dueDate && view !== 'today' && (
                <span className={`text-[10px] font-medium ${
                  task.dueDate < today ? 'text-red-500' : task.dueDate === today ? 'text-accent' : 'text-muted'
                }`}>
                  {task.dueDate === today ? 'Today' : new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {assignee && (
              <div className="hidden sm:block">
                <Avatar name={assignee.name} size="sm" />
              </div>
            )}
            <div className={`w-1.5 h-1.5 rounded-full ${pri.flag}`} title={pri.label} />
          </div>
        </div>
      </div>
    );
  }

  // Kanban card for board view
  function KanbanCard({ task }: { task: Task }) {
    const proj = task.projectId ? getTaskProject(task.projectId) : null;
    const assignee = task.assigneeId ? getTeamMember(task.assigneeId) : null;
    const pri = priorityConfig[task.priority];

    return (
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
        className={`bg-white rounded-lg border border-card-border p-3 cursor-grab hover:shadow-md hover:border-accent/30 transition-all active:cursor-grabbing ${
          task.completed ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-2 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${pri.flag}`} />
          <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted' : 'text-foreground'}`}>
            {task.title}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {proj && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white truncate" style={{ backgroundColor: proj.color }}>
                {proj.name}
              </span>
            )}
            {task.dueDate && (
              <span className={`text-[10px] font-medium shrink-0 ${
                task.dueDate < today ? 'text-red-500' : task.dueDate === today ? 'text-accent' : 'text-muted'
              }`}>
                {task.dueDate === today ? 'Today' : new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          {assignee && <Avatar name={assignee.name} size="sm" />}
        </div>
      </div>
    );
  }

  const boardViewContent = (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
      <div className="flex gap-4 h-full min-w-max">
        {kanbanColumns.map(col => {
          const colTasks = taskList
            .filter(t => (kanbanStatuses[t.id] || getTaskKanbanStatus(t)) === col.status)
            .sort((a, b) => a.priority - b.priority);
          return (
            <div
              key={col.status}
              className={`w-[280px] sm:w-[300px] flex flex-col rounded-xl transition-colors ${
                dragOver === col.status ? 'bg-accent/5 ring-2 ring-accent/20' : 'bg-slate-50/80'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const taskId = e.dataTransfer.getData('taskId');
                if (taskId) moveTaskKanban(taskId, col.status);
              }}
            >
              <div className="px-3 py-3 flex items-center gap-2 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="text-xs text-muted bg-white rounded-full px-1.5 py-0.5 border border-card-border">
                  {colTasks.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                {colTasks.map(task => (
                  <KanbanCard key={task.id} task={task} />
                ))}
                {colTasks.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const listViewContent = (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3">
      {showAddTask && (
        <div className="mb-4 p-3 border border-accent/30 rounded-xl bg-accent/5">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task name..."
            className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent mb-2"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setShowAddTask(false); }}
          />
          <div className="flex items-center justify-between">
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="text-xs border border-card-border rounded-lg px-2 py-1 bg-white"
            >
              <option value="">No project</option>
              {taskProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowAddTask(false)} className="px-3 py-1 text-xs text-muted hover:text-foreground">Cancel</button>
              <button onClick={addTask} className="px-3 py-1 text-xs bg-accent text-white rounded-lg hover:bg-accent-hover">Add</button>
            </div>
          </div>
        </div>
      )}

      {view === 'upcoming' ? (
        groupByDate(filteredTasks).map(group => (
          <div key={group.date} className="mb-4">
            <div className="px-3 sm:px-4 py-2">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">{group.label}</h3>
            </div>
            <div className="space-y-0.5">
              {group.tasks.sort((a, b) => a.priority - b.priority).map(task => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="space-y-0.5">
          {filteredTasks.sort((a, b) => a.priority - b.priority).map(task => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      {filteredTasks.length === 0 && !showAddTask && (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <svg className="w-12 h-12 mb-3 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">
            {view === 'completed' ? 'No completed tasks yet' : 'All caught up!'}
          </p>
          <p className="text-xs mt-1">
            {view === 'completed' ? 'Complete a task to see it here' : 'Add a task to get started'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-2rem)] -m-4 sm:-m-6 lg:-m-8 bg-card-bg rounded-xl border border-card-border shadow-sm overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent-hover transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-black/30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static z-20 top-14 lg:top-0 left-0 bottom-0 w-72 lg:w-64 bg-card-bg border-r border-card-border shrink-0 transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-card-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">{viewTitle}</h2>
            {view !== 'board' && (
              <p className="text-xs text-muted">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Content */}
        {view === 'board' ? boardViewContent : listViewContent}
      </div>
    </div>
  );
}
