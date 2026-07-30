"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "opwssf_privacy_notice_accepted";

export function PrivacyNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-white px-4 py-4"
      role="dialog"
      aria-label="Privacy notice"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          This official website uses essential session storage for language and
          secure login. Review our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-ocean-700 underline-offset-2 hover:underline focus-ring"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/accessibility"
            className="font-semibold text-ocean-700 underline-offset-2 hover:underline focus-ring"
          >
            Accessibility Statement
          </Link>
          .
        </p>
        <button
          type="button"
          className="shrink-0 bg-navy-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 focus-ring"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setVisible(false);
          }}
        >
          Accept & continue
        </button>
      </div>
    </div>
  );
}
