'use client';

import { useState } from 'react';
import { tools as initialTools } from '@/lib/data';
import { Tool, ToolCategory, BillingCycle } from '@/lib/types';

const categories: ToolCategory[] = ['Design', 'Development', 'SEO', 'Social Media', 'Analytics', 'Hosting', 'Project Management', 'Communication', 'Other'];

const categoryColors: Record<ToolCategory, string> = {
  Design: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Development: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  SEO: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'Social Media': 'bg-pink-50 text-pink-700 ring-pink-600/20',
  Analytics: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Hosting: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Project Management': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Communication: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  Other: 'bg-slate-50 text-slate-700 ring-slate-600/20',
};

function formatCost(cost: number, cycle: BillingCycle): string {
  if (cycle === 'free') return 'Free';
  const formatted = `$${cost.toFixed(2)}`;
  if (cycle === 'monthly') return `${formatted}/mo`;
  if (cycle === 'yearly') return `${formatted}/yr`;
  return formatted;
}

export default function ToolsPage() {
  const [toolList, setToolList] = useState<Tool[]>(initialTools);
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTool, setShowAddTool] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<ToolCategory>('Other');
  const [formUrl, setFormUrl] = useState('');
  const [formLogin, setFormLogin] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formCycle, setFormCycle] = useState<BillingCycle>('monthly');
  const [formIcon, setFormIcon] = useState('');

  const filtered = toolList.filter(t => {
    if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Cost calculations
  const monthlyCost = toolList.reduce((sum, t) => {
    if (t.billingCycle === 'free') return sum;
    if (t.billingCycle === 'yearly') return sum + t.cost / 12;
    if (t.billingCycle === 'one-time') return sum;
    return sum + t.cost;
  }, 0);

  const yearlyCost = toolList.reduce((sum, t) => {
    if (t.billingCycle === 'free') return sum;
    if (t.billingCycle === 'yearly') return sum + t.cost;
    if (t.billingCycle === 'one-time') return sum + t.cost;
    return sum + t.cost * 12;
  }, 0);

  const freeTools = toolList.filter(t => t.billingCycle === 'free').length;

  function resetForm() {
    setFormName(''); setFormDesc(''); setFormCategory('Other'); setFormUrl('');
    setFormLogin(''); setFormCost(''); setFormCycle('monthly'); setFormIcon('');
  }

  function openAddForm() {
    resetForm();
    setEditingTool(null);
    setShowAddTool(true);
  }

  function openEditForm(tool: Tool) {
    setFormName(tool.name);
    setFormDesc(tool.description);
    setFormCategory(tool.category);
    setFormUrl(tool.url || '');
    setFormLogin(tool.loginInfo);
    setFormCost(tool.cost.toString());
    setFormCycle(tool.billingCycle);
    setFormIcon(tool.icon || '');
    setEditingTool(tool);
    setShowAddTool(true);
  }

  function saveTool() {
    if (!formName.trim()) return;
    const toolData: Tool = {
      id: editingTool?.id || `tl-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim(),
      category: formCategory,
      url: formUrl.trim() || undefined,
      loginInfo: formLogin.trim(),
      cost: parseFloat(formCost) || 0,
      billingCycle: formCycle,
      icon: formIcon.trim() || undefined,
    };

    if (editingTool) {
      setToolList(prev => prev.map(t => t.id === editingTool.id ? toolData : t));
    } else {
      setToolList(prev => [...prev, toolData]);
    }
    setShowAddTool(false);
    resetForm();
    setEditingTool(null);
  }

  function deleteTool(id: string) {
    setToolList(prev => prev.filter(t => t.id !== id));
  }

  // Group by category
  const grouped = categories
    .map(cat => ({
      category: cat,
      tools: filtered.filter(t => t.category === cat),
    }))
    .filter(g => g.tools.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Tools & Expenses</h1>
          <p className="text-sm text-muted mt-1">{toolList.length} tools tracked</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Tool</span>
        </button>
      </div>

      {/* Cost summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Monthly Cost</p>
          <p className="text-xl font-bold text-foreground mt-1">${monthlyCost.toFixed(2)}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Yearly Cost</p>
          <p className="text-xl font-bold text-violet-600 mt-1">${yearlyCost.toFixed(2)}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Paid Tools</p>
          <p className="text-xl font-bold text-foreground mt-1">{toolList.length - freeTools}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Free Tools</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{freeTools}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:flex-1 sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
              categoryFilter === 'All' ? 'bg-accent text-white' : 'bg-slate-100 text-muted hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.filter(c => toolList.some(t => t.category === c)).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                categoryFilter === cat ? 'bg-accent text-white' : 'bg-slate-100 text-muted hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools grouped by category */}
      {grouped.map(group => (
        <div key={group.category}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">{group.category}</h2>
            <span className="text-xs text-muted">({group.tools.length})</span>
            <span className="text-xs text-muted ml-auto">
              ${group.tools.reduce((s, t) => s + (t.billingCycle === 'free' ? 0 : t.billingCycle === 'yearly' ? t.cost / 12 : t.cost), 0).toFixed(2)}/mo
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {group.tools.map(tool => (
              <div
                key={tool.id}
                className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                    {tool.icon || '🔧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{tool.name}</h3>
                      <span className={`text-xs font-bold shrink-0 ${tool.billingCycle === 'free' ? 'text-emerald-600' : 'text-foreground'}`}>
                        {formatCost(tool.cost, tool.billingCycle)}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{tool.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ${categoryColors[tool.category]}`}>
                    {tool.category}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg px-3 py-2 mb-3">
                  <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-0.5">Login / Access</p>
                  <p className="text-xs text-foreground font-medium">{tool.loginInfo}</p>
                </div>

                <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditForm(tool)}
                    className="px-2.5 py-1 text-xs font-medium text-muted hover:text-accent transition-colors rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTool(tool.id)}
                    className="px-2.5 py-1 text-xs font-medium text-muted hover:text-red-500 transition-colors rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted text-sm">No tools found.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddTool && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => { setShowAddTool(false); setEditingTool(null); }} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-white rounded-2xl shadow-2xl border border-card-border overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-card-border flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-foreground">{editingTool ? 'Edit Tool' : 'Add Tool'}</h2>
              <button onClick={() => { setShowAddTool(false); setEditingTool(null); }} className="text-muted hover:text-foreground p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-[3rem_1fr] gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Icon</label>
                  <input
                    type="text"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    placeholder="🔧"
                    className="w-full px-2 py-2 text-center text-lg border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Tool Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Figma"
                    className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">What it&apos;s used for</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g., UI/UX design and prototyping"
                  className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ToolCategory)}
                    className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">URL <span className="text-muted/50">(optional)</span></label>
                  <input
                    type="text"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Login / Where credentials are stored</label>
                <input
                  type="text"
                  value={formLogin}
                  onChange={(e) => setFormLogin(e.target.value)}
                  placeholder="e.g., 1Password → Design vault"
                  className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formCost}
                      onChange={(e) => setFormCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Billing</label>
                  <select
                    value={formCycle}
                    onChange={(e) => setFormCycle(e.target.value as BillingCycle)}
                    className="w-full px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-time</option>
                    <option value="free">Free</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-card-border flex justify-end gap-2 shrink-0">
              <button onClick={() => { setShowAddTool(false); setEditingTool(null); }} className="px-4 py-2 text-sm text-muted hover:text-foreground">
                Cancel
              </button>
              <button
                onClick={saveTool}
                disabled={!formName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {editingTool ? 'Save Changes' : 'Add Tool'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
