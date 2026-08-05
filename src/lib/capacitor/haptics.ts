import { Capacitor } from '@capacitor/core'

export async function impactLight() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch (e) {}
}

export async function impactMedium() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch (e) {}
}

export async function notificationSuccess() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    await Haptics.notification({ type: NotificationType.Success })
  } catch (e) {}
}
