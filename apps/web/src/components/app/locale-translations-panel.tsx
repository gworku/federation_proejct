"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteLocaleContent,
  fetchLocaleContent,
  upsertLocaleContent,
  type LocaleContentItem,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const KEYS = [
  "vision",
  "mission",
  "about_intro",
  "mandate_intro",
  "footer_blurb",
  "home_show_partners",
  "home_show_gallery",
  "home_show_map",
] as const;

const LOCALES = ["en", "om", "am"] as const;

export function LocaleTranslationsPanel() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [key, setKey] = useState<(typeof KEYS)[number] | string>("vision");
  const [customKey, setCustomKey] = useState("");
  const [locale, setLocale] = useState<(typeof LOCALES)[number]>("en");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const query = useQuery({
    queryKey: ["cms-locale-content"],
    queryFn: () => fetchLocaleContent(undefined, true),
  });

  const activeKey = customKey.trim() || key;

  const current = useMemo(() => {
    return (query.data ?? []).find(
      (row) => row.key === activeKey && row.locale === locale,
    ) as LocaleContentItem | undefined;
  }, [query.data, activeKey, locale]);

  useEffect(() => {
    setTitle(current?.title ?? "");
    setBody(current?.body ?? "");
  }, [current, activeKey, locale]);

  const mutation = useMutation({
    mutationFn: () =>
      upsertLocaleContent({
        key: activeKey,
        locale,
        title,
        body,
        is_approved: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms-locale-content"] });
      await queryClient.invalidateQueries({ queryKey: ["locale-content"] });
      push("Translation saved and approved.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLocaleContent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cms-locale-content"] });
      await queryClient.invalidateQueries({ queryKey: ["locale-content"] });
      setTitle("");
      setBody("");
      push("Translation deleted.", "success");
    },
    onError: (error: Error) => push(error.message, "error"),
  });

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl text-navy-950">
        Multilingual content (CMS)
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Create, update, and delete approved EN / OM / AM website text by content
        category key. Public pages prefer CMS text over built-in fallbacks.
        Homepage toggles: set body to <code>1</code> or <code>0</code> for{" "}
        <code>home_show_partners</code>, <code>home_show_gallery</code>, and{" "}
        <code>home_show_map</code>.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold" htmlFor="lc-key">
            Content key
          </label>
          <select
            id="lc-key"
            className="h-11 w-full rounded-xl border border-border px-3 text-sm focus-ring"
            value={KEYS.includes(key as (typeof KEYS)[number]) ? key : "vision"}
            onChange={(e) => {
              setKey(e.target.value);
              setCustomKey("");
            }}
          >
            {KEYS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <Input
            className="mt-2"
            placeholder="Or type a custom key"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-semibold"
            htmlFor="lc-locale"
          >
            Language
          </label>
          <select
            id="lc-locale"
            className="h-11 w-full rounded-xl border border-border px-3 text-sm focus-ring"
            value={locale}
            onChange={(e) =>
              setLocale(e.target.value as (typeof LOCALES)[number])
            }
          >
            {LOCALES.map((item) => (
              <option key={item} value={item}>
                {item.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {query.isLoading ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold"
              htmlFor="lc-title"
            >
              Title
            </label>
            <Input
              id="lc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label
              className="mb-1.5 block text-sm font-semibold"
              htmlFor="lc-body"
            >
              Body
            </label>
            <textarea
              id="lc-body"
              rows={6}
              className="w-full rounded-xl border border-border px-3.5 py-3 text-sm focus-ring"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">
            {current
              ? `Editing existing row #${current.id}${current.is_approved ? " (approved)" : " (pending)"}`
              : "No CMS row yet — saving will create one."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={
                mutation.isPending ||
                !activeKey.trim() ||
                !title.trim() ||
                !body.trim()
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Saving…" : "Save translation"}
            </Button>
            {current ? (
              <Button
                type="button"
                variant="danger"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (window.confirm("Delete this translation?")) {
                    deleteMutation.mutate(current.id);
                  }
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sky-50 text-navy-800">
            <tr>
              <th className="px-3 py-2">Key</th>
              <th className="px-3 py-2">Locale</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Approved</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(query.data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{row.key}</td>
                <td className="px-3 py-2 uppercase">{row.locale}</td>
                <td className="px-3 py-2 text-slate-600">{row.title}</td>
                <td className="px-3 py-2">{row.is_approved ? "Yes" : "No"}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCustomKey(row.key);
                        setKey(row.key);
                        setLocale(row.locale as (typeof LOCALES)[number]);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm("Delete this translation?")) {
                          deleteMutation.mutate(row.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
