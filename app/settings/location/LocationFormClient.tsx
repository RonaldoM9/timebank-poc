"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowLeft, MapPin, Save } from "lucide-react";
import { updateLocation } from "@/app/settings/actions";

interface LocationFormProps {
  defaultValues: {
    city: string;
    postalCode: string;
    department: string;
    region: string;
    country: string;
    serviceRadiusKm: number;
    locationVisibility: string;
    availableOnline: boolean;
  };
}

export default function LocationFormClient({
  defaultValues,
}: LocationFormProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultValues.city);
  const [postalCode, setPostalCode] = useState(defaultValues.postalCode);
  const [department, setDepartment] = useState(defaultValues.department);
  const [region, setRegion] = useState(defaultValues.region);
  const [country, setCountry] = useState(defaultValues.country);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    defaultValues.serviceRadiusKm.toString()
  );
  const [locationVisibility, setLocationVisibility] = useState(
    defaultValues.locationVisibility
  );
  const [availableOnline, setAvailableOnline] = useState(
    defaultValues.availableOnline
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string[]> | null
  >(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);
    setFieldErrors(null);

    const formData = new FormData();
    formData.set("city", city);
    formData.set("postalCode", postalCode);
    formData.set("department", department);
    formData.set("region", region);
    formData.set("country", country);
    formData.set("serviceRadiusKm", serviceRadiusKm);
    formData.set("locationVisibility", locationVisibility);
    formData.set("availableOnline", availableOnline ? "on" : "off");

    const result = await updateLocation(formData);

    if ("error" in result) {
      setError(result.error);
    } else if ("errors" in result) {
      setFieldErrors(result.errors);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }

    setSaving(false);
  }

  const RADII = [5, 10, 20, 50];
  const VISIBILITIES = [
    { value: "city", label: "Ville" },
    { value: "department", label: "Département" },
    { value: "region", label: "Région" },
    { value: "hidden", label: "Masquée" },
  ];

  function getPreview(): string {
    switch (locationVisibility) {
      case "city":
        return city && department ? `${city}, ${department}` : city || department || "—";
      case "department":
        return department || "—";
      case "region":
        return region || "—";
      case "hidden":
        return "Zone non affichée";
      default:
        return "—";
    }
  }

  const previewText = getPreview();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-[#262626]">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#00d4aa]" />
            <span className="font-anton text-lg tracking-wide text-[#f5f5f5]">
              TimeHeroes
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#f5f5f5] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#00d4aa]/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#00d4aa]" />
          </div>
          <div>
            <h1 className="text-2xl font-anton tracking-wide text-[#f5f5f5]">
              Ma zone d&apos;intervention
            </h1>
            <p className="text-[#a3a3a3] text-sm">
              Renseigne ta localisation pour apparaître comme héros local
            </p>
          </div>
        </div>

        {/* RGPD notice */}
        <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-xl p-4 mb-6">
          <p className="text-[#a3a3a3] text-xs leading-relaxed">
            <span className="text-[#00d4aa] font-semibold">🔒 Vie privée :</span>{" "}
            Votre localisation reste approximative. Elle sert uniquement à aider les membres
            à trouver des héros proches. Votre adresse exacte n&apos;est jamais demandée ni
            affichée.
          </p>
        </div>

        {success && (
          <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-[#00d4aa] text-sm font-semibold">
              ✅ Localisation sauvegardée ! Redirection vers le tableau de bord…
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* City */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">
              Ville <span className="text-[#5c5c5c]">(optionnel)</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Écouen"
              className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">
              Code postal <span className="text-[#5c5c5c]">(optionnel)</span>
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Ex: 95440"
              maxLength={5}
              className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm"
            />
            {fieldErrors?.postalCode && (
              <p className="text-red-400 text-xs mt-1">
                {fieldErrors.postalCode[0]}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">
              Département <span className="text-[#5c5c5c]">(optionnel)</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Ex: Val-d'Oise"
              className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">
              Région <span className="text-[#5c5c5c]">(optionnel)</span>
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Ex: Île-de-France"
              className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">Pays</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#111111] border border-[#262626] rounded-xl px-4 py-2.5 text-[#f5f5f5] placeholder:text-[#5c5c5c] focus:outline-none focus:border-[#00d4aa] transition-colors text-sm"
            />
          </div>

          {/* Service radius */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">
              Rayon d&apos;intervention
            </label>
            <div className="flex gap-2">
              {RADII.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setServiceRadiusKm(r.toString())}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    serviceRadiusKm === r.toString()
                      ? "bg-[#00d4aa]/10 border-[#00d4aa] text-[#00d4aa]"
                      : "bg-[#111111] border-[#262626] text-[#a3a3a3] hover:border-[#5c5c5c]"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Location visibility */}
          <div>
            <label className="block text-sm text-[#a3a3a3] mb-1.5">
              Visibilité publique
            </label>
            <div className="grid grid-cols-2 gap-2">
              {VISIBILITIES.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setLocationVisibility(v.value)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    locationVisibility === v.value
                      ? "bg-[#00d4aa]/10 border-[#00d4aa] text-[#00d4aa]"
                      : "bg-[#111111] border-[#262626] text-[#a3a3a3] hover:border-[#5c5c5c]"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewText !== "—" && (
            <div className="bg-[#181818] border border-[#262626] rounded-xl p-4">
              <p className="text-xs text-[#5c5c5c] mb-1">Aperçu public :</p>
              <p className="text-sm text-[#f5f5f5] font-medium">
                {previewText}
                {locationVisibility === "city" && serviceRadiusKm && (
                  <span className="text-[#a3a3a3] font-normal">
                    {" "}· {serviceRadiusKm} km
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Available online */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="availableOnline"
              checked={availableOnline}
              onChange={(e) => setAvailableOnline(e.target.checked)}
              className="w-4 h-4 accent-[#00d4aa]"
            />
            <label htmlFor="availableOnline" className="text-sm text-[#f5f5f5]">
              Disponible aussi en ligne
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full bg-[#00d4aa] hover:bg-[#00b894] disabled:opacity-50 text-black font-semibold rounded-xl py-3 transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? "Enregistrement…" : "Enregistrer ma localisation"}
          </button>
        </form>
      </main>
    </div>
  );
}
