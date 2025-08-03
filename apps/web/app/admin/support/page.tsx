"use client";
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, CheckCircle, MessageCircle, Search, Filter, Clock, User, AlertCircle, CheckSquare } from 'lucide-react';
import { useUser } from "@/components/UserProvider";
import { useRouter } from "next/navigation";

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
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
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      console.log('🔍 Debug admin page - user:', user);
      console.log('🔍 Debug admin page - user.isAdmin:', user?.isAdmin);
      console.log('🔍 Debug admin page - isLoading:', isLoading);
      router.replace("/"); // Redirige si pas admin
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    fetchTickets();
  }, []);

  // Filtrer et trier les tickets
  useEffect(() => {
    let filtered = [...tickets];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user?.steamId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // Filtre par priorité
    if (priorityFilter !== "all") {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updatedAt":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "priority":
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        default:
          return 0;
      }
    });

    setFilteredTickets(filtered);
  }, [tickets, searchQuery, statusFilter, priorityFilter, sortBy]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/support/admin/tickets");
      console.log('🔍 Debug fetchTickets - status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Error fetching tickets:', errorData);
        throw new Error(errorData.error || 'Failed to fetch tickets');
      }
      
      const data = await res.json();
      console.log('🔍 Debug fetchTickets - data received:', data.length, 'tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error in fetchTickets:', error);
      // Ne pas rediriger automatiquement, laisser l'utilisateur voir l'erreur
    } finally {
      setLoading(false);
    }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-500';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500';
      case 'LOW': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Haute';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Basse';
      default: return 'Non définie';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-500/20 text-yellow-500';
      case 'RESOLVED': return 'bg-green-500/20 text-green-500';
      case 'CLOSED': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'RESOLVED': return 'Résolu';
      case 'CLOSED': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
    highPriority: tickets.filter(t => t.priority === 'HIGH' && t.status === 'OPEN').length,
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight });
    }
  }, [selected]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-opnskin-bg-primary py-6 md:py-10 px-2 md:px-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold font-rajdhani text-opnskin-primary mb-6 flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Support - Administration
        </h1>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-opnskin-primary" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">{stats.total}</div>
                  <div className="text-sm text-opnskin-text-secondary">Total tickets</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">{stats.open}</div>
                  <div className="text-sm text-opnskin-text-secondary">Tickets ouverts</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">{stats.resolved}</div>
                  <div className="text-sm text-opnskin-text-secondary">Tickets résolus</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-opnskin-text-primary">{stats.highPriority}</div>
                  <div className="text-sm text-opnskin-text-secondary">Priorité haute</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!selected ? (
          <div>
            {/* Filtres et recherche */}
            <Card className="mb-6 bg-opnskin-bg-card border-opnskin-bg-secondary">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-opnskin-text-secondary w-4 h-4" />
                    <Input
                      placeholder="Rechercher tickets..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="OPEN">Ouverts</SelectItem>
                      <SelectItem value="RESOLVED">Résolus</SelectItem>
                      <SelectItem value="CLOSED">Fermés</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="HIGH">Haute</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="LOW">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Date de création</SelectItem>
                      <SelectItem value="updatedAt">Dernière activité</SelectItem>
                      <SelectItem value="priority">Priorité</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="text-center text-opnskin-text-secondary py-8">Chargement…</div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center text-opnskin-text-secondary py-8">
                {tickets.length === 0 ? "Aucun ticket pour l'instant." : "Aucun ticket ne correspond aux filtres."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map(ticket => (
                  <Card key={ticket.id} className="bg-opnskin-bg-card border-opnskin-bg-secondary cursor-pointer hover:border-opnskin-primary transition" onClick={() => openTicket(ticket)}>
                    <CardContent className="py-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-bold text-opnskin-primary text-lg">{ticket.subject}</div>
                          <div className="flex items-center gap-4 text-xs text-opnskin-text-secondary mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {ticket.user?.name || ticket.user?.steamId}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(ticket.createdAt).toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {ticket.messages.length} messages
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-opnskin-bg-card border-opnskin-bg-secondary">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => setSelected(null)}>&larr; Retour</Button>
                  <div>
                    <div className="font-bold text-opnskin-primary text-lg">{selected.subject}</div>
                    <div className="text-sm text-opnskin-text-secondary">
                      Par {selected.user?.name || selected.user?.steamId} • {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selected.priority)}>
                    {getPriorityLabel(selected.priority)}
                  </Badge>
                  <Badge className={getStatusColor(selected.status)}>
                    {getStatusLabel(selected.status)}
                  </Badge>
                </div>
              </div>
              
              <div ref={chatRef} className="max-h-96 overflow-y-auto bg-opnskin-bg-secondary/40 rounded p-3 mb-3 space-y-2">
                {selected.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-3 py-2 max-w-xs text-sm shadow ${msg.senderRole === 'USER' ? 'bg-opnskin-primary text-white' : 'bg-white/80 text-black'}`}>
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