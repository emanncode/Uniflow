import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

export function useUnreadNotificationCount(): number {
  const profile = useAuthStore((s) => s.profile);
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!profile) {
      setCount(0);
      return;
    }

    const { count: unread, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("is_read", false);

    if (!error) setCount(unread ?? 0);
  }, [profile]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel(`unread-notifications-${profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${profile.id}`,
        },
        () => {
          fetchCount();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchCount]);

  return count;
}