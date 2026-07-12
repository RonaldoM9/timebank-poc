"use client";

import { useEffect } from "react";

/**
 * Client component that initializes Capacitor-native features:
 * - Hides splash screen
 * - Sets status bar style
 * - Handles safe area insets
 * - Registers push notification handlers
 *
 * Must be placed inside a client boundary (e.g. in layout.tsx).
 */
export default function CapacitorInit() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    let isCapacitor = false;

    async function init() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        isCapacitor = Capacitor.isNativePlatform();

        if (!isCapacitor) return;

        // ── Splash Screen ──
        try {
          const { SplashScreen } = await import("@capacitor/splash-screen");
          await SplashScreen.hide();
        } catch {}

        // ── Status Bar ──
        try {
          const { StatusBar } = await import("@capacitor/status-bar");
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setBackgroundColor({ color: "#2BB286" });
        } catch {}

        // ── Push Notifications ──
        try {
          const { PushNotifications } = await import("@capacitor/push-notifications");
          const perm = await PushNotifications.requestPermissions();
          if (perm.receive === "granted") {
            await (PushNotifications as any).register();
          }
        } catch {}
      } catch {
        // Not in Capacitor environment — do nothing
      }
    }

    init();
  }, []);

  // This component doesn't render anything
  return null;
}
