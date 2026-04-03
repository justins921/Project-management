'use client';

import { useState } from 'react';
import { emails, getTeamMember, getClient } from '@/lib/data';
import { Email, EmailStatus } from '@/lib/types';
import Avatar from '@/components/Avatar';

const columns: { status: EmailStatus; label: string; color: string }[] = [
  { status: 'inbox', label: 'Inbox', color: 'bg-blue-500' },
  { status: 'in-progress', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'waiting', label: 'Waiting', color: 'bg-violet-500' },
  { status: 'done', label: 'Done', color: 'bg-emerald-500' },
];

export default function EmailPage() {
  const [emailList, setEmailList] = useState<Email[]>(emails);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [dragOver, setDragOver] = useState<EmailStatus | null>(null);

  function moveEmail(emailId: string, newStatus: EmailStatus) {
    setEmailList(prev =>
      prev.map(e => e.id === emailId ? { ...e, status: newStatus } : e)
    );
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(prev => prev ? { ...prev, status: newStatus } : null);
    }
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

  const kanbanView = (
    <div className="flex gap-4 overflow-x-auto pb-4 px-1 min-h-[500px]">
      {columns.map(col => {
        const colEmails = emailList
          .filter(e => e.status === col.status)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return (
          <div
            key={col.status}
            className={`flex-1 min-w-[280px] max-w-[360px] flex flex-col rounded-xl transition-colors ${
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
            {/* Column header */}
            <div className="px-3 py-3 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
              <span className="text-sm font-semibold text-foreground">{col.label}</span>
              <span className="text-xs text-muted bg-white rounded-full px-1.5 py-0.5 border border-card-border">
                {colEmails.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 px-2 pb-2 space-y-2">
              {colEmails.map(email => {
                const assignee = email.assigneeId ? getTeamMember(email.assigneeId) : null;
                const client = email.clientId ? getClient(email.clientId) : null;
                return (
                  <div
                    key={email.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('emailId', email.id)}
                    onClick={() => setSelectedEmail(email)}
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
                <div className="text-center py-8 text-xs text-muted">
                  No emails
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const listView = (
    <div className="bg-card-bg rounded-xl border border-card-border shadow-sm overflow-hidden">
      <div className="divide-y divide-card-border/50">
        {emailList
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map(email => {
            const assignee = email.assigneeId ? getTeamMember(email.assigneeId) : null;
            const colInfo = columns.find(c => c.status === email.status);
            return (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 cursor-pointer hover:bg-slate-50/50 transition-colors ${
                  !email.isRead ? 'bg-accent/5' : ''
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${colInfo?.color || 'bg-slate-400'}`} />
                <Avatar name={email.from} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${!email.isRead ? 'font-semibold' : 'font-medium'} text-foreground`}>
                      {email.from}
                    </span>
                    <span className="text-xs text-muted shrink-0 hidden sm:inline">{formatDate(email.timestamp)}</span>
                  </div>
                  <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-foreground' : 'text-muted'}`}>
                    {email.subject}
                  </p>
                </div>
                <span className="text-xs text-muted shrink-0 sm:hidden">{formatDate(email.timestamp)}</span>
                {assignee && <div className="hidden sm:block"><Avatar name={assignee.name} size="sm" /></div>}
              </div>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Email</h1>
          <p className="text-sm text-muted mt-1">
            {emailList.filter(e => !e.isRead).length} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === 'kanban' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === 'list' ? 'bg-white text-foreground shadow-sm' : 'text-muted'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' ? kanbanView : listView}

      {/* Email detail modal */}
      {selectedEmail && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedEmail(null)} />
          <div className="fixed inset-4 sm:inset-y-8 sm:left-[20%] sm:right-[5%] lg:left-[30%] lg:right-[10%] z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-card-border">
            {/* Modal header */}
            <div className="px-5 sm:px-6 py-4 border-b border-card-border flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-2 mt-1">
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
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              <div className="flex items-center gap-2 mb-4 text-xs text-muted">
                <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                <span>·</span>
                <span>To: {selectedEmail.to}</span>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/90 whitespace-pre-line leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>
            {/* Modal actions */}
            <div className="px-5 sm:px-6 py-3 border-t border-card-border flex items-center justify-between shrink-0">
              <div className="flex gap-1 flex-wrap">
                {columns.map(col => (
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
    </div>
  );
}
