import { ImageResponse } from "next/og";
import { org } from "@/lib/org";

export const runtime = "edge";
export const alt = `${org.shortName} — ${org.name.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(145deg, #071628 0%, #0b3a5c 48%, #0b6e99 100%)",
          color: "white",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 34,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#5eead4",
              fontWeight: 700,
            }}
          >
            {org.shortName}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Proclamation No. 228/2020
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.12,
              maxWidth: 980,
            }}
          >
            {org.name.en}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.84)",
              maxWidth: 860,
              lineHeight: 1.4,
            }}
          >
            Strengthening Water Service Providers through capacity, partnerships,
            and accountable public-service delivery across Oromia, Ethiopia.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            color: "rgba(255,255,255,0.68)",
          }}
        >
          <span>Strategic Plan {org.strategicPlanPeriod}</span>
          <span>{org.domain}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
