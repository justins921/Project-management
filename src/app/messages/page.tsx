'use client';

import { useState } from 'react';
import { channels, directMessages, messages, teamMembers, getTeamMember, getMessagesByChannel, getMessagesByDm } from '@/lib/data';
import Avatar from '@/components/Avatar';

type ActiveView = { type: 'channel'; id: string } | { type: 'dm'; id: string };

export default function MessagesPage() {
  const [active, setActive] = useState<ActiveView>({ type: 'channel', id: 'ch-1' });
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentMessages = active.type === 'channel'
    ? getMessagesByChannel(active.id)
    : getMessagesByDm(active.id);

  const activeChannel = active.type === 'channel'
    ? channels.find(c => c.id === active.id)
    : null;

  const activeDm = active.type === 'dm'
    ? directMessages.find(d => d.id === active.id)
    : null;

  // For DMs, get the other participant (assuming current user is tm-5 / Lisa)
  const currentUserId = 'tm-5';
  const dmPartner = activeDm
    ? getTeamMember(activeDm.participantIds.find(id => id !== currentUserId) || '')
    : null;

  const headerTitle = activeChannel ? `# ${activeChannel.name}` : dmPartner?.name || 'Messages';
  const headerSub = activeChannel?.description || dmPartner?.role || '';

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  const channelList = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-card-border">
        <h2 className="text-lg font-bold text-foreground">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 pt-2 pb-1">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Channels</p>
        </div>
        {channels.map(ch => {
          const isActive = active.type === 'channel' && active.id === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => { setActive({ type: 'channel', id: ch.id }); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-foreground hover:bg-slate-100'
              }`}
            >
              <span className="text-muted mr-1">{ch.isPrivate ? '🔒' : '#'}</span>
              {ch.name}
            </button>
          );
        })}

        <div className="px-2 pt-4 pb-1">
          <p className="text-[10px] font-semibold text-muted uppercase tracking-widest">Direct Messages</p>
        </div>
        {directMessages.map(dm => {
          const partner = getTeamMember(dm.participantIds.find(id => id !== currentUserId) || '');
          if (!partner) return null;
          const isActive = active.type === 'dm' && active.id === dm.id;
          return (
            <button
              key={dm.id}
              onClick={() => { setActive({ type: 'dm', id: dm.id }); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                isActive
                  ? 'bg-accent/10 text-accent font-semibold'
                  : 'text-foreground hover:bg-slate-100'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              {partner.name}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-2rem)] -m-4 sm:-m-6 lg:-m-8 bg-card-bg rounded-xl border border-card-border shadow-sm overflow-hidden">
      {/* Mobile channel toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-accent text-white p-3 rounded-full shadow-lg hover:bg-accent-hover transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-black/30" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Channel sidebar */}
      <div className={`fixed lg:static z-20 top-14 lg:top-0 left-0 bottom-0 w-72 lg:w-64 bg-card-bg border-r border-card-border shrink-0 transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {channelList}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="px-4 sm:px-6 py-3 border-b border-card-border flex items-center gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">{headerTitle}</h3>
            {headerSub && <p className="text-xs text-muted truncate">{headerSub}</p>}
          </div>
          {activeChannel && (
            <div className="ml-auto flex items-center gap-1 text-xs text-muted shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {activeChannel.memberIds.length}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {currentMessages.map((msg, i) => {
            const sender = getTeamMember(msg.senderId);
            const showAvatar = i === 0 || currentMessages[i - 1].senderId !== msg.senderId;

            return (
              <div key={msg.id} className={`flex gap-3 ${!showAvatar ? 'pl-12' : ''}`}>
                {showAvatar && (
                  <Avatar name={sender?.name || '?'} size="md" />
                )}
                <div className="flex-1 min-w-0">
                  {showAvatar && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{sender?.name}</span>
                      <span className="text-[10px] text-muted">{formatTime(msg.timestamp)}</span>
                    </div>
                  )}
                  <p className="text-sm text-foreground/90 leading-relaxed break-words">{msg.content}</p>
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {msg.reactions.map((r, ri) => (
                        <span
                          key={ri}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs border border-card-border hover:bg-slate-200 cursor-pointer transition-colors"
                        >
                          {r.emoji} <span className="text-muted">{r.userIds.length}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message input */}
        <div className="px-4 sm:px-6 py-3 border-t border-card-border shrink-0">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message ${headerTitle}...`}
                className="w-full px-4 py-2.5 text-sm border border-card-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMessage.trim()) {
                    setNewMessage('');
                  }
                }}
              />
            </div>
            <button
              className="p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors shrink-0"
              onClick={() => { if (newMessage.trim()) setNewMessage(''); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
