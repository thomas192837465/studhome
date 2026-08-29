export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("La géolocalisation n'est pas disponible sur cet appareil."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error("Autorisation de localisation refusée."));
        } else {
          reject(new Error("Impossible d'obtenir votre position."));
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

export interface ReverseGeocodeResult {
  area: string;
  city: string;
  label: string;
}

// OpenStreetMap's free Nominatim endpoint — same provider already used for
// the map embed/links elsewhere in the app. Fine for this app's traffic
// volume; a heavier-traffic app should proxy this through its own server
// per Nominatim's usage policy.
export async function reverseGeocode({ latitude, longitude }: Coordinates): Promise<ReverseGeocodeResult> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Impossible de déterminer l'adresse à partir de votre position.");
  const data = await res.json();
  const address = data?.address ?? {};
  const area: string = address.suburb || address.quarter || address.neighbourhood || address.city_district || "";
  const city: string = address.city || address.town || address.village || address.county || "";
  const label = [area, city].filter(Boolean).join(", ") || data?.display_name || "Position inconnue";
  return { area, city, label };
}
