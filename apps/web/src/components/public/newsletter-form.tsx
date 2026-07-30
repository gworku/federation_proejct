"use client";

import { FormEvent, useState } from "react";
import { subscribeNewsletter } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { useLocale } from "@/hooks/use-locale";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const { push } = useToast();
  const { locale } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const labels = {
    en: {
      email: "Email address",
      placeholder: "Email address",
      subscribe: "Subscribe",
      saving: "Saving…",
      ok: "Subscribed successfully.",
      fail: "Unable to subscribe.",
    },
    om: {
      email: "Imeelii",
      placeholder: "Imeelii",
      subscribe: "Galmaa'i",
      saving: "Olkaa'aa…",
      ok: "Milkaa'inaan galmaa'eera.",
      fail: "Galmaa'uun hin danda'amne.",
    },
    am: {
      email: "\u12a2\u121c\u12ed\u120d",
      placeholder: "\u12a2\u121c\u12ed\u120d",
      subscribe: "\u12ed\u121d\u12dd\u1308\u1261",
      saving: "\u1260\u121b\u1235\u1240\u1218\u1325 \u120b\u12ed…",
      ok: "\u1260\u1270\u1233\u12ab \u1201\u1294\u1273 \u1270\u1218\u12dd\u1308\u1261\u12cb\u120d\u1362",
      fail: "\u1218\u121d\u12dd\u1308\u1265 \u12a0\u120d\u1270\u123b\u12ab\u121d\u1362",
    },
  }[locale];

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await subscribeNewsletter(trimmed);
      setEmail("");
      push(labels.ok, "success");
    } catch (error) {
      push(error instanceof Error ? error.message : labels.fail, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={
        compact
          ? "mt-4 flex flex-col gap-2 sm:flex-row"
          : "mt-4 flex flex-col gap-2 sm:flex-row"
      }
    >
      <label className="sr-only" htmlFor="newsletter-email">
        {labels.email}
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={labels.placeholder}
        className="h-11 flex-1 border border-white/25 bg-navy-900 px-3 text-sm text-white placeholder:text-white/50 focus-ring"
      />
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="h-11 bg-ocean-600 px-4 text-sm font-semibold hover:bg-ocean-500 focus-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? labels.saving : labels.subscribe}
      </button>
    </form>
  );
}
