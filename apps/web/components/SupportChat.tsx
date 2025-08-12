"use client";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Plus, CheckCircle, MessageCircle } from 'lucide-react';
import { useUser } from '@/components/UserProvider';

// Types minimalistes pour le chat support
interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}
interface SupportMessage {
  id: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export default function SupportChat() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Charger les tickets au montage
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await fetch("/api/support/tickets");
    const data = await res.json();
    setTickets(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    const res = await fetch("/api/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });
    if (res.ok) {
      setSubject("");
      setMessage("");
      setShowNew(false);
      fetchTickets();
    }
    setSending(false);
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelected(ticket);
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  const handleSendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !selected) return;
    setSending(true);
    const res = await fetch(`/api/support/tickets/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: msgInput }),
    });
    if (res.ok) {
      setMsgInput("");
      fetchTickets();
      // Refresh selected ticket
      const updated = await fetch(`/api/support/tickets`);
      const all = await updated.json();
      const found = all.find((t: SupportTicket) => t.id === selected.id);
      setSelected(found || null);
    }
    setSending(false);
  };

  const handleResolve = async () => {
    if (!selected || !user?.isAdmin) return;
    setResolving(true);
    
    try {
      console.log('🔍 Debug handleResolve - Admin resolving ticket:', selected.id);
      
      const res = await fetch(`/api/support/tickets/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      
      console.log('🔍 Debug handleResolve - Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Error resolving ticket:', errorData);
        alert(`Erreur lors de la résolution du ticket: ${errorData.error}`);
        return;
      }
      
      console.log('✅ Ticket resolved successfully by admin');
      await fetchTickets();
      setSelected(null);
    } catch (error) {
      console.error('❌ Error in handleResolve:', error);
      alert('Erreur lors de la résolution du ticket');
    } finally {
      setResolving(false);
    }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight });
    }
  }, [selected]);

  return (
    <div className="w-full max-w-2xl">
      {/* Liste des tickets ou chat */}
      {!selected ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold font-rajdhani text-opnskin-primary flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Mes tickets
            </h2>
            <Button onClick={() => setShowNew(!showNew)} variant="default" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouveau ticket
            </Button>
          </div>
          {showNew && (
            <Card className="mb-4 bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardContent className="py-4">
                <form onSubmit={handleNewTicket} className="space-y-3">
                  <Input
                    placeholder="Sujet du ticket"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    required
                  />
                  <Textarea
                    placeholder="Décrivez votre problème..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    rows={4}
                  />
                  <Button type="submit" disabled={sending} className="w-full">
                    {sending ? "Envoi..." : "Créer le ticket"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          {loading ? (
            <div className="text-center text-opnskin-text-secondary py-8">Chargement…</div>
          ) : tickets.length === 0 ? (
            <div className="text-center text-opnskin-text-secondary py-8">Aucun ticket pour l’instant.</div>
          ) : (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary cursor-pointer hover:border-opnskin-primary transition" onClick={() => openTicket(ticket)}>
                  <CardContent className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-bold text-opnskin-primary">{ticket.subject}</div>
                      <div className="text-xs text-opnskin-text-secondary">Créé le {new Date(ticket.createdAt).toLocaleString()}</div>
                    </div>
                    <Badge className={
                      ticket.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-500' :
                      ticket.status === 'RESOLVED' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-500'
                    }>
                      {ticket.status === 'OPEN' ? 'Ouvert' : ticket.status === 'RESOLVED' ? 'Résolu' : 'Fermé'}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <Button size="sm" variant="outline" onClick={() => setSelected(null)}>&larr; Retour</Button>
              <div className="font-bold text-opnskin-primary text-lg">{selected.subject}</div>
              <Badge className={
                selected.status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-500' :
                selected.status === 'RESOLVED' ? 'bg-green-500/20 text-green-500' :
                'bg-gray-500/20 text-gray-500'
              }>
                {selected.status === 'OPEN' ? 'Ouvert' : selected.status === 'RESOLVED' ? 'Résolu' : 'Fermé'}
              </Badge>
            </div>
            <div ref={chatRef} className="max-h-80 overflow-y-auto bg-opnskin-bg-secondary/40 rounded p-3 mb-3 space-y-2">
              {selected.messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-lg px-3 py-2 max-w-xs text-sm shadow ${msg.senderRole === 'USER' ? 'bg-opnskin-blue text-white dark:text-white' : 'bg-opnskin-bg-card text-opnskin-text-primary'}`}>
                    {msg.content}
                    <div className="text-xs text-right text-opnskin-text-secondary mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
            {selected.status === 'OPEN' && (
              <form onSubmit={handleSendMsg} className="flex gap-2 mt-2">
                <Input
                  placeholder="Votre message..."
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !msgInput.trim()} className="flex items-center gap-1">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
            {selected.status === 'OPEN' && user?.isAdmin && (
              <Button onClick={handleResolve} disabled={resolving} variant="outline" className="mt-3 w-full flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Marquer comme résolu (Admin)
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 