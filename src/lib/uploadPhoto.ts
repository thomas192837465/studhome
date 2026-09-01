import { supabase } from "./supabase";

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function uploadListingPhoto(dataUrl: string, listingFolder: string, index: number): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${listingFolder}/${Date.now()}-${index}.jpg`;
  const { error } = await supabase.storage.from("listing-photos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("listing-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadListingPhotos(dataUrls: string[], listingFolder: string): Promise<string[]> {
  return Promise.all(dataUrls.map((url, i) => uploadListingPhoto(url, listingFolder, i)));
}

export async function uploadListingVideo(blob: Blob, ownerFolder: string): Promise<string> {
  const ext = blob.type.includes("webm") ? "webm" : "mp4";
  const path = `${ownerFolder}/${Date.now()}-video.${ext}`;
  const { error } = await supabase.storage.from("listing-videos").upload(path, blob, {
    contentType: blob.type || "video/webm",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("listing-videos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCityPhoto(dataUrl: string, city: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${city.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("city-photos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("city-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadHeroPhoto(dataUrl: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("hero-photos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("hero-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPartnerLogo(dataUrl: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("partner-logos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("partner-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadTestimonialPhoto(dataUrl: string): Promise<string> {
  const blob = dataUrlToBlob(dataUrl);
  const path = `${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("testimonial-photos").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("testimonial-photos").getPublicUrl(path);
  return data.publicUrl;
}
