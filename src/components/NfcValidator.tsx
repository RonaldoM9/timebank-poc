"use client";

import { useState, useEffect } from "react";
import { isNfcAvailable, readNfcPayload, stopNfcScan } from "@/lib/nfc";
import { useRouter } from "next/navigation";

interface NfcValidatorProps {
  bookingId: string;
  /** Called after successful validation */
  onValidated: () => void;
  /** Called on error with error message */
  onError: (error: string) => void;
}

/** Extract token from an NFC URL like https://timeheroes.fr/complete/nfc/<token> */
function extractTokenFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/complete\/(?:nfc|qr)\/(.+)/);
    return match?.[1] || null;
  } catch {
    // If it's just a bare token (no URL structure)
    if (/^[0-9a-f-]{36}$/i.test(url)) return url;
    return null;
  }
}

export default function NfcValidator({ bookingId: _bookingId, onValidated, onError }: NfcValidatorProps) {
  const router = useRouter();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");

  useEffect(() => {
    isNfcAvailable().then(setAvailable).catch(() => setAvailable(false));
    return () => { stopNfcScan().catch(() => {}); };
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setStatus("scanning");
    try {
      // Read the NFC payload (URL or token)
      const payload = await readNfcPayload();
      if (!payload) {
        setStatus("error");
        onError("Aucun tag NFC détecté. Approche le téléphone.");
        setScanning(false);
        return;
      }

      // Extract the token from the payload
      const token = extractTokenFromUrl(payload);
      if (!token) {
        setStatus("error");
        onError("Tag NFC invalide. Utilise le tag généré pour cette mission.");
        setScanning(false);
        return;
      }

      // Validate via the existing server action
      const res = await fetch(`/complete/nfc/${token}`);
      if (res.redirected) {
        // Success — redirected to confirmation page
        setStatus("success");
        onValidated();
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus("error");
        onError(data?.error || "Erreur de validation. Réessaie.");
      }
    } catch (err) {
      setStatus("error");
      onError("Erreur de lecture NFC. Vérifie que le tag est à proximité.");
    }
    setScanning(false);
  };

  if (available === false) return null; // NFC not available

  return (
    <div className="bg-gradient-to-r from-tb-accent/5 to-transparent border border-tb-accent/20 rounded-xl p-4 mt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tb-accent/10 flex items-center justify-center shrink-0">
            <span className="text-lg">📡</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-tb-text-primary">Validation NFC</p>
            <p className="text-[10px] text-tb-text-muted mt-0.5">
              {available === null
                ? "Vérification de la disponibilité NFC..."
                : "Tape le téléphone du héros ou le tag NFC"}
            </p>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-1.5 bg-tb-accent hover:bg-tb-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-tb-accent/20"
        >
          {status === "scanning" ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              En écoute...
            </>
          ) : (
            <>
              <span>📡</span>
              Valider par NFC
            </>
          )}
        </button>
      </div>
      {status === "scanning" && (
        <p className="text-xs text-tb-accent font-medium mt-2 animate-pulse">
          🔵 Approche le tag NFC du téléphone...
        </p>
      )}
      {status === "success" && (
        <p className="text-xs text-green-600 font-medium mt-2">✅ Mission validée par NFC !</p>
      )}
      {status === "error" && (
        <p className="text-xs text-red-500 mt-2">❌ Lecture échouée. Réessaie.</p>
      )}
    </div>
  );
}
