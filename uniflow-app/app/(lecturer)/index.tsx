import { View, Text, StyleSheet } from "react-native";
import { Theme } from "@/constants/Theme";
import { useProfile } from "@/store/useAuthStore";

export default function LecturerHome() {
  const profile = useProfile();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {profile?.full_name || "Lecturer"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.bgPrimary,
  },
  text: {
    fontSize: 20,
    color: Theme.colors.textPrimary,
  },
});
