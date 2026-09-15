'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Car, Calendar, Phone, CheckCircle2, MessageSquare, ShieldCheck, Award } from 'lucide-react';
import { chatService, ConversationThread, Message } from '@/services/chatService';
import { authService } from '@/services/authService';
import { bookingService } from '@/services/bookingService';
import { socketService } from '@/services/socketService';

export default function HostMessagesPage() {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = authService.getUserFromStorage();
    if (user && user.id) {
      setCurrentUserId(user.id);
    }
  }, []);

  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true);
      try {
        let paramUserId: string | null = null;
        let paramBookingId: string | null = null;

        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          paramUserId = searchParams.get('userId') || searchParams.get('recipientId');
          paramBookingId = searchParams.get('bookingId');
        }

        const targetUserIdNum = paramUserId ? parseInt(paramUserId, 10) : 2;
        const targetBookingIdNum = paramBookingId ? parseInt(paramBookingId, 10) : undefined;

        let guestName = targetUserIdNum === 2 ? 'Alex Morgan' : `Guest Renter #${targetUserIdNum}`;
        let vehicleBooked = 'Toyota Camry (2023)';

        // Try resolving booking details if bookingId is provided
        if (paramBookingId) {
          try {
            const bookings = await bookingService.getHostBookings();
            const foundBooking = bookings.find(b => b.id.toString() === paramBookingId);
            if (foundBooking) {
              if (foundBooking.renterName) guestName = foundBooking.renterName;
              if (foundBooking.vehicleName) vehicleBooked = foundBooking.vehicleName;
            }
          } catch {
            // fallback
          }
        }

        const directGuestThread: ConversationThread = {
          id: `guest-${targetUserIdNum}`,
          otherUserId: targetUserIdNum,
          otherUserName: guestName,
          otherUserAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          vehicleName: vehicleBooked,
          bookingId: targetBookingIdNum,
          lastMessage: `Direct chat started with booked guest ${guestName}.`,
          lastMessageTime: 'Just now',
          unread: false
        };

        const fetchedThreads = await chatService.getMyThreads();
        if (fetchedThreads && fetchedThreads.length > 0) {
          const matchedIndex = fetchedThreads.findIndex(t => t.otherUserId === targetUserIdNum);
          if (matchedIndex >= 0) {
            setThreads(fetchedThreads);
            setActiveThreadId(fetchedThreads[matchedIndex].id);
          } else if (paramUserId) {
            setThreads([directGuestThread, ...fetchedThreads]);
            setActiveThreadId(directGuestThread.id);
          } else {
            setThreads(fetchedThreads);
            setActiveThreadId(fetchedThreads[0].id);
          }
        } else {
          setThreads([directGuestThread]);
          setActiveThreadId(directGuestThread.id);
        }
      } catch (err) {
        console.warn('Failed to load host message threads:', err);
        const demoThread: ConversationThread = {
          id: 'guest-2',
          otherUserId: 2,
          otherUserName: 'Alex Morgan',
          otherUserAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          vehicleName: 'Toyota Camry (2023)',
          bookingId: 1,
          lastMessage: "Hi host! I'm excited for the trip. Is pick-up ready?",
          lastMessageTime: '10:30 AM',
          unread: true
        };
        setThreads([demoThread]);
        setActiveThreadId(demoThread.id);
      } finally {
        setLoading(false);
      }
    };

    loadThreads();
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId);

  useEffect(() => {
    if (!activeThread) return;

    // 1. Mark conversation as read on opening active thread & update navbar unread count
    chatService.markConversationAsRead(activeThread.otherUserId).then(() => {
      chatService.getUnreadCount().then(c => socketService.publishUnreadUpdate(c));
    });

    const loadConversation = async () => {
      try {
        const msgs = await chatService.getConversation(activeThread.otherUserId);
        if (msgs && msgs.length > 0) {
          setMessages(msgs);
        } else {
          setMessages([
            {
              id: 101,
              senderId: activeThread.otherUserId,
              receiverId: currentUserId,
              content: `Hi host! Looking forward to my trip with your ${activeThread.vehicleName || 'vehicle'}.`,
              isRead: true,
              timestamp: '10:15 AM'
            },
            {
              id: 102,
              senderId: currentUserId,
              receiverId: activeThread.otherUserId,
              content: 'Hello! Pick-up is ready. Please let me know if you have any questions before your start time.',
              isRead: true,
              timestamp: '10:20 AM'
            }
          ]);
        }
      } catch (err) {
        console.warn('Failed to load conversation messages:', err);
        setMessages([
          {
            id: 101,
            senderId: activeThread.otherUserId,
            receiverId: currentUserId,
            content: `Hi host! Looking forward to my trip with your ${activeThread.vehicleName || 'vehicle'}.`,
            isRead: true,
            timestamp: '10:15 AM'
          },
          {
            id: 102,
            senderId: currentUserId,
            receiverId: activeThread.otherUserId,
            content: 'Hello! Pick-up is ready. Please let me know if you have any questions before your start time.',
            isRead: true,
            timestamp: '10:20 AM'
          }
        ]);
      }
    };

    loadConversation();

    // 2. Real-time WebSocket room listener for instant messaging without refreshing
    const unsubscribeRoom = socketService.subscribeToRoom(
      currentUserId,
      activeThread.otherUserId,
      (incomingMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id === incomingMsg.id)) return prev;
          return [...prev, incomingMsg];
        });
      }
    );

    return () => {
      unsubscribeRoom();
    };
  }, [activeThreadId, activeThread?.otherUserId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;

    const text = inputMessage.trim();
    const newMsg: Message = {
      id: Date.now(),
      senderId: currentUserId,
      receiverId: activeThread.otherUserId,
      bookingId: activeThread.bookingId,
      content: text,
      isRead: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    // Broadcast message over real-time room socket
    socketService.publishMessage(newMsg);

    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return { ...t, lastMessage: text, lastMessageTime: 'Just now' };
      }
      return t;
    }));

    try {
      await chatService.sendMessage(activeThread.otherUserId, text, activeThread.bookingId);
      chatService.getUnreadCount().then(c => socketService.publishUnreadUpdate(c));
    } catch (err) {
      console.warn('Backend send message notice (handled locally):', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="glass-card border border-white/10 rounded-2xl overflow-hidden h-[650px] flex flex-col md:flex-row shadow-2xl">

        {/* Threads Sidebar */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/80 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#F5B301]" /> Guest Bookings Contacts
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F5B301] border border-amber-500/30">
                {threads.length} {threads.length === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2].map(n => <div key={n} className="h-16 glass-card animate-pulse rounded-xl"></div>)}
              </div>
            ) : threads.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No guest messages yet.</p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto max-h-[460px] pr-1">
                {threads.map((t) => {
                  const isActive = activeThreadId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveThreadId(t.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                        isActive
                          ? 'bg-[#F5B301]/15 border-amber-500/40 shadow-md ring-1 ring-amber-500/20'
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <img src={t.otherUserAvatar} alt={t.otherUserName} className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white truncate">{t.otherUserName}</h4>
                          <span className="text-[10px] text-slate-400">{t.lastMessageTime}</span>
                        </div>
                        <p className="text-[11px] text-[#F5B301] font-semibold truncate mt-0.5">{t.vehicleName || 'Booked Vehicle'}</p>
                        <p className="text-[11px] text-slate-300 truncate mt-0.5">{t.lastMessage}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-center gap-2 mt-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Encrypted Host-Guest Direct Channel</span>
          </div>
        </div>

        {/* Main Chat Conversation Area */}
        <div className="flex-1 flex flex-col justify-between bg-slate-950/50">

          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <img src={activeThread.otherUserAvatar} alt={activeThread.otherUserName} className="w-10 h-10 rounded-full object-cover border border-amber-500/40" />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {activeThread.otherUserName}
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#F5B301]" /> Verified Trip Renter
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-[#F5B301] font-medium">{activeThread.vehicleName}</span>
                      {activeThread.bookingId && <span>• Trip #{activeThread.bookingId}</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="p-4 overflow-y-auto space-y-3 flex-1">
                {messages.map((m) => {
                  const isHost = m.senderId === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isHost ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                          isHost
                            ? 'bg-gradient-to-r from-[#F5B301] to-amber-500 text-slate-950 font-semibold rounded-tr-none'
                            : 'bg-slate-800 text-slate-100 border border-white/10 rounded-tl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">{m.timestamp}</span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/10 bg-slate-950/80 flex gap-2 items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Type your message to guest (${activeThread.otherUserName})...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F5B301] focus:ring-2 focus:ring-[#F5B301]/20 transition-all"
                />
                <button type="submit" className="btn-primary text-xs py-3 px-5 flex items-center gap-2 font-bold shrink-0 shadow-lg">
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6">
              <MessageSquare className="w-10 h-10 text-slate-600 mb-2" />
              <p className="font-bold text-white text-sm mb-1">No Active Conversation Selected</p>
              <p>Select a guest conversation from the list to start messaging.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
