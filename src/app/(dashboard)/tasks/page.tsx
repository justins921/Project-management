'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: number;
  due_date: string | null;
  assigned_to: string | null;
  project_id: string | null;
  client_id: string | null;
  completed_at: string | null;
  created_at: string;
  profiles?: { full_name: string; avatar_url: string | null } | null;
  projects?: { name: string } | null;
};

type TeamMember = { id: string; full_name: string };
type ProjectOption = { id: string; name: string };

const priorityConfig: Record<number, { label: string; color: string; flag: string }> = {
  1: { label: 'Urgent', color: 'text-red-500', flag: 'bg-red-500' },
  2: { label: 'High', color: 'text-amber-500', flag: 'bg-amber-500' },
  3: { label: 'Medium', color: 'text-blue-500', flag: 'bg-blue-500' },
  4: { label: 'Low', color: 'text-slate-400', flag: 'bg-slate-400' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  todo: { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-50 text-blue-700' },
  in_review: { label: 'In Review', color: 'bg-amber-50 text-amber-700' },
  done: { label: 'Done', color: 'bg-emerald-50 text-emerald-700' },
};

const statusOrder = ['todo', 'in_progress', 'in_review', 'done'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [showNewTask, setShowNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tenantId, setTenantId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  // New task form
  const [form, setForm] = useState({ title: '', description: '', project_id: '', assigned_to: '', priority: '3', due_date: '', status: 'todo' });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single();
      let tid = profile?.tenant_id;
      if (!tid) {
        const { data: tenant } = await supabase.from('tenants').select('id').eq('owner_id', user.id).single();
        tid = tenant?.id;
      }
      if (!tid) { setLoading(false); return; }
      setTenantId(tid);
      setUserRole(profile?.role || 'owner');

      let taskQuery = supabase
        .from('tasks')
        .select('*, profiles:assigned_to(full_name, avatar_url), projects:project_id(name)')
        .eq('tenant_id', tid)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      // Freelancers only see their assigned tasks
      if (profile?.role === 'freelancer') {
        taskQuery = taskQuery.eq('assigned_to', user.id);
      }

      const [tasksRes, membersRes, projectsRes] = await Promise.all([
        taskQuery,
        supabase.from('profiles').select('id, full_name').eq('tenant_id', tid).in('role', ['owner', 'freelancer']),
        supabase.from('projects').select('id, name').eq('tenant_id', tid).order('name'),
      ]);

      setTasks((tasksRes.data as unknown as Task[]) || []);
      setTeamMembers(membersRes.data || []);
      setProjectOptions(projectsRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== parseInt(filterPriority)) return false;
    if (filterAssignee !== 'all' && t.assigned_to !== filterAssignee) return false;
    if (filterProject !== 'all' && t.project_id !== filterProject) return false;
    return true;
  });

  async function createTask() {
    if (!form.title.trim()) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        tenant_id: tenantId,
        title: form.title,
        description: form.description || null,
        project_id: form.project_id || null,
        assigned_to: form.assigned_to || null,
        priority: parseInt(form.priority),
        due_date: form.due_date || null,
        status: form.status,
      })
      .select('*, profiles:assigned_to(full_name, avatar_url), projects:project_id(name)')
      .single();

    if (!error && data) {
      setTasks([data as unknown as Task, ...tasks]);
      setForm({ title: '', description: '', project_id: '', assigned_to: '', priority: '3', due_date: '', status: 'todo' });
      setShowNewTask(false);
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    const supabase = createClient();
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'done') updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;

    await supabase.from('tasks').update(updates).eq('id', taskId);
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null } : t));
  }

  async function deleteTask(taskId: string) {
    const supabase = createClient();
    await supabase.from('tasks').delete().eq('id', taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    if (editingTask?.id === taskId) setEditingTask(null);
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
  function getColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-[var(--card)] rounded-xl border border-[var(--border)] animate-pulse" />
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-[var(--card)] rounded-xl border border-[var(--border)] animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Tasks</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'list' ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}>List</button>
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'kanban' ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}>Board</button>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
          <option value="all">All Status</option>
          {statusOrder.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
          <option value="all">All Priority</option>
          {[1,2,3,4].map(p => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
        </select>
        {userRole !== 'freelancer' && (
          <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
            <option value="all">All Assignees</option>
            {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
        )}
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-1.5 text-xs border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
          <option value="all">All Projects</option>
          {projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* New Task Form */}
      {showNewTask && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">New Task</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input type="text" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Task title..." className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" autoFocus />
            </div>
            <div className="sm:col-span-2">
              <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Description (optional)" rows={2} className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 resize-none" />
            </div>
            <select value={form.project_id} onChange={e => setForm(f => ({...f, project_id: e.target.value}))} className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
              <option value="">No project</option>
              {projectOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={form.assigned_to} onChange={e => setForm(f => ({...f, assigned_to: e.target.value}))} className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
              <option value="">Unassigned</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))} className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20">
              {[1,2,3,4].map(p => <option key={p} value={p}>{priorityConfig[p].label}</option>)}
            </select>
            <input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowNewTask(false)} className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">Cancel</button>
            <button onClick={createTask} className="px-4 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent-hover)] font-medium">Create</button>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-50 border-b border-[var(--border)] text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
            <div className="col-span-1">P</div>
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Project</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-1">Due</div>
            <div className="col-span-2">Status</div>
          </div>
          {filtered.length > 0 ? (
            <div className="divide-y divide-[var(--border)]">
              {filtered.map(task => (
                <div key={task.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 hover:bg-slate-50 transition-colors items-center group">
                  <div className="col-span-1 flex items-center">
                    <div className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.flag || 'bg-slate-300'}`} title={priorityConfig[task.priority]?.label} />
                  </div>
                  <div className="col-span-4 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>{task.title}</p>
                    {task.description && <p className="text-xs text-[var(--muted)] truncate mt-0.5">{task.description}</p>}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[var(--muted)]">{task.projects?.name || '—'}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {task.profiles?.full_name ? (
                      <>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white ${getColor(task.profiles.full_name)}`}>
                          {getInitials(task.profiles.full_name)}
                        </div>
                        <span className="text-xs text-[var(--muted)] truncate">{task.profiles.full_name}</span>
                      </>
                    ) : (
                      <span className="text-xs text-[var(--muted)]">—</span>
                    )}
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs text-[var(--muted)]">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <select
                      value={task.status}
                      onChange={e => updateTaskStatus(task.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusConfig[task.status]?.color || 'bg-slate-100'}`}
                    >
                      {statusOrder.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                    </select>
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-red-500 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-[var(--muted)]">No tasks match your filters.</div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOrder.map(status => {
            const columnTasks = filtered.filter(t => t.status === status);
            return (
              <div key={status} className="bg-slate-50 rounded-xl p-3 min-h-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">{statusConfig[status].label}</h3>
                  <span className="text-xs text-[var(--muted)] bg-white px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-lg border border-[var(--border)] p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priorityConfig[task.priority]?.flag || 'bg-slate-300'}`} />
                        <p className={`text-sm font-medium flex-1 ${task.status === 'done' ? 'line-through text-[var(--muted)]' : 'text-[var(--foreground)]'}`}>{task.title}</p>
                      </div>
                      {task.projects?.name && (
                        <p className="text-[10px] text-[var(--muted)] mb-2 ml-3.5">{task.projects.name}</p>
                      )}
                      <div className="flex items-center justify-between ml-3.5">
                        <div className="flex items-center gap-1.5">
                          {task.profiles?.full_name && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium text-white ${getColor(task.profiles.full_name)}`}>
                              {getInitials(task.profiles.full_name)}
                            </div>
                          )}
                          {task.due_date && (
                            <span className={`text-[10px] ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-red-500 font-medium' : 'text-[var(--muted)]'}`}>
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {/* Move buttons */}
                        <div className="flex gap-0.5">
                          {status !== 'todo' && (
                            <button onClick={() => updateTaskStatus(task.id, statusOrder[statusOrder.indexOf(status) - 1])} className="p-0.5 text-[var(--muted)] hover:text-[var(--foreground)]" title="Move left">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                          )}
                          {status !== 'done' && (
                            <button onClick={() => updateTaskStatus(task.id, statusOrder[statusOrder.indexOf(status) + 1])} className="p-0.5 text-[var(--muted)] hover:text-[var(--foreground)]" title="Move right">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <p className="text-xs text-[var(--muted)] text-center py-4">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
