import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = {
  height: 630,
  width: 1200,
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";

type VendorlyOgImageInput = {
  accentColor?: string;
  description: string;
  eyebrow: string;
  kicker?: string;
  title: string;
};

function sanitizeColor(value?: string) {
  if (!value) {
    return "#14b8a6";
  }

  const trimmed = value.trim();

  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)
    ? trimmed
    : "#14b8a6";
}

function clampText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}...`;
}

export function createVendorlyOgImage({
  accentColor,
  description,
  eyebrow,
  kicker = "Storefront-first commerce",
  title,
}: VendorlyOgImageInput) {
  const resolvedAccent = sanitizeColor(accentColor);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "linear-gradient(135deg, #07111f 0%, #0f172a 40%, #111827 100%)",
          color: "#f8fafc",
          display: "flex",
          fontFamily:
            '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          height: "100%",
          overflow: "hidden",
          padding: 0,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: `radial-gradient(circle at top left, ${resolvedAccent}55 0%, transparent 48%)`,
            height: 520,
            left: -80,
            position: "absolute",
            top: -140,
            width: 520,
          }}
        />
        <div
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 68%)",
            height: 560,
            position: "absolute",
            right: -120,
            top: -120,
            width: 560,
          }}
        />
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 44,
            display: "flex",
            flex: 1,
            margin: 36,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "54px 56px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${resolvedAccent}, #f8fafc)`,
                    borderRadius: 999,
                    display: "flex",
                    height: 18,
                    width: 18,
                  }}
                />
                <div
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    display: "flex",
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: 5,
                    textTransform: "uppercase",
                  }}
                >
                  {clampText(eyebrow, 42)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 68,
                  fontWeight: 800,
                  letterSpacing: -2.4,
                  lineHeight: 1.02,
                  maxWidth: 720,
                }}
              >
                {clampText(title, 82)}
              </div>

              <div
                style={{
                  color: "rgba(226,232,240,0.92)",
                  display: "flex",
                  fontSize: 31,
                  lineHeight: 1.35,
                  maxWidth: 760,
                }}
              >
                {clampText(description, 190)}
              </div>
            </div>

            <div
              style={{
                alignItems: "center",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 999,
                  display: "flex",
                  gap: 14,
                  padding: "15px 22px",
                }}
              >
                <div
                  style={{
                    background: resolvedAccent,
                    borderRadius: 999,
                    display: "flex",
                    height: 14,
                    width: 14,
                  }}
                />
                <div
                  style={{
                    color: "#f8fafc",
                    display: "flex",
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: 0.2,
                  }}
                >
                  {clampText(kicker, 52)}
                </div>
              </div>

              <div
                style={{
                  color: "rgba(255,255,255,0.58)",
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 600,
                }}
              >
                vendorly.shop
              </div>
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(15,23,42,0.12) 100%)",
              display: "flex",
              justifyContent: "center",
              position: "relative",
              width: 320,
            }}
          >
            <div
              style={{
                background: `linear-gradient(180deg, ${resolvedAccent} 0%, rgba(255,255,255,0.22) 100%)`,
                borderRadius: 999,
                display: "flex",
                filter: "blur(6px)",
                height: 400,
                opacity: 0.95,
                position: "absolute",
                right: -120,
                top: -70,
                width: 400,
              }}
            />
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 38,
                display: "flex",
                flexDirection: "column",
                gap: 22,
                padding: "26px 24px",
                width: 228,
              }}
            >
              <div
                style={{
                  color: "rgba(255,255,255,0.62)",
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                Preview
              </div>
              <div
                style={{
                  alignItems: "center",
                  background: "rgba(255,255,255,0.08)",
                  borderRadius: 30,
                  display: "flex",
                  height: 96,
                  justifyContent: "center",
                  width: 96,
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    background: "#ffffff",
                    borderRadius: 999,
                    color: "#0f172a",
                    display: "flex",
                    fontSize: 36,
                    fontWeight: 800,
                    height: 68,
                    justifyContent: "center",
                    width: 68,
                  }}
                >
                  V
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    display: "flex",
                    fontSize: 30,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {clampText(eyebrow, 24)}
                </div>
                <div
                  style={{
                    color: "rgba(226,232,240,0.84)",
                    display: "flex",
                    fontSize: 21,
                    lineHeight: 1.35,
                  }}
                >
                  {clampText(description, 84)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
