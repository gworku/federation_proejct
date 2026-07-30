"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div>
            <p style={{ letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 12 }}>
              System error
            </p>
            <h1 style={{ fontSize: "2rem", margin: "0.75rem 0" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#475569", maxWidth: 420, margin: "0 auto" }}>
              The application hit an unexpected error
              {error.digest ? ` (${error.digest})` : ""}. Please try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1.5rem",
                border: 0,
                borderRadius: 12,
                background: "#0369a1",
                color: "#fff",
                padding: "0.75rem 1.25rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
