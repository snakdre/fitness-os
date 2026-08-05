import { Capacitor } from '@capacitor/core'

export async function hideSplashScreen() {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 500 })
  } catch (e) {}
}
