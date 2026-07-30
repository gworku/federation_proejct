"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { apiLogout } from "@/lib/api";
import { logoutLocal } from "@/lib/auth";

export function useLogout(redirectTo = "/login") {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const logout = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await apiLogout();
    } finally {
      logoutLocal();
      router.push(redirectTo);
      router.refresh();
      setPending(false);
    }
  }, [pending, redirectTo, router]);

  return { logout, pending };
}
