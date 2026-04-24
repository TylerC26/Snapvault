import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebase";
import { compressImage } from "./imageCompression";

export async function uploadHeroImage(eventCode, file) {
  const compressed = await compressImage(file);
  const safeName = (file.name || "hero.jpg").replace(/[^a-zA-Z0-9.-]/g, "_");
  const path = `events/${eventCode}/hero/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed);
  const url = await getDownloadURL(storageRef);
  return { url, storagePath: path };
}

export async function deleteHeroImage(storagePath) {
  if (!storagePath) return;
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (err) {
    if (err?.code !== "storage/object-not-found") throw err;
  }
}
