import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Admin allowlist. Populate VITE_ADMIN_EMAILS in your .env as a
 * comma-separated list, e.g. "you@example.com,other@example.com".
 * An email is admin iff it matches (case-insensitive) one of these.
 */
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export function isAdmin(user) {
  if (!user || !user.email || user.isAnonymous) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function adminSignIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  if (!isAdmin(user)) {
    await signOut(auth);
    throw new Error("not-admin");
  }
  return user;
}

export function adminSignOut() {
  return signOut(auth);
}

export function onAdminAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(isAdmin(user) ? user : null);
  });
}
