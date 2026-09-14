'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, Car, Calendar, Phone, CheckCircle2 } from 'lucide-react';

interface ChatThread {
  id: string;
  renterName: string;
  renterAvatar: string;
  vehicleName: string;
  tripDates: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

interface ChatMessage {
  id: number;
  sender: 'host' | 'guest';
  text: string;
  time: string;
}

export default function HostMessagesPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Messaging threads API is not implemented on the backend.
    // This page will display live data once the endpoint is available.
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages([
      ...messages,
      { id: Date.now(), sender: 'host' as const, text: inputMessage, time: 'Just now' }
    ]);
    setInputMessage('');
  };

  return (
    <div className="glass-card border border-white/10 rounded-2xl overflow-hidden h-[620px] flex flex-col md:flex-row">

      {/* Threads Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/60 p-4 space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">Renter Conversations</h3>

        {threads.length === 0 ? (
          <p className="text-xs text-slate-400">No conversations yet.</p>
        ) : (
          <div className="space-y-1 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                  activeThreadId === t.id
                    ? 'bg-[#F5B301]/10 border-amber-500/30'
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <img src={t.renterAvatar} alt={t.renterName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white truncate">{t.renterName}</h4>
                    <span className="text-[10px] text-slate-500">{t.lastMessageTime}</span>
                  </div>
                  <p className="text-[11px] text-amber-400 font-medium truncate">{t.vehicleName}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Conversation Area */}
      <div className="flex-1 flex flex-col justify-between bg-slate-900/40">

        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <img src={activeThread.renterAvatar} alt={activeThread.renterName} className="w-10 h-10 rounded-full object-cover border border-amber-500/30" />
                <div>
                  <h3 className="text-sm font-bold text-white">{activeThread.renterName}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{activeThread.vehicleName}</span>
                    <span>• {activeThread.tripDates}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'host' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                      m.sender === 'host'
                        ? 'bg-[#F5B301] text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-white/10 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-slate-950/60 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message to renter..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button type="submit" className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 shrink-0">
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Select a conversation to start messaging
          </div>
        )}
      </div>

    </div>
  );
}
