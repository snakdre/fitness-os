import { Capacitor } from '@capacitor/core'

export async function setStatusBarStyle(isDark: boolean) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: isDark ? '#0a0a0a' : '#ffffff' })
  } catch (e) {
    // StatusBar not available
  }
}

export async function showStatusBar() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { StatusBar } = await import('@capacitor/status-bar')
    await StatusBar.show()
  } catch (e) {}
}
