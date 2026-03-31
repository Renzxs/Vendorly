import {
  DEFAULT_METADATA_DESCRIPTION,
  DEFAULT_METADATA_TITLE,
} from "@/lib/metadata";
import {
  createVendorlyOgImage,
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
} from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = DEFAULT_METADATA_TITLE;
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function OpenGraphImage() {
  return createVendorlyOgImage({
    description: DEFAULT_METADATA_DESCRIPTION,
    eyebrow: "Vendorly",
    kicker: "Discover standout stores and products",
    title: DEFAULT_METADATA_TITLE,
  });
}
