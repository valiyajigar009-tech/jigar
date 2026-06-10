"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Trash2, Search } from "lucide-react";
import { Button } from "@/components/admin/ui/Button";
import { Input } from "@/components/admin/ui/Input";
import { toggleMessageRead, deleteMessage } from "@/lib/actions/message";

export function MessagesClient({ initialMessages }: { initialMessages: any[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState<string | null>(initialMessages.length > 0 ? initialMessages[0].id : null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMessage = messages.find(m => m.id === selectedId);

  const handleSelectMessage = async (msg: any) => {
    setSelectedId(msg.id);
    if (!msg.isRead) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      await toggleMessageRead(msg.id, true);
      router.refresh();
    }
  };

  const handleToggleUnread = async () => {
    if (!selectedMessage) return;
    setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, isRead: false } : m));
    await toggleMessageRead(selectedMessage.id, false);
    setSelectedId(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    if (confirm("Are you sure you want to delete this message?")) {
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      await deleteMessage(selectedMessage.id);
      setSelectedId(null);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-[600px]">
      {/* Inbox List */}
      <div className="w-full md:w-1/3 flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <Input 
              className="pl-10 w-full bg-slate-950/50 border-slate-800" 
              placeholder="Search messages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-slate-500 py-10 text-sm">No messages found.</div>
          ) : (
            filteredMessages.map(msg => (
              <div 
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`p-3 rounded-lg cursor-pointer transition-colors border-l-2 ${selectedId === msg.id ? 'bg-slate-800/80 border-indigo-500' : 'bg-transparent hover:bg-slate-800/50 border-transparent'} ${!msg.isRead && selectedId !== msg.id ? 'bg-slate-800/30 border-indigo-500/50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${msg.isRead ? 'font-medium text-slate-300' : 'font-bold text-white'}`}>{msg.name}</h4>
                  <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-400 truncate font-medium">{msg.subject}</p>
                <p className="text-xs text-slate-500 truncate mt-1">{msg.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Viewer */}
      <div className="w-full md:w-2/3 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col hidden md:flex">
        {selectedMessage ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    {selectedMessage.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{selectedMessage.name}</div>
                    <div className="text-xs text-slate-400">{selectedMessage.email}</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {selectedMessage.message}
              </p>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/80">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleToggleUnread}>
                <MailOpen size={14} /> Mark Unread
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 border-red-400/20" onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </Button>
              <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}>
                <Button size="sm" type="button">
                  Reply via Email
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Mail size={48} className="mb-4 text-slate-600" />
            <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
