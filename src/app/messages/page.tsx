'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { chatService, Message } from '@/services/chatService';
import { authService } from '@/services/authService';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [otherUserId] = useState(2);
  const [currentUserId] = useState<number | null>(() => {
    const user = authService.getUserFromStorage();
    return user ? user.id : null;
  });

  useEffect(() => {
    const loadConversation = async () => {
      try {
        const msgs = await chatService.getConversation(otherUserId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load conversation:', err);
        setMessages([]);
      }
    };
    loadConversation();
  }, [otherUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const newMsg: Message = {
      id: Date.now(),
      senderId: currentUserId ?? 1,
      receiverId: otherUserId,
      content: inputContent,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    const text = inputContent;
    setInputContent('');

    try {
      await chatService.sendMessage(otherUserId, text);
    } catch (err) {
      // Message cached locally
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="glass-card overflow-hidden grid grid-cols-1 md:grid-cols-3 border border-white/10 h-[650px]">
        
        {/* Inbox Contacts Sidebar */}
        <div className="border-r border-white/10 p-4 bg-black/20 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Host Messages
            </h2>

            <div className="space-y-2">
              <p className="text-xs text-slate-400">Select a conversation to view messages.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Messages are monitored for user safety</span>
          </div>
        </div>

        {/* Chat Conversation Thread */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 bg-slate-950/50">
          
          {/* Thread Header */}
          <div className="pb-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xs">
                M
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Conversation</h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Messages are end-to-end monitored</span>
              </div>
            </div>
          </div>

          {/* Message Bubbles Container */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
            {messages.map((m) => {
              const isMe = m.senderId === currentUserId;

              return (
                <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-2xl text-xs shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-none'
                  }`}>
                    <p>{m.content}</p>
                    <span className={`text-[9px] mt-1 block text-right ${isMe ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Send Input Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Type your message to host..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="btn-primary px-4 py-2.5 text-xs flex items-center gap-1.5">
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
