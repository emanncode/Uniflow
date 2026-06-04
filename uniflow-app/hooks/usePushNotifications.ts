import { useEffect } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/useAuthStore'

// ─── Notification Handler ──────────────────────────────────────────────────
// Controls how notifications appear when the app is in the foreground

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

// ─── Hook ──────────────────────────────────────────────────────────────────

export function usePushNotifications() {
  const profile = useAuthStore((s) => s.profile)
  const updateProfile = useAuthStore((s) => s.updateProfile)

  useEffect(() => {
    if (!profile) return

    let mounted = true

    async function register() {
      try {
        // Push notifications only work on real devices
        if (!Device.isDevice) {
          console.log('[Push] Skipping — not a physical device')
          return
        }

        // Request permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync()
        let finalStatus = existingStatus

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync()
          finalStatus = status
        }

        if (finalStatus !== 'granted') {
          console.log('[Push] Permission denied')
          return
        }

        // Get Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync()
        const token = tokenData.data

        if (!mounted) return

        // Skip DB write if token hasn't changed
        if (profile.push_token === token) return

        // Save to Supabase profiles table
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('id', profile.id)

        if (error) {
          console.error('[Push] Failed to save token:', error.message)
          return
        }

        // Update local store so profile.push_token stays in sync
        updateProfile({ push_token: token })
        console.log('[Push] Token registered:', token)

        // Android notification channel setup
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('uniflow', {
            name: 'Uniflow Alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#ff5c1a',
            sound: 'default',
          })
        }
      } catch (e) {
        console.error('[Push] Registration error:', e)
      }
    }

    register()

    return () => {
      mounted = false
    }
  }, [profile?.id]) // only re-run if the logged-in user changes
}