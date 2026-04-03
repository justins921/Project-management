'use client';

import { useState } from 'react';
import { sops as initialSops, teamMembers } from '@/lib/data';
import { SOP, SOPCategory, SOPStatus, SOPStep } from '@/lib/types';

const categories: SOPCategory[] = ['Client Onboarding', 'Web Design', 'SEO', 'Social Media', 'Content', 'Development', 'Internal', 'Sales'];
const statuses: SOPStatus[] = ['Draft', 'Active', 'Under Review', 'Archived'];

const statusStyles: Record<SOPStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  Archived: 'bg-gray-100 text-gray-500 border-gray-200',
};

const categoryIcons: Record<SOPCategory, string> = {
  'Client Onboarding': '🤝',
  'Web Design': '🎨',
  SEO: '🔍',
  'Social Media': '📱',
  Content: '✍️',
  Development: '💻',
  Internal: '🏢',
  Sales: '💼',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SOPsPage() {
  const [sopsList, setSopsList] = useState<SOP[]>(initialSops);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSop, setEditingSop] = useState<SOP | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<SOPCategory>('Internal');
  const [formStatus, setFormStatus] = useState<SOPStatus>('Draft');
  const [formSteps, setFormSteps] = useState<SOPStep[]>([{ title: '', description: '' }]);

  const filteredSops = sopsList.filter(sop => {
    if (selectedCategory !== 'all' && sop.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && sop.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return sop.title.toLowerCase().includes(q) || sop.description.toLowerCase().includes(q);
    }
    return true;
  });

  function getAuthorName(id: string) {
    return teamMembers.find(t => t.id === id)?.name || 'Unknown';
  }

  function openNewSop() {
    setEditingSop(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Internal');
    setFormStatus('Draft');
    setFormSteps([{ title: '', description: '' }]);
    setShowModal(true);
  }

  function openEditSop(sop: SOP) {
    setEditingSop(sop);
    setFormTitle(sop.title);
    setFormDescription(sop.description);
    setFormCategory(sop.category);
    setFormStatus(sop.status);
    setFormSteps([...sop.steps]);
    setShowModal(true);
  }

  function saveSop() {
    const cleanSteps = formSteps.filter(s => s.title.trim() || s.description.trim());
    if (!formTitle.trim() || cleanSteps.length === 0) return;

    if (editingSop) {
      const updated = sopsList.map(s =>
        s.id === editingSop.id
          ? { ...s, title: formTitle, description: formDescription, category: formCategory, status: formStatus, steps: cleanSteps, updatedAt: new Date().toISOString() }
          : s
      );
      setSopsList(updated);
      setSelectedSop(updated.find(s => s.id === editingSop.id) || null);
    } else {
      const newSop: SOP = {
        id: `sop-${Date.now()}`,
        title: formTitle,
        description: formDescription,
        category: formCategory,
        status: formStatus,
        steps: cleanSteps,
        authorId: 'tm-5',
        version: '1.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSopsList([newSop, ...sopsList]);
    }
    setShowModal(false);
  }

  function deleteSop(id: string) {
    setSopsList(sopsList.filter(s => s.id !== id));
    if (selectedSop?.id === id) setSelectedSop(null);
  }

  function addStep() {
    setFormSteps([...formSteps, { title: '', description: '' }]);
  }

  function removeStep(index: number) {
    setFormSteps(formSteps.filter((_, i) => i !== index));
  }

  function updateStep(index: number, field: 'title' | 'description', value: string) {
    const updated = [...formSteps];
    updated[index] = { ...updated[index], [field]: value };
    setFormSteps(updated);
  }

  // Grouped by category
  const groupedSops = filteredSops.reduce<Record<string, SOP[]>>((acc, sop) => {
    if (!acc[sop.category]) acc[sop.category] = [];
    acc[sop.category].push(sop);
    return acc;
  }, {});

  // Detail view
  if (selectedSop) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back button */}
          <button
            onClick={() => setSelectedSop(null)}
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to SOPs
          </button>

          {/* SOP Header */}
          <div className="bg-white rounded-xl border border-[var(--border)] p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-2xl">{categoryIcons[selectedSop.category]}</span>
                  <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">{selectedSop.category}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[selectedSop.status]}`}>
                    {selectedSop.status}
                  </span>
                  <span className="text-xs text-[var(--muted)]">v{selectedSop.version}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">{selectedSop.title}</h1>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{selectedSop.description}</p>
                <div className="flex items-center gap-4 mt-4 text-xs text-[var(--muted)] flex-wrap">
                  <span>By {getAuthorName(selectedSop.authorId)}</span>
                  {selectedSop.lastReviewedBy && <span>Reviewed by {getAuthorName(selectedSop.lastReviewedBy)}</span>}
                  <span>Updated {formatDate(selectedSop.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 self-start">
                <button
                  onClick={() => openEditSop(selectedSop)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => deleteSop(selectedSop.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Steps ({selectedSop.steps.length})</h2>
            {selectedSop.steps.map((step, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-[var(--border)] p-5 sm:p-6 flex gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{step.title}</h3>
                    {step.isOptional && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">Optional</span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Standard Operating Procedures</h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">{sopsList.length} SOPs across {categories.length} categories</p>
        </div>
        <button
          onClick={openNewSop}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors text-sm font-medium self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New SOP
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statuses.map(status => {
          const count = sopsList.filter(s => s.status === status).length;
          return (
            <div key={status} className="bg-white rounded-xl border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--muted)] mb-1">{status}</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search SOPs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{categoryIcons[c]} {c}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
        >
          <option value="all">All Statuses</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* SOPs grouped by category */}
      {Object.entries(groupedSops).length > 0 ? (
        Object.entries(groupedSops).map(([category, categorySops]) => (
          <div key={category} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{categoryIcons[category as SOPCategory]}</span>
              <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">{category}</h2>
              <span className="text-xs text-[var(--muted)]">({categorySops.length})</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categorySops.map(sop => (
                <button
                  key={sop.id}
                  onClick={() => setSelectedSop(sop)}
                  className="bg-white rounded-xl border border-[var(--border)] p-5 text-left hover:shadow-md hover:border-[var(--accent)]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[sop.status]}`}>
                      {sop.status}
                    </span>
                    <span className="text-xs text-[var(--muted)]">v{sop.version}</span>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-1 group-hover:text-[var(--accent)] transition-colors">{sop.title}</h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-2 mb-3">{sop.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--muted)]">{sop.steps.length} steps</span>
                    <span className="text-xs text-[var(--muted)]">{formatDate(sop.updatedAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--muted)]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No SOPs found</h3>
          <p className="text-sm text-[var(--muted)]">Try adjusting your filters or create a new SOP</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] bg-black/40 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-xl w-full max-w-2xl my-4" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--foreground)]">{editingSop ? 'Edit SOP' : 'Create New SOP'}</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="SOP title..."
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Description</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Brief description of this SOP..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as SOPCategory)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as SOPStatus)}
                    className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">Steps</label>
                  <button
                    type="button"
                    onClick={addStep}
                    className="text-xs text-[var(--accent)] hover:text-[var(--accent)]/80 font-medium"
                  >
                    + Add Step
                  </button>
                </div>
                <div className="space-y-3">
                  {formSteps.map((step, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--card-bg)]">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={step.title}
                          onChange={e => updateStep(index, 'title', e.target.value)}
                          placeholder="Step title..."
                          className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                        />
                        <textarea
                          value={step.description}
                          onChange={e => updateStep(index, 'description', e.target.value)}
                          placeholder="Step description..."
                          rows={2}
                          className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none"
                        />
                      </div>
                      {formSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="flex-shrink-0 p-1 text-[var(--muted)] hover:text-red-500 transition-colors mt-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[var(--border)] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSop}
                className="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium"
              >
                {editingSop ? 'Save Changes' : 'Create SOP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
