"use client";

/**
 * NFC utility for TimeHeroes — validates missions via NFC tap.
 * Uses @capgo/capacitor-nfc for Capacitor / falls back to web.
 */

// Dynamically import to avoid breaking SSR / web
let NfcPlugin: any = null;

async function getNfc(): Promise<any> {
  if (typeof window === "undefined") return null;
  if (!NfcPlugin) {
    try {
      const mod = await import("@capgo/capacitor-nfc");
      NfcPlugin = mod.CapacitorNfc || mod.default || mod;
    } catch {
      console.warn("[NFC] Not available in this environment (web)");
      return null;
    }
  }
  return NfcPlugin;
}

/** Check if NFC is available on this device */
export async function isNfcAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const nfc = await getNfc();
    if (!nfc?.isAvailable) return false;
    const result = await nfc.isAvailable();
    return result?.available === true || result?.value === true;
  } catch {
    return false;
  }
}

/** Read an NFC tag — returns the tag ID or null */
export async function readNfcTag(): Promise<{ id: string; techTypes: string[] } | null> {
  const nfc = await getNfc();
  if (!nfc) return null;

  try {
    // Start NFC scan — user must tap a tag
    const result = await nfc.startScan({});
    if (result?.tag) {
      await nfc.stopScan();
      return {
        id: result.tag.id,
        techTypes: result.tag.techTypes || [],
      };
    }
    return null;
  } catch (err: any) {
    console.error("[NFC] Read error:", err);
    // Stop scan on error
    try { await nfc.stopScan(); } catch {}
    return null;
  }
}

/** Stop NFC scanning */
export async function stopNfcScan(): Promise<void> {
  const nfc = await getNfc();
  if (!nfc) return;
  try {
    await nfc.stopScan();
  } catch {}
}

/**
 * Read a text payload from an NFC tag.
 * Returns the first text record found.
 */
export async function readNfcPayload(): Promise<string | null> {
  const nfc = await getNfc();
  if (!nfc) return null;

  try {
    const result = await nfc.startScan({});
    if (result?.tag?.ndefMessage?.records) {
      for (const record of result.tag.ndefMessage.records) {
        if (record.type === "T" && record.payload) {
          // Text record — decode payload
          const payload = record.payload;
          const langLen = payload.charCodeAt(0) || 0;
          const text = payload.substring(langLen + 1);
          await nfc.stopScan();
          return text;
        }
        if (record.type === "U" && record.payload) {
          // URI record — extract URL
          await nfc.stopScan();
          return record.payload;
        }
      }
    }
    await nfc.stopScan();
    return null;
  } catch (err: any) {
    console.error("[NFC] Payload read error:", err);
    try { await nfc.stopScan(); } catch {}
    return null;
  }
}
