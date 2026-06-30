import { ImageResponse } from "next/og";
import { DEFAULT_TITLE, SITE_TAGLINE } from "@/lib/seo";

export const alt = DEFAULT_TITLE;
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
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #172032 0%, #0F172A 50%, #172032 100%)",
          color: "#fafafa",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1D4ED8",
            marginBottom: 16,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          UniflowApp
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Uniflow
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#a1a1aa",
            marginTop: 20,
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 24,
            color: "#1D4ED8",
            fontWeight: 600,
          }}
        >
          uniflowapp.xyz
        </div>
      </div>
    ),
    { ...size },
  );
}