import { Capacitor } from '@capacitor/core'

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return Capacitor.isNativePlatform()
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web'
  return (Capacitor.getPlatform() as 'ios' | 'android' | 'web') || 'web'
}

export const isIOS = () => getPlatform() === 'ios'
export const isAndroid = () => getPlatform() === 'android'
export const isWeb = () => !isNativePlatform()
