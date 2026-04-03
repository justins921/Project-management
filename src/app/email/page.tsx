'use client';

import { useState } from 'react';
import { emails, getTeamMember, getClient } from '@/lib/data';
import { Email, EmailStatus } from '@/lib/types';
import Avatar from '@/components/Avatar';

const folders: { status: EmailStatus | 'all'; label: string; icon: React.ReactNode }[] = [
  { status: 'all', label: 'All Mail', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { status: 'inbox', label: 'Inbox', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg> },
  { status: 'in-progress', label: 'In Progress', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { status: 'waiting', label: 'Waiting', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  { status: 'done', label: 'Done', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { status: 'archived', label: 'Archived', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
];

const kanbanColumns: { status: EmailStatus; label: string; color: string }[] = [
  { status: 'inbox', label: 'Inbox', color: 'bg-blue-500' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'waiting', label: 'Waiting', color: 'bg-violet-500' },
  { status: 'done', label: 'Done', color: 'bg-emerald-500' },
];

const statusColors: Record<EmailStatus, string> = {
  'inbox': 'bg-blue-500',
  'in-progress': 'bg-amber-500',
  'waiting': 'bg-violet-500',
  'done': 'bg-emerald-500',
  'archived': 'bg-slate-400',
};

export default function EmailPage() {
  const [emailList, setEmailList] = useState<Email[]>(emails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFolder, setActiveFolder] = useState<EmailStatus | 'all'>('inbox');
  const [view, setView] = useState<'inbox' | 'board'>('inbox');
  const [dragOver, setDragOver] = useState<EmailStatus | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredEmails = activeFolder === 'all'
    ? emailList
    : emailList.filter(e => e.status === activeFolder);

  const sortedEmails = [...filteredEmails].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  function moveEmail(emailId: string, newStatus: EmailStatus) {
    setEmailList(prev =>
      prev.map(e => e.id === emailId ? { ...e, status: newStatus } : e)
    );
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(prev => prev ? { ...prev, status: newStatus } : null);
    }
  }

  function markRead(emailId: string) {
    setEmailList(prev =>
      prev.map(e => e.id === emailId ? { ...e, isRead: true } : e)
    );
  }

  function formatDate(ts: string) {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function openEmail(email: Email) {
    setSelectedEmail(email);
    markRead(email.id);
  }

  // Sidebar content
  const emailSidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-card-border">
        <h2 className="text-lg font-bold text-foreground">Email</h2>
        <p className="text-xs text-muted mt-0.5">{emailList.filter(e => !e.isRead).length} unread</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {folders.map(folder => {
          const count = folder.status === 'all'
            ? emailList.length
            : emailList.filter(e => e.status === folder.status).length;
          const unread = folder.status === 'all'
            ? emailList.filter(e => !e.isRead).length
            : emailList.filter(e => e.status === folder.status && !e.isRead).length;
          const isActive = view === 'inbox' && activeFolder === folder.status;

          return (
            <button
              key={folder.status}
              onClick={() => { setActiveFolder(folder.status); setView('inbox'); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-foreground hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2.5">
                {folder.icon}
                {folder.label}
              </span>
              <div className="flex items-center gap-1.5">
                {unread > 0 && (
                  <span className="text-[10px] font-semibold bg-accent text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unread}
                  </span>
                )}
                {unread === 0 && count > 0 && (
                  <span className="text-xs text-muted">{count}</span>
                )}
              </div>
            </button>
          );
        })}

        <div className="pt-3">
          <button
            onClick={() => { setView('board'); setSidebarOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition-colors ${
              view === 'board'
                ? 'bg-accent/10 text-accent font-semibold'
                : 'text-foreground hover:bg-slate-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Board View
          </button>
        </div>
      </div>
    </div>
  );

  // Inbox list view
  const inboxView = (
    <div className="flex-1 overflow-y-auto">
      {sortedEmails.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <svg className="w-12 h-12 mb-3 text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">No emails here</p>
        </div>
      ) : (
        <div className="divide-y divide-card-border/50">
          {sortedEmails.map(email => {
            const assignee = email.assigneeId ? getTeamMember(email.assigneeId) : null;
            const client = email.clientId ? getClient(email.clientId) : null;
            return (
              <div
                key={email.id}
                onClick={() => openEmail(email)}
                className={`flex items-start gap-3 px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors ${
                  !email.isRead ? 'bg-accent/[0.03]' : ''
                }`}
              >
                <div className="mt-1.5 shrink-0">
                  <Avatar name={email.from} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                      {email.from}
                    </span>
                    {!email.isRead && <div className="w-2 h-2 rounded-full bg-accent shrink-0" />}
                    <span className="text-xs text-muted ml-auto shrink-0">{formatDate(email.timestamp)}</span>
                  </div>
                  <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-foreground' : 'text-foreground/70'}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted truncate mt-0.5">{email.preview}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {activeFolder === 'all' && (
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors[email.status]}`} />
                    )}
                    {email.labels?.map(label => (
                      <span key={label} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        label === 'urgent' ? 'bg-red-50 text-red-600' :
                        label === 'client' ? 'bg-blue-50 text-blue-600' :
                        label === 'review' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {label}
                      </span>
                    ))}
                    {client && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600">
                        {client.name}
                      </span>
                    )}
                    {assignee && (
                      <div className="ml-auto shrink-0 hidden sm:block">
                        <Avatar name={assignee.name} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Board view
  const boardView = (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
      <div className="flex gap-4 h-full min-w-max">
        {kanbanColumns.map(col => {
          const colEmails = emailList
            .filter(e => e.status === col.status)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          return (
            <div
              key={col.status}
              className={`w-[300px] flex flex-col rounded-xl transition-colors ${
                dragOver === col.status ? 'bg-accent/5 ring-2 ring-accent/20' : 'bg-slate-50/80'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const emailId = e.dataTransfer.getData('emailId');
                if (emailId) moveEmail(emailId, col.status);
              }}
            >
              <div className="px-3 py-3 flex items-center gap-2 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold text-foreground">{col.label}</span>
                <span className="text-xs text-muted bg-white rounded-full px-1.5 py-0.5 border border-card-border">
                  {colEmails.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                {colEmails.map(email => {
                  const assignee = email.assigneeId ? getTeamMember(email.assigneeId) : null;
                  const client = email.clientId ? getClient(email.clientId) : null;
                  return (
                    <div
                      key={email.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('emailId', email.id)}
                      onClick={() => openEmail(email)}
                      className={`bg-white rounded-lg border border-card-border p-3 cursor-pointer hover:shadow-md hover:border-accent/30 transition-all ${
                        !email.isRead ? 'border-l-2 border-l-accent' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className={`text-sm truncate ${!email.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                          {email.from}
                        </p>
                        <span className="text-[10px] text-muted shrink-0">{formatDate(email.timestamp)}</span>
                      </div>
                      <p className={`text-sm truncate mb-1 ${!email.isRead ? 'font-medium text-foreground' : 'text-foreground/70'}`}>
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted truncate">{email.preview}</p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-card-border/50">
                        <div className="flex gap-1 flex-wrap">
                          {email.labels?.map(label => (
                            <span key={label} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              label === 'urgent' ? 'bg-red-50 text-red-600' :
                              label === 'client' ? 'bg-blue-50 text-blue-600' :
                              label === 'review' ? 'bg-amber-50 text-amber-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {label}
                            </span>
                          ))}
                          {client && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-violet-50 text-violet-600">
                              {client.name}
                            </span>
                          )}
                        </div>
                        {assignee && <Avatar name={assignee.name} size="sm" />}
                      </div>
                    </div>
                  );
                })}
                {colEmails.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted">No emails</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const currentFolderLabel = folders.find(f => f.status === activeFolder)?.label || 'Inbox';

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-2rem)] -m-4 sm:-m-6 lg:-m-8 bg-card-bg rounded-xl border border-card-border shadow-sm overflow-hidden">
        {/* Mobile toggle */}
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
        <div className={`fixed lg:static z-20 top-14 lg:top-0 left-0 bottom-0 w-72 lg:w-56 bg-card-bg border-r border-card-border shrink-0 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {emailSidebar}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 border-b border-card-border flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-foreground">
              {view === 'board' ? 'Board' : currentFolderLabel}
            </h2>
            {view === 'inbox' && (
              <span className="text-xs text-muted">
                {sortedEmails.length} email{sortedEmails.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Content */}
          {view === 'inbox' ? inboxView : boardView}
        </div>
      </div>

      {/* Email detail modal */}
      {selectedEmail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedEmail(null)} />
          <div className="fixed inset-4 sm:inset-y-8 sm:left-[20%] sm:right-[5%] lg:left-[30%] lg:right-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-card-border">
            <div className="px-5 sm:px-6 py-4 border-b border-card-border flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Avatar name={selectedEmail.from} size="sm" />
                  <div>
                    <span className="text-sm font-medium text-foreground">{selectedEmail.from}</span>
                    <span className="text-xs text-muted ml-2">&lt;{selectedEmail.fromEmail}&gt;</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEmail(null)} className="text-muted hover:text-foreground p-1 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <div className="flex items-center gap-2 mb-4 text-xs text-muted flex-wrap">
                <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                <span>·</span>
                <span>To: {selectedEmail.to}</span>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>
            <div className="px-5 sm:px-6 py-3 border-t border-card-border flex items-center justify-between gap-2 shrink-0 flex-wrap">
              <div className="flex gap-1 flex-wrap">
                {kanbanColumns.map(col => (
                  <button
                    key={col.status}
                    onClick={() => moveEmail(selectedEmail.id, col.status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      selectedEmail.status === col.status
                        ? 'bg-accent text-white'
                        : 'bg-slate-100 text-muted hover:bg-slate-200'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover transition-colors">
                Reply
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
