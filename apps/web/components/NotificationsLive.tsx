"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/components/UserProvider";
import { useToast } from "@/hooks/use-toast";

/**
 * Subscribe to Supabase Realtime to receive live notifications (INSERTs)
 * for the current user and display a toast for each new notification.
 */
export default function NotificationsLive() {
  const { user } = useUser();
  const { toast } = useToast();
  const shownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user || !user.loggedIn || !user.id) return;

    const channel = supabase
      .channel(`notif-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${user.id}`,
        },
        (payload: any) => {
          const row = payload?.new || payload?.record || {};
          if (!row?.id) return;
          if (shownIdsRef.current.has(row.id)) return;
          shownIdsRef.current.add(row.id);
          // Cap set size to avoid memory growth
          if (shownIdsRef.current.size > 500) {
            const first = shownIdsRef.current.values().next().value;
            shownIdsRef.current.delete(first);
          }
          toast({
            title: row.title || 'Notification',
            description: row.message || '',
          });
        }
      )
      .subscribe((status) => {
        // no-op; could log status if needed
      });

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [user, toast]);

  return null;
}


