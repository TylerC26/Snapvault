import { useEffect, useState } from "react";
import { onAdminAuthChange, adminSignIn, adminSignOut } from "../adminAuth";
import AdminLogin from "./AdminLogin";

export default function AdminShell({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return onAdminAuthChange((adminUser) => {
      setUser(adminUser);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[var(--paper)] paper-grain flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border border-[var(--sepia)] border-t-transparent rounded-full animate-spin" />
          <p className="eyebrow">Loading</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onSignIn={adminSignIn} />;
  }

  return typeof children === "function"
    ? children({ user, signOut: adminSignOut })
    : children;
}
