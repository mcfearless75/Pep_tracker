import type { CapacitorConfig } from '@capacitor/cli'

// Same thin-WebView pattern as Tranmere Tracker: the native shells load the
// deployed site, so web pushes need no native rebuild. Point server.url at
// the production domain once it exists.
const config: CapacitorConfig = {
  appId: 'app.tracked.companion',
  appName: 'Tracked',
  webDir: 'out',
  server: {
    url: 'https://tracked-paul-mcwilliams-projects.vercel.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: { launchShowDuration: 0, launchAutoHide: false, showSpinner: false },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
}

export default config
