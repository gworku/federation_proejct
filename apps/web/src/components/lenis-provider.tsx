"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(!mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      key={pathname}
      root
      options={{
        duration: 1.2,
        lerp: 0.1,
        smoothWheel: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
      }}
    >
      {children}
    </ReactLenis>
  );
}
