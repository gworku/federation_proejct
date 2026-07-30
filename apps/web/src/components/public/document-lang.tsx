"use client";

import { useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";

/** Keeps <html lang> in sync with the active public locale. */
export function DocumentLang() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
