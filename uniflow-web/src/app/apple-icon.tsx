import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#172032",
          color: "#1D4ED8",
          fontSize: 88,
          fontWeight: 800,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        U
      </div>
    ),
    { ...size },
  );
}
