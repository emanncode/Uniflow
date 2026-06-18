import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

type CountListener = (count: number) => void;

let sharedChannel: RealtimeChannel | null = null;
let sharedProfileId: string | null = null;
let sharedCount = 0;
let subscriberCount = 0;
const listeners = new Set<CountListener>();

function notifyListeners(count: number) {
  sharedCount = count;
  listeners.forEach((listener) => listener(count));
}

async function fetchUnreadCount(userId: string): Promise<void> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (!error) notifyListeners(count ?? 0);
}

function teardownChannel() {
  if (sharedChannel) {
    supabase.removeChannel(sharedChannel);
    sharedChannel = null;
    sharedProfileId = null;
  }
}

function ensureChannel(userId: string) {
  if (sharedChannel && sharedProfileId === userId) return;

  teardownChannel();
  sharedProfileId = userId;

  const refresh = () => {
    void fetchUnreadCount(userId);
  };

  sharedChannel = supabase
    .channel(`unread-notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      refresh,
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      refresh,
    )
    .subscribe();
}

export function useUnreadNotificationCount(): number {
  const profile = useAuthStore((s) => s.profile);
  const [count, setCount] = useState(sharedCount);

  const syncCount = useCallback((next: number) => {
    setCount(next);
  }, []);

  useEffect(() => {
    listeners.add(syncCount);
    subscriberCount += 1;

    if (profile?.id) {
      void fetchUnreadCount(profile.id);
      ensureChannel(profile.id);
    } else {
      setCount(0);
    }

    return () => {
      listeners.delete(syncCount);
      subscriberCount -= 1;

      if (subscriberCount === 0) {
        teardownChannel();
        sharedCount = 0;
      }
    };
  }, [profile?.id, syncCount]);

  return profile ? count : 0;
}