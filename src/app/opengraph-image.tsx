import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}, musée d’art à New York`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Drawn rather than photographed: a card generated at build time needs no remote image and stays under the size caps
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
          background: "#faf7f1",
          color: "#1a1714",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 40, letterSpacing: 8, color: "#6b635a" }}>
          {siteConfig.address.city.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 128, fontWeight: 700 }}>{siteConfig.name}</div>
          <div style={{ display: "flex", width: 160, height: 6, background: "#9e2b25" }} />
          <div style={{ display: "flex", fontSize: 40, lineHeight: 1.3, color: "#6b635a", maxWidth: 900 }}>
            Les chefs-d’œuvre de la peinture, à regarder de près.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
