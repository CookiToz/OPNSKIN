"use client";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, CheckCircle, MessageCircle } from 'lucide-react';
import { useUser } from "@/components/UserProvider";
import { useRouter } from "next/navigation";

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name?: string; steamId: string };
  messages: SupportMessage[];
}
interface SupportMessage {
  id: string;
  senderRole: string;
  content: string;
  createdAt: string;
  sender: { id: string; name?: string; steamId: string };
}

export default function AdminSupportPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.replace("/"); // Redirige si pas admin
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const res = await fetch("/api/support/admin/tickets");
    const data = await res.json();
    setTickets(Array.isArray(data) ? data : []);
    setLoading(false);
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
      body: JSON.stringify({ content: msgInput, senderRole: "ADMIN" }),
    });
    if (res.ok) {
      setMsgInput("");
      fetchTickets();
      // Refresh selected ticket
      const updated = await fetch(`/api/support/admin/tickets`);
      const all = await updated.json();
      const found = all.find((t: SupportTicket) => t.id === selected.id);
      setSelected(found || null);
    }
    setSending(false);
  };

  const handleResolve = async () => {
    if (!selected) return;
    setResolving(true);
    await fetch(`/api/support/tickets/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    fetchTickets();
    setSelected(null);
    setResolving(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight });
    }
  }, [selected]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-opnskin-bg-primary py-6 md:py-10 px-2 md:px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-primary mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Support - Admin
        </h1>
        {!selected ? (
          <div>
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
                        <div className="text-xs text-opnskin-text-secondary">Créé le {new Date(ticket.createdAt).toLocaleString()} par {ticket.user?.name || ticket.user?.steamId}</div>
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
              <div ref={chatRef} className="max-h-96 overflow-y-auto bg-opnskin-bg-secondary/40 rounded p-3 mb-3 space-y-2">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-3 py-2 max-w-xs text-sm shadow ${msg.senderRole === 'USER' ? 'bg-kalpix-blue text-white' : 'bg-white/80 text-black'}`}>
                      {msg.content}
                      <div className="text-xs text-right text-white/60 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              {selected.status === 'OPEN' && (
                <form onSubmit={handleSendMsg} className="flex gap-2 mt-2">
                  <Input
                    placeholder="Votre réponse..."
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
              {selected.status === 'OPEN' && (
                <Button onClick={handleResolve} disabled={resolving} variant="outline" className="mt-3 w-full flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Marquer comme résolu
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 