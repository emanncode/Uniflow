import { View, StyleSheet } from "react-native";
import { ScalePressable } from "@/components/ScalePressable";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { NotificationBell } from "@/components/NotificationBell";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type AppRole = "student" | "lecturer";

interface ScreenHeaderActionsProps {
  role: AppRole;
}

export function ScreenHeaderActions({ role }: ScreenHeaderActionsProps) {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const unreadCount = useUnreadNotificationCount();

  const profileRoute =
    role === "student" ? "/(student)/profile" : "/(lecturer)/profile";
  const notificationsRoute =
    role === "student"
      ? "/(student)/notifications"
      : "/(lecturer)/notifications";

  const displayName = profile?.full_name ?? (role === "student" ? "Student" : "Lecturer");

  return (
    <View style={styles.row}>
      <NotificationBell
        unreadCount={unreadCount}
        onPress={() => router.push(notificationsRoute)}
      />
      <ScalePressable onPress={() => router.push(profileRoute)}>
        <ProfileAvatar
          name={displayName}
          avatarUrl={profile?.avatar_url}
          size="sm"
          previewable={false}
        />
      </ScalePressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});