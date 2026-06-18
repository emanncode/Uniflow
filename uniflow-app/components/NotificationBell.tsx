import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;

interface NotificationBellProps {
  unreadCount: number;
  onPress: () => void;
}

export function NotificationBell({ unreadCount, onPress }: NotificationBellProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.75}
      hitSlop={6}
    >
      <Bell size={22} color={C.textPrimary} strokeWidth={1.9} />
      {unreadCount > 0 ? <View style={styles.dot} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
  dot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.danger,
    borderWidth: 1.5,
    borderColor: C.bgCard,
  },
});