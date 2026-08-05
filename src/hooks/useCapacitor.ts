'use client'

import { useEffect, useState } from 'react'

type Platform = 'ios' | 'android' | 'web'

export function useCapacitor() {
  const [platform, setPlatform] = useState<Platform>('web')
  const [isNative, setIsNative] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        const { Capacitor } = await import('@capacitor/core')
        setPlatform(Capacitor.getPlatform() as Platform)
        setIsNative(Capacitor.isNativePlatform())
      } catch {
        // Capacitor not available
      } finally {
        setIsReady(true)
      }
    }
    init()
  }, [])

  return {
    platform,
    isNative,
    isReady,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
  }
}
