'use client';

import { useState } from 'react';
import { notes as initialNotes, noteFolders, teamMembers } from '@/lib/data';
import { Note, NoteFolder, NoteColor } from '@/lib/types';

const colorMap: Record<NoteColor, { bg: string; border: string; dot: string }> = {
  default: { bg: 'bg-white', border: 'border-[var(--border)]', dot: 'bg-gray-400' },
  yellow: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-400' },
  green: { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-400' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', dot: 'bg-pink-400' },
};

const noteColors: NoteColor[] = ['default', 'yellow', 'green', 'blue', 'purple', 'pink'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('## ')) {
      return <h2 key={i} className="text-lg font-semibold text-[var(--foreground)] mt-4 mb-2">{line.slice(3)}</h2>;
    }
    if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        return (
          <li key={i} className="ml-4 mb-1 text-sm text-[var(--foreground)]/80 list-disc">
            <strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}
          </li>
        );
      }
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 mb-1 text-sm text-[var(--foreground)]/80 list-disc">{line.slice(2)}</li>;
    }
    if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '');
      return <li key={i} className="ml-4 mb-1 text-sm text-[var(--foreground)]/80 list-decimal">{content}</li>;
    }
    if (line.trim() === '') {
      return <div key={i} className="h-2" />;
    }
    // inline bold
    const parts = line.split(/(\*\*.+?\*\*)/g);
    return (
      <p key={i} className="text-sm text-[var(--foreground)]/80 mb-1">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
}

