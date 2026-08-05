import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.vyrox.fitness',
  appName: 'VYROX',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // During development, point to your running Next.js server:
    // url: 'http://YOUR_LOCAL_IP:3000',
    // cleartext: true,
  },
  ios: {
    scheme: 'VYROX',
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      showSpinner: false,
      backgroundColor: '#ffffff',
      iosSpinnerStyle: 'small',
      spinnerColor: '#f97316',
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
      overlaysWebView: false,
    },
  },
}

export default config
