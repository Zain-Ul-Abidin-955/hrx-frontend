import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same HRX “H” mark as the sidebar / auth brand. */
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
          borderRadius: 40,
          background: "linear-gradient(135deg, #6366F1 0%, #22D3EE 100%)",
          color: "#FFFFFF",
          fontSize: 96,
          fontWeight: 700,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        H
      </div>
    ),
    { ...size },
  );
}
