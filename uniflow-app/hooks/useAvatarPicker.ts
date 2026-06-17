import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import {
  MAX_AVATAR_BYTES,
  getImageByteSize,
  uploadAvatar,
} from "@/lib/avatar";

export function useAvatarPicker() {
  const profile = useAuthStore((s) => s.profile);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const reset = useCallback(() => {
    setPreviewUri(null);
    setPreviewMime(null);
    setModalVisible(false);
    setError("");
    setIsUploading(false);
  }, []);

  const pickImage = useCallback(async () => {
    setError("");

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to change your profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const byteSize = asset.fileSize ?? (await getImageByteSize(asset.uri));

    if (byteSize > MAX_AVATAR_BYTES) {
      Alert.alert(
        "Image too large",
        "Please choose a photo that is 2MB or smaller.",
      );
      return;
    }

    setPreviewUri(asset.uri);
    setPreviewMime(asset.mimeType ?? null);
    setModalVisible(true);
  }, []);

  const acceptPhoto = useCallback(async () => {
    if (!profile || !previewUri) return;

    setIsUploading(true);
    setError("");

    try {
      const avatarUrl = await uploadAvatar(
        profile.id,
        previewUri,
        previewMime,
      );

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      updateProfile({ avatar_url: avatarUrl });
      reset();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Failed to update profile photo.";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }, [profile, previewUri, previewMime, updateProfile, reset]);

  return {
    pickImage,
    acceptPhoto,
    cancelPhoto: reset,
    previewUri,
    modalVisible,
    isUploading,
    error,
  };
}