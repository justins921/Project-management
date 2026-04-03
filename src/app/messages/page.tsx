'use client';

import { useState } from 'react';
import { channels as initialChannels, directMessages as initialDms, messages as initialMessages, teamMembers, getTeamMember, getMessagesByChannel, getMessagesByDm } from '@/lib/data';
import { Channel, DirectMessage, Message } from '@/lib/types';
import Avatar from '@/components/Avatar';

type ActiveView = { type: 'channel'; id: string } | { type: 'dm'; id: string };

export default function MessagesPage() {
  const [channelList, setChannelList] = useState<Channel[]>(initialChannels);
  const [dmList, setDmList] = useState<DirectMessage[]>(initialDms);
  const [messageList, setMessageList] = useState<Message[]>(initialMessages);
  const [active, setActive] = useState<ActiveView>({ type: 'channel', id: 'ch-1' });
  const [newMessage, setNewMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showNewDm, setShowNewDm] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);
  const [newChannelMembers, setNewChannelMembers] = useState<string[]>([]);

  const currentUserId = 'tm-5';

  // Get messages — combine seed + new messages
  const currentMessages = active.type === 'channel'
    ? [
        ...getMessagesByChannel(active.id),
        ...messageList.filter(m => m.channelId === active.id && !initialMessages.find(im => im.id === m.id)),
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [
        ...getMessagesByDm(active.id),
        ...messageList.filter(m => m.dmId === active.id && !initialMessages.find(im => im.id === m.id)),
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const activeChannel = active.type === 'channel'
    ? channelList.find(c => c.id === active.id)
    : null;

  const activeDm = active.type === 'dm'
    ? dmList.find(d => d.id === active.id)
    : null;

  const dmPartner = activeDm
    ? getTeamMember(activeDm.participantIds.find(id => id !== currentUserId) || '')
    : null;

  const headerTitle = activeChannel ? `# ${activeChannel.name}` : dmPartner?.name || 'Messages';
  const headerSub = activeChannel?.description || dmPartner?.role || '';

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function sendMessage() {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      ...(active.type === 'channel' ? { channelId: active.id } : { dmId: active.id }),
      senderId: currentUserId,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessageList(prev => [...prev, msg]);
    setNewMessage('');
  }

  function createChannel() {
    if (!newChannelName.trim()) return;
    const slug = newChannelName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const newChannel: Channel = {
      id: `ch-${Date.now()}`,
      name: slug,
      description: newChannelDesc.trim() || undefined,
      isPrivate: newChannelPrivate,
      memberIds: [currentUserId, ...newChannelMembers],
    };
    setChannelList(prev => [...prev, newChannel]);
    setActive({ type: 'channel', id: newChannel.id });
    setShowCreateChannel(false);
    setNewChannelName('');
    setNewChannelDesc('');
    setNewChannelPrivate(false);
    setNewChannelMembers([]);
  }

  function startDm(memberId: string) {
    // Check if DM already exists
    const existing = dmList.find(dm =>
      dm.participantIds.includes(currentUserId) && dm.participantIds.includes(memberId)
    );
    if (existing) {
      setActive({ type: 'dm', id: existing.id });
    } else {
      const newDm: DirectMessage = {
        id: `dm-${Date.now()}`,
        participantIds: [currentUserId, memberId],
      };
      setDmList(prev => [...prev, newDm]);
      setActive({ type: 'dm', id: newDm.id });
    }
    setShowNewDm(false);
    setSidebarOpen(false);
  }

  function toggleMember(memberId: string) {
    setNewChannelMembers(prev =>
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  }

  const channelSidebar = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 pt-2 pb-1 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">Channels</p>
          <button
            onClick={() => setShowCreateChannel(true)}
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors p-0.5 rounded"
            title="Create channel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {channelList.map(ch => {
          const isActive = active.type === 'channel' && active.id === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => { setActive({ type: 'channel', id: ch.id }); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold'
                  : 'text-[var(--foreground)] hover:bg-slate-100'
              }`}
            >
              <span className="text-[var(--muted)] mr-1">{ch.isPrivate ? '🔒' : '#'}</span>
              {ch.name}
            </button>
          );
        })}

        <div className="px-2 pt-4 pb-1 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-widest">Direct Messages</p>
          <button
            onClick={() => setShowNewDm(true)}
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors p-0.5 rounded"
            title="New direct message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {dmList.map(dm => {
          const partner = getTeamMember(dm.participantIds.find(id => id !== currentUserId) || '');
          if (!partner) return null;
          const isActive = active.type === 'dm' && active.id === dm.id;
          return (
            <button
              key={dm.id}
              onClick={() => { setActive({ type: 'dm', id: dm.id }); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5 ${
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold'
                  : 'text-[var(--foreground)] hover:bg-slate-100'
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
    <>
      <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-2rem)] -m-4 sm:-m-6 lg:-m-8 bg-[var(--card-bg)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        {/* Mobile channel toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-20 bg-[var(--accent)] text-white p-3 rounded-full shadow-lg hover:bg-[var(--accent)]/90 transition-colors"
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
        <div className={`fixed lg:static z-20 top-14 lg:top-0 left-0 bottom-0 w-72 lg:w-64 bg-[var(--card-bg)] border-r border-[var(--border)] shrink-0 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {channelSidebar}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="px-4 sm:px-6 py-3 border-b border-[var(--border)] flex items-center gap-3 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 -ml-1 rounded-lg hover:bg-[var(--muted)]/20 transition-colors"
            >
              <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            {activeDm && dmPartner && (
              <Avatar name={dmPartner.name} size="md" />
            )}
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-[var(--foreground)] truncate">{headerTitle}</h3>
              {headerSub && <p className="text-xs text-[var(--muted)] truncate">{headerSub}</p>}
            </div>
            {activeChannel && (
              <div className="ml-auto flex items-center gap-1 text-xs text-[var(--muted)] shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {activeChannel.memberIds.length}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            {currentMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--muted)]">
                <svg className="w-12 h-12 mb-3 text-[var(--muted)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation!</p>
              </div>
            )}
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
                        <span className="text-sm font-semibold text-[var(--foreground)]">{sender?.name}</span>
                        <span className="text-[10px] text-[var(--muted)]">{formatTime(msg.timestamp)}</span>
                      </div>
                    )}
                    <p className="text-sm text-[var(--foreground)]/90 leading-relaxed break-words">{msg.content}</p>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {msg.reactions.map((r, ri) => (
                          <span
                            key={ri}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs border border-[var(--border)] hover:bg-slate-200 cursor-pointer transition-colors"
                          >
                            {r.emoji} <span className="text-[var(--muted)]">{r.userIds.length}</span>
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
          <div className="px-4 sm:px-6 py-3 border-t border-[var(--border)] shrink-0">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${activeChannel ? '#' + activeChannel.name : dmPartner?.name || ''}...`}
                  className="w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessage();
                    }
                  }}
                />
              </div>
              <button
                className="p-2.5 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent)]/90 transition-colors shrink-0"
                onClick={sendMessage}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreateChannel(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Create Channel</h2>
              <button onClick={() => setShowCreateChannel(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Channel name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">#</span>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g., project-updates"
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') createChannel(); }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description <span className="text-[var(--muted)] font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="What's this channel about?"
                  className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setNewChannelPrivate(!newChannelPrivate)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${newChannelPrivate ? 'bg-[var(--accent)]' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${newChannelPrivate ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Private channel</p>
                  <p className="text-xs text-[var(--muted)]">Only invited members can see this channel</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Add members</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                  {teamMembers.filter(m => m.id !== currentUserId).map(member => {
                    const selected = newChannelMembers.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() => toggleMember(member.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                          selected ? 'bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/30' : 'hover:bg-slate-50 border border-[var(--border)]'
                        }`}
                      >
                        <Avatar name={member.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--foreground)] truncate">{member.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[var(--border)] flex justify-end gap-2">
              <button onClick={() => setShowCreateChannel(false)} className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannelName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Channel
              </button>
            </div>
          </div>
        </>
      )}

      {/* New DM Modal */}
      {showNewDm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowNewDm(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--foreground)]">New Message</h2>
              <button onClick={() => setShowNewDm(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-[var(--muted)] mb-3 px-2">Select a team member to message</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {teamMembers.filter(m => m.id !== currentUserId).map(member => {
                  const existingDm = dmList.find(dm =>
                    dm.participantIds.includes(currentUserId) && dm.participantIds.includes(member.id)
                  );
                  return (
                    <button
                      key={member.id}
                      onClick={() => startDm(member.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-slate-50 transition-colors"
                    >
                      <Avatar name={member.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)]">{member.name}</p>
                        <p className="text-xs text-[var(--muted)]">{member.role}</p>
                      </div>
                      {existingDm && (
                        <span className="text-[10px] text-[var(--muted)] bg-slate-100 px-2 py-0.5 rounded-full">Active</span>
                      )}
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