export default function NotesPage() {
  const [notesList, setNotesList] = useState<Note[]>(initialNotes);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editFolder, setEditFolder] = useState<string>('');
  const [editColor, setEditColor] = useState<NoteColor>('default');

  const filteredNotes = notesList
    .filter(n => {
      if (selectedFolder && n.folderId !== selectedFolder) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  function openNote(note: Note) {
    setSelectedNote(note);
    setIsEditing(false);
    setShowMobileSidebar(false);
  }

  function startEditing(note: Note) {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditFolder(note.folderId || '');
    setEditColor(note.color);
    setIsEditing(true);
  }

  function saveEdit() {
    if (!selectedNote) return;
    const updated = notesList.map(n =>
      n.id === selectedNote.id
        ? { ...n, title: editTitle, content: editContent, folderId: editFolder || undefined, color: editColor, updatedAt: new Date().toISOString() }
        : n
    );
    setNotesList(updated);
    const updatedNote = updated.find(n => n.id === selectedNote.id)!;
    setSelectedNote(updatedNote);
    setIsEditing(false);
  }

  function startNewNote() {
    setEditTitle('');
    setEditContent('');
    setEditFolder(selectedFolder || '');
    setEditColor('default');
    setShowNewNote(true);
    setIsEditing(true);
    setSelectedNote(null);
    setShowMobileSidebar(false);
  }

  function saveNewNote() {
    const newNote: Note = {
      id: `nt-${Date.now()}`,
      title: editTitle || 'Untitled Note',
      content: editContent,
      folderId: editFolder || undefined,
      isPinned: false,
      color: editColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: 'tm-5',
    };
    setNotesList([newNote, ...notesList]);
    setSelectedNote(newNote);
    setShowNewNote(false);
    setIsEditing(false);
  }

  function deleteNote(noteId: string) {
    setNotesList(notesList.filter(n => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  }

  function togglePin(noteId: string) {
    const updated = notesList.map(n =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n
    );
    setNotesList(updated);
    if (selectedNote?.id === noteId) {
      setSelectedNote(updated.find(n => n.id === noteId)!);
    }
  }

  function getAuthorName(authorId?: string) {
    if (!authorId) return '';
    return teamMembers.find(t => t.id === authorId)?.name || '';
  }

  function getFolderName(folderId?: string) {
    if (!folderId) return 'Unfiled';
    return noteFolders.find(f => f.id === folderId)?.name || 'Unfiled';
  }

  const sidebarPanel = (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-[var(--border)]">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
          />
        </div>
      </div>

      {/* Folders */}
      <div className="p-3 border-b border-[var(--border)]">
        <button
          onClick={() => setSelectedFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            !selectedFolder ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--foreground)]/70 hover:bg-[var(--muted)]/30'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          All Notes
          <span className="ml-auto text-xs text-[var(--muted)]">{notesList.length}</span>
        </button>
        {noteFolders.map(folder => {
          const count = notesList.filter(n => n.folderId === folder.id).length;
          return (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFolder === folder.id ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--foreground)]/70 hover:bg-[var(--muted)]/30'
              }`}
            >
              <span className="text-base">{folder.icon}</span>
              {folder.name}
              <span className="ml-auto text-xs text-[var(--muted)]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.map(note => {
          const colors = colorMap[note.color];
          return (
            <button
              key={note.id}
              onClick={() => openNote(note)}
              className={`w-full text-left p-3 rounded-lg mb-1.5 border transition-all ${
                selectedNote?.id === note.id
                  ? `${colors.bg} ${colors.border} shadow-sm`
                  : `bg-white border-transparent hover:border-[var(--border)] hover:shadow-sm`
              }`}
            >
              <div className="flex items-start gap-2">
                {note.isPinned && (
                  <svg className="w-3.5 h-3.5 text-[var(--accent)] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                  </svg>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{note.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">
                    {note.content.replace(/[#*\-]/g, '').slice(0, 100)}
                  </p>
                  <p className="text-[10px] text-[var(--muted)] mt-1">{formatDate(note.updatedAt)}</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors.dot}`} />
              </div>
            </button>
          );
        })}
        {filteredNotes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--muted)]">No notes found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border)] bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-[var(--muted)]/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Notes</h1>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              {selectedFolder ? getFolderName(selectedFolder) : 'All Notes'} — {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={startNewNote}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Note</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <div className="lg:hidden fixed inset-0 z-30 bg-black/30" onClick={() => setShowMobileSidebar(false)} />
        )}

        {/* Sidebar / Note list */}
        <div className={`
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static z-40 lg:z-auto
          w-80 bg-[var(--card-bg)] border-r border-[var(--border)] h-full
          transition-transform duration-200 ease-in-out
        `}>
          {sidebarPanel}
        </div>

        {/* Note Detail */}
        <div className="flex-1 overflow-y-auto bg-white">
          {(isEditing && (showNewNote || selectedNote)) ? (
            <div className="max-w-3xl mx-auto p-4 sm:p-8">
              {/* Editor toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {noteColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setEditColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${colorMap[color].dot} ${
                        editColor === color ? 'border-[var(--foreground)] scale-110' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setShowNewNote(false); }}
                    className="px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={showNewNote ? saveNewNote : saveEdit}
                    className="px-4 py-1.5 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium"
                  >
                    {showNewNote ? 'Create' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Folder select */}
              <select
                value={editFolder}
                onChange={e => setEditFolder(e.target.value)}
                className="mb-4 text-xs px-2 py-1 border border-[var(--border)] rounded-md bg-[var(--card-bg)] text-[var(--muted)] focus:outline-none"
              >
                <option value="">No folder</option>
                {noteFolders.map(f => (
                  <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                ))}
              </select>

              {/* Title */}
              <input
                type="text"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-2xl sm:text-3xl font-bold text-[var(--foreground)] bg-transparent border-none outline-none placeholder:text-[var(--muted)]/40 mb-4"
                autoFocus
              />

              {/* Content */}
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Start writing... (Markdown supported: ## headings, **bold**, - lists)"
                className="w-full min-h-[60vh] text-sm text-[var(--foreground)]/80 bg-transparent border-none outline-none resize-none placeholder:text-[var(--muted)]/40 leading-relaxed"
              />
            </div>
          ) : selectedNote ? (
            <div className="max-w-3xl mx-auto p-4 sm:p-8">
              {/* Note header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[selectedNote.color].bg} ${colorMap[selectedNote.color].border} border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colorMap[selectedNote.color].dot}`} />
                      {getFolderName(selectedNote.folderId)}
                    </span>
                    {selectedNote.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)]">
                        Pinned
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">{selectedNote.title}</h1>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted)] flex-wrap">
                    <span>{getAuthorName(selectedNote.authorId)}</span>
                    <span>Updated {formatDate(selectedNote.updatedAt)} at {formatTime(selectedNote.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                  <button
                    onClick={() => togglePin(selectedNote.id)}
                    className={`p-2 rounded-lg transition-colors ${selectedNote.isPinned ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/20'}`}
                    title={selectedNote.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => startEditing(selectedNote)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/20 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Note content rendered */}
              <div className={`p-4 sm:p-6 rounded-xl border ${colorMap[selectedNote.color].bg} ${colorMap[selectedNote.color].border}`}>
                {renderMarkdown(selectedNote.content)}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <div className="w-16 h-16 rounded-2xl bg-[var(--muted)]/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Select a note</h3>
                <p className="text-sm text-[var(--muted)]">Choose a note from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
