'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageSquare, ShieldCheck, Clock, CheckCircle, Car, Headphones, Award } from 'lucide-react';
import { chatService, ConversationThread, Message } from '@/services/chatService';
import { vehicleService } from '@/services/vehicleService';
import { hostService } from '@/services/hostService';
import { authService } from '@/services/authService';
import { bookingService } from '@/services/bookingService';
import { socketService } from '@/services/socketService';

export default function MessagesPage() {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number>(2);
  const [adminUser, setAdminUser] = useState<{ id: number; name: string; email: string }>({
    id: 1,
    name: 'System Support Admin',
    email: 'admin@vehicle.com'
  });

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
        // Fetch real admin user from database (role = ADMIN)
        const dbAdmin = await chatService.getAdminContact();
        setAdminUser(dbAdmin);

        const currentUser = authService.getUserFromStorage();
        const userRoles = currentUser?.roles || [];
        const isUserAdmin = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ADMIN');

        const dynamicAdminThread: ConversationThread = {
          id: `sys-admin-${dbAdmin.id}`,
          otherUserId: dbAdmin.id,
          otherUserName: dbAdmin.name || 'System Support Admin',
          otherUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          vehicleName: 'Platform Support & Assistance',
          lastMessage: 'Welcome to System Support! How can we assist you today?',
          lastMessageTime: 'Just now',
          unread: false
        };

        let paramHostId: string | null = null;
        let paramUserId: string | null = null;
        let paramBookingId: string | null = null;
        let paramVehicleId: string | null = null;
        let paramRole: string | null = null;

        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          paramHostId = searchParams.get('hostId');
          paramUserId = searchParams.get('userId') || searchParams.get('recipientId');
          paramBookingId = searchParams.get('bookingId');
          paramVehicleId = searchParams.get('vehicleId');
          paramRole = searchParams.get('role');
        }

        const isSpecificTripContact = Boolean(paramHostId || paramUserId || paramBookingId || paramVehicleId);

        if (!isSpecificTripContact) {
          // Scenario 1: General messages icon click -> Display ONLY contact with System Admin from DB
          setThreads([dynamicAdminThread]);
          setActiveThreadId(dynamicAdminThread.id);
        } else {
          // Scenario 2: Chat button related to a specific trip/booking/vehicle
          const isAdminView = isUserAdmin || paramRole === 'admin' || Boolean(paramHostId && paramUserId);

          if (isAdminView) {
            // ADMIN ROLE VIEW: Display BOTH Renter AND Host contacts for the selected trip!
            let renterName = 'Trip Guest Renter';
            let hostName = 'Vehicle Host Owner';
            let vehicleName = 'Booked Rental Vehicle';
            let renterId = paramUserId ? parseInt(paramUserId, 10) : 2;
            let hostId = paramHostId ? parseInt(paramHostId, 10) : 1;

            if (paramBookingId) {
              try {
                const myBookings = await bookingService.getMyBookings();
                const b = myBookings.find(item => item.id.toString() === paramBookingId);
                if (b) {
                  if (b.renterName) renterName = b.renterName;
                  if (b.hostName) hostName = b.hostName;
                  if (b.vehicleName) vehicleName = b.vehicleName;
                  if (b.userId) renterId = b.userId;
                  if (b.hostId) hostId = b.hostId;
                }
              } catch (err) {
                console.warn('Admin booking details lookup notice:', err);
              }
            }

            if (paramVehicleId && (!vehicleName || vehicleName === 'Booked Rental Vehicle')) {
              try {
                const v = await vehicleService.getVehicleById(parseInt(paramVehicleId, 10));
                if (v) {
                  vehicleName = `${v.make} ${v.model} (${v.year})`;
                  if (v.hostName && (!hostName || hostName === 'Vehicle Host Owner')) hostName = v.hostName;
                  if (v.hostId) hostId = v.hostId;
                }
              } catch {
                // fallback
              }
            }

            const targetBookingIdNum = paramBookingId ? parseInt(paramBookingId, 10) : undefined;

            const renterThread: ConversationThread = {
              id: `guest-${renterId}`,
              otherUserId: renterId,
              otherUserName: renterName,
              otherUserAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              vehicleName: vehicleName,
              bookingId: targetBookingIdNum,
              lastMessage: `Admin chat channel with trip renter ${renterName}.`,
              lastMessageTime: 'Just now',
              unread: false
            };

            const hostThread: ConversationThread = {
              id: `host-${hostId}`,
              otherUserId: hostId,
              otherUserName: hostName,
              otherUserAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
              vehicleName: vehicleName,
              bookingId: targetBookingIdNum,
              lastMessage: `Admin chat channel with vehicle owner ${hostName}.`,
              lastMessageTime: 'Just now',
              unread: false
            };

            setThreads([renterThread, hostThread, dynamicAdminThread]);
            setActiveThreadId(renterThread.id);

          } else if (paramUserId && !paramHostId) {
            // Clicked by HOST -> Contacting the GUEST / RENTER who booked the trip
            const targetGuestId = parseInt(paramUserId, 10);
            let recipientName = targetGuestId === 2 ? 'Alex Morgan' : `Guest Renter #${targetGuestId}`;
            let recipientVehicle = 'Booked Vehicle';

            if (paramBookingId) {
              try {
                const hostBookings = await bookingService.getHostBookings();
                const b = hostBookings.find(item => item.id.toString() === paramBookingId);
                if (b) {
                  if (b.renterName) recipientName = b.renterName;
                  if (b.vehicleName) recipientVehicle = b.vehicleName;
                }
              } catch {
                // fallback
              }
            }

            const guestThread: ConversationThread = {
              id: `guest-${targetGuestId}`,
              otherUserId: targetGuestId,
              otherUserName: recipientName,
              otherUserAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              vehicleName: recipientVehicle,
              bookingId: paramBookingId ? parseInt(paramBookingId, 10) : undefined,
              lastMessage: `Direct chat started with trip renter ${recipientName}.`,
              lastMessageTime: 'Just now',
              unread: false
            };

            let fetchedThreads: ConversationThread[] = [];
            try {
              fetchedThreads = await chatService.getMyThreads();
            } catch {
              // fallback
            }

            const existingIndex = fetchedThreads.findIndex(t => t.otherUserId === targetGuestId);
            if (existingIndex >= 0) {
              setThreads([fetchedThreads[existingIndex], dynamicAdminThread]);
              setActiveThreadId(fetchedThreads[existingIndex].id);
            } else {
              setThreads([guestThread, dynamicAdminThread]);
              setActiveThreadId(guestThread.id);
            }

          } else {
            // Clicked by RENTER / USER -> Contacting the HOST owner of this vehicle
            let recipientName = '';
            let recipientVehicle = '';

            if (paramBookingId) {
              try {
                const userBookings = await bookingService.getMyBookings();
                const b = userBookings.find(item => item.id.toString() === paramBookingId);
                if (b) {
                  if (b.hostName) recipientName = b.hostName;
                  if (b.vehicleName) recipientVehicle = b.vehicleName;
                  if (b.hostId && !paramHostId) paramHostId = b.hostId.toString();
                }
              } catch (err) {
                console.warn('Booking resolution notice:', err);
              }
            }

            if (paramVehicleId && (!recipientVehicle || recipientVehicle === 'Booked Rental Vehicle')) {
              try {
                const v = await vehicleService.getVehicleById(parseInt(paramVehicleId, 10));
                if (v) {
                  recipientVehicle = `${v.make} ${v.model} (${v.year})`;
                  if (v.hostId && !paramHostId) {
                    paramHostId = v.hostId.toString();
                  }
                  if (v.hostName && !recipientName) recipientName = v.hostName;
                }
              } catch (err) {
                console.warn('Vehicle details fetch notice:', err);
              }
            }

            if (paramHostId && (!recipientName || recipientName === 'Vehicle Host')) {
              try {
                const h = await hostService.getHostById(parseInt(paramHostId, 10));
                if (h && (h.firstName || h.lastName)) {
                  recipientName = `${h.firstName || ''} ${h.lastName || ''}`.trim();
                }
              } catch (err) {
                console.warn('Host details fetch notice:', err);
              }
            }

            const targetHostIdNum = paramHostId ? parseInt(paramHostId, 10) : 1;
            const targetBookingIdNum = paramBookingId ? parseInt(paramBookingId, 10) : undefined;
            const finalHostName = recipientName || (targetHostIdNum === 1 ? 'Executive Host' : `Vehicle Host #${targetHostIdNum}`);
            const finalVehicleName = recipientVehicle || 'Booked Rental Vehicle';

            const hostThread: ConversationThread = {
              id: `host-${targetHostIdNum}`,
              otherUserId: targetHostIdNum,
              otherUserName: finalHostName,
              otherUserAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
              vehicleName: finalVehicleName,
              bookingId: targetBookingIdNum,
              lastMessage: `Direct chat started with vehicle owner ${finalHostName}.`,
              lastMessageTime: 'Just now',
              unread: false
            };

            let fetchedThreads: ConversationThread[] = [];
            try {
              fetchedThreads = await chatService.getMyThreads();
            } catch {
              // fallback
            }

            const existingIndex = fetchedThreads.findIndex(t => t.otherUserId === targetHostIdNum);
            if (existingIndex >= 0) {
              setThreads([fetchedThreads[existingIndex], dynamicAdminThread]);
              setActiveThreadId(fetchedThreads[existingIndex].id);
            } else {
              setThreads([hostThread, dynamicAdminThread]);
              setActiveThreadId(hostThread.id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load message threads:', err);
        const fallbackAdminThread: ConversationThread = {
          id: 'sys-admin-1',
          otherUserId: 1,
          otherUserName: 'System Support Admin',
          otherUserAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          vehicleName: 'Platform Support & Assistance',
          lastMessage: 'Welcome to System Support! How can we assist you today?',
          lastMessageTime: 'Just now',
          unread: false
        };
        setThreads([fallbackAdminThread]);
        setActiveThreadId(fallbackAdminThread.id);
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
        if (activeThread.otherUserId === adminUser.id || activeThread.id.startsWith('sys-admin')) {
          setMessages([
            {
              id: 101,
              senderId: adminUser.id,
              receiverId: currentUserId,
              content: `Hello! I am ${adminUser.name}, your System Support Admin. How can I assist you with your account, vehicle rentals, or platform services today?`,
              isRead: true,
              timestamp: 'Just now'
            }
          ]);
          return;
        }

        const msgs = await chatService.getConversation(activeThread.otherUserId);
        if (msgs && msgs.length > 0) {
          setMessages(msgs);
        } else {
          const isGuestThread = activeThread.id.startsWith('guest-');
          setMessages([
            {
              id: 201,
              senderId: isGuestThread ? activeThread.otherUserId : currentUserId,
              receiverId: isGuestThread ? currentUserId : activeThread.otherUserId,
              content: isGuestThread
                ? `Hi host! Looking forward to picking up the ${activeThread.vehicleName || 'vehicle'}.`
                : `Hi ${activeThread.otherUserName}! I'm reaching out regarding your ${activeThread.vehicleName || 'vehicle'}.`,
              isRead: true,
              timestamp: '10:15 AM'
            },
            {
              id: 202,
              senderId: isGuestThread ? currentUserId : activeThread.otherUserId,
              receiverId: isGuestThread ? activeThread.otherUserId : currentUserId,
              content: 'Hello! Pick-up is ready. Please let me know if you have any questions before your rental starts!',
              isRead: true,
              timestamp: '10:20 AM'
            }
          ]);
        }
      } catch (err) {
        console.warn('Failed to load conversation:', err);
        if (activeThread.otherUserId === adminUser.id || activeThread.id.startsWith('sys-admin')) {
          setMessages([
            {
              id: 101,
              senderId: adminUser.id,
              receiverId: currentUserId,
              content: `Hello! I am ${adminUser.name}, your System Support Admin. How can I assist you with your account, vehicle rentals, or platform services today?`,
              isRead: true,
              timestamp: 'Just now'
            }
          ]);
        } else {
          setMessages([
            {
              id: 201,
              senderId: currentUserId,
              receiverId: activeThread.otherUserId,
              content: `Hi ${activeThread.otherUserName}! I'm reaching out regarding your ${activeThread.vehicleName || 'vehicle'}.`,
              isRead: true,
              timestamp: '10:15 AM'
            },
            {
              id: 202,
              senderId: activeThread.otherUserId,
              receiverId: currentUserId,
              content: 'Hello! Pick-up is ready. Please let me know if you have any questions before your rental starts!',
              isRead: true,
              timestamp: '10:20 AM'
            }
          ]);
        }
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
  }, [activeThreadId, activeThread?.otherUserId, currentUserId, adminUser.id, adminUser.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeThread) return;

    const text = inputContent.trim();
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
    setInputContent('');

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

    // Auto reply for System Admin if chatting with admin
    if (activeThread.otherUserId === adminUser.id || activeThread.id.startsWith('sys-admin')) {
      setTimeout(() => {
        const autoReply: Message = {
          id: Date.now() + 1,
          senderId: adminUser.id,
          receiverId: currentUserId,
          content: `Thank you for contacting System Support. ${adminUser.name} has received your inquiry and will follow up with you shortly.`,
          isRead: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, autoReply]);
        socketService.publishMessage(autoReply);
      }, 1000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="glass-card overflow-hidden grid grid-cols-1 md:grid-cols-3 border border-white/10 h-[650px] shadow-2xl">
        
        {/* Inbox Contacts Sidebar */}
        <div className="border-r border-white/10 p-4 bg-slate-950/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Messages & Support
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {threads.length} {threads.length === 1 ? 'Contact' : 'Contacts'}
              </span>
            </h2>

            {loading ? (
              <div className="space-y-2">
                {[1].map(n => <div key={n} className="h-16 glass-card animate-pulse rounded-xl"></div>)}
              </div>
            ) : threads.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No active messages.</p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto max-h-[460px] pr-1">
                {threads.map((t) => {
                  const isActive = activeThreadId === t.id;
                  const isAdmin = t.otherUserId === adminUser.id || t.id.startsWith('sys-admin');
                  const isGuest = t.id.startsWith('guest-');

                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveThreadId(t.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 border ${
                        isActive
                          ? 'bg-emerald-500/15 border-emerald-500/40 shadow-md ring-1 ring-emerald-500/20'
                          : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="relative">
                        <img src={t.otherUserAvatar} alt={t.otherUserName} className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10" />
                        {isAdmin && (
                          <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-black rounded-full">
                            <ShieldCheck className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                            {t.otherUserName}
                          </h4>
                          <span className="text-[10px] text-slate-400">{t.lastMessageTime}</span>
                        </div>
                        <p className="text-[11px] text-emerald-400 font-semibold truncate mt-0.5">
                          {isAdmin ? 'System Admin Support' : isGuest ? 'Booked Trip Renter' : (t.vehicleName || 'Rental Vehicle Owner')}
                        </p>
                        <p className="text-[11px] text-slate-300 truncate mt-0.5">{t.lastMessage}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Messages are encrypted & monitored for user safety</span>
          </div>
        </div>

        {/* Chat Conversation Thread */}
        <div className="md:col-span-2 flex flex-col justify-between bg-slate-950/50">
          
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={activeThread.otherUserAvatar} alt={activeThread.otherUserName} className="w-10 h-10 rounded-full object-cover border border-emerald-500/40" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {activeThread.otherUserName}
                      {(activeThread.otherUserId === adminUser.id || activeThread.id.startsWith('sys-admin')) ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> System Admin
                        </span>
                      ) : activeThread.id.startsWith('guest-') ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#F5B301]" /> Trip Renter Guest
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-[#F5B301] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                          <Car className="w-3 h-3" /> Fleet Host Owner
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400 font-medium">{activeThread.vehicleName}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> Monitored Support Channel
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Bubbles Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMe = m.senderId === currentUserId;

                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none font-medium'
                          : 'bg-slate-800 text-slate-100 border border-white/10 rounded-bl-none'
                      }`}>
                        <p>{m.content}</p>
                        <span className={`text-[9px] mt-1 block text-right font-medium ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Input Form */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/10 flex gap-2 bg-slate-950/80 items-center">
                <input
                  type="text"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={
                    (activeThread.otherUserId === adminUser.id || activeThread.id.startsWith('sys-admin'))
                      ? `Type your message to ${activeThread.otherUserName} (System Support Admin)...`
                      : `Type your message to ${activeThread.otherUserName}...`
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <button type="submit" className="btn-primary px-5 py-3 text-xs flex items-center gap-2 font-bold shrink-0 shadow-lg">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs p-6">
              <MessageSquare className="w-10 h-10 text-slate-600 mb-2" />
              <p className="font-bold text-white text-sm mb-1">No Active Conversation Selected</p>
              <p>Select a contact from the left list to view messages.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
