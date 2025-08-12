"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Pencil, Trash2, ExternalLink, ArrowUpDown, Search } from "lucide-react";

export type Listing = {
  id: string;
  itemId: string;
  itemName?: string | null;
  itemImage?: string | null;
  price: number;
  status: "AVAILABLE" | "PENDING_TRADE_OFFER" | "COMPLETED" | "EXPIRED";
  createdAt: string;
  sellerId: string;
};

export default function MyListingsTable({
  offers,
  currentUserId,
  onChanged,
}: {
  offers: Listing[];
  currentUserId: string;
  onChanged?: () => void;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | Listing["status"]>("ALL");
  const [sortKey, setSortKey] = useState<"createdAt" | "price">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let res = offers.filter((o) => o.sellerId === currentUserId);
    if (statusFilter !== "ALL") res = res.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      res = res.filter((o) =>
        (o.itemName || "").toLowerCase().includes(s) || o.itemId.toLowerCase().includes(s)
      );
    }
    res.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "price") return (a.price - b.price) * dir;
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    });
    return res;
  }, [offers, currentUserId, search, statusFilter, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const beginEditPrice = (row: Listing) => {
    setEditingId(row.id);
    setEditPriceValue(String(row.price.toFixed(2)));
  };

  const savePrice = async (row: Listing) => {
    const price = Number(editPriceValue);
    if (!price || price <= 0) {
      toast({ title: "Prix invalide", description: "Le prix doit être supérieur à 0.", variant: "destructive" });
      return;
    }
    setSavingId(row.id);
    try {
      const res = await fetch(`/api/offers/${row.id}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Échec de la mise à jour du prix");
      toast({ title: "Prix mis à jour", description: `Nouveau prix: ${price.toFixed(2)} €` });
      setEditingId(null);
      onChanged?.();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const cancelOffer = async (row: Listing) => {
    if (row.status !== "AVAILABLE") {
      toast({ title: "Action impossible", description: "L'offre n'est pas disponible.", variant: "destructive" });
      return;
    }
    setSavingId(row.id);
    try {
      const res = await fetch(`/api/offers/${row.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && data?.error !== "Offer not found") throw new Error(data.error || "Échec du retrait");
      toast({ title: "Offre retirée" });
      onChanged?.();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const StatusPill = ({ status }: { status: Listing["status"] }) => (
    <Badge variant={status === "AVAILABLE" ? "default" : status === "PENDING_TRADE_OFFER" ? "secondary" : status === "COMPLETED" ? "outline" : "destructive"}>
      {status === "AVAILABLE" ? "Active" : status === "PENDING_TRADE_OFFER" ? "En échange" : status === "COMPLETED" ? "Terminé" : "Expirée"}
    </Badge>
  );

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-opnskin-text-secondary" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un item..." className="pl-8 bg-opnskin-bg-card/60 border-opnskin-bg-secondary" />
          </div>
          <Button variant={statusFilter === "ALL" ? "default" : "outline"} onClick={() => setStatusFilter("ALL")}>Tous</Button>
          <Button variant={statusFilter === "AVAILABLE" ? "default" : "outline"} onClick={() => setStatusFilter("AVAILABLE")}>Actives</Button>
          <Button variant={statusFilter === "PENDING_TRADE_OFFER" ? "default" : "outline"} onClick={() => setStatusFilter("PENDING_TRADE_OFFER")}>En échange</Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-opnskin-text-secondary">
          <span>{filtered.length} annonce(s)</span>
          <span>•</span>
          <span>
            Total: {filtered.reduce((s, o) => s + (o.price || 0), 0).toFixed(2)} €
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-opnskin-bg-secondary bg-opnskin-bg-card/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Skin</TableHead>
              <TableHead className="w-[140px]">
                <button className="inline-flex items-center gap-1" onClick={() => toggleSort("price")}>Prix <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>
                <button className="inline-flex items-center gap-1" onClick={() => toggleSort("createdAt")}>Créée le <ArrowUpDown className="h-3 w-3" /></button>
              </TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id} className="hover:bg-opnskin-bg-secondary/20">
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.itemImage && <img src={row.itemImage} alt={row.itemName || row.itemId} className="w-10 h-10 object-contain rounded" />}
                    <div className="flex flex-col">
                      <span className="font-medium">{row.itemName || row.itemId}</span>
                      <span className="text-xs text-opnskin-text-secondary">#{row.itemId}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {editingId === row.id ? (
                    <div className="flex items-center gap-2">
                      <Input type="number" value={editPriceValue} onChange={(e) => setEditPriceValue(e.target.value)} className="w-24 bg-opnskin-bg-card border-opnskin-bg-secondary" />
                      <Button size="sm" onClick={() => savePrice(row)} disabled={savingId === row.id} className="bg-opnskin-green hover:bg-opnskin-green/80">{savingId === row.id ? "..." : "OK"}</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2">
                      <span>{row.price.toFixed(2)} €</span>
                      {row.status === "AVAILABLE" && (
                        <Button size="icon" variant="ghost" onClick={() => beginEditPrice(row)} title="Modifier le prix">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                <TableCell><StatusPill status={row.status} /></TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-opnskin-bg-card border-opnskin-bg-secondary">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open(`/marketplace?offerId=${row.id}`, '_blank')} className="cursor-pointer"><ExternalLink className="h-4 w-4 mr-2" />Voir sur la marketplace</DropdownMenuItem>
                      {row.status === "AVAILABLE" && (
                        <DropdownMenuItem onClick={() => beginEditPrice(row)} className="cursor-pointer"><Pencil className="h-4 w-4 mr-2" />Modifier le prix</DropdownMenuItem>
                      )}
                      {row.status === "AVAILABLE" && (
                        <DropdownMenuItem onClick={() => cancelOffer(row)} className="cursor-pointer text-red-400 focus:text-red-400"><Trash2 className="h-4 w-4 mr-2" />Retirer l'offre</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
