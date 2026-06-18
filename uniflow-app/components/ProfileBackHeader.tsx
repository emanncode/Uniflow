import { useCallback } from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Theme } from "@/constants/Theme";

const C = Theme.colors;

type HomeRoute = "/(student)" | "/(lecturer)";

const VISIBLE_TAB_BAR = {
  display: "flex" as const,
  backgroundColor: C.bgSecondary,
  borderTopWidth: 1,
  borderTopColor: C.borderPrimary,
  height: Platform.OS === "ios" ? 88 : 68,
  paddingBottom: Platform.OS === "ios" ? 24 : 10,
  paddingTop: 8,
  elevation: 0,
  shadowOpacity: 0,
};

interface ProfileBackHeaderProps {
  homeRoute: HomeRoute;
}

export function ProfileBackHeader({ homeRoute }: ProfileBackHeaderProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const tabNav = navigation.getParent();
      tabNav?.setOptions({ tabBarStyle: { display: "none" } });
      return () => {
        tabNav?.setOptions({ tabBarStyle: VISIBLE_TAB_BAR });
      };
    }, [navigation]),
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(homeRoute);
    }
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.btn}
        activeOpacity={0.75}
        hitSlop={8}
      >
        <ArrowLeft size={22} color={C.textPrimary} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    backgroundColor: C.bgDeep,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.borderPrimary,
  },
});