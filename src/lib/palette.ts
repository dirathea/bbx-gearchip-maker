import { extractColorsFromSrc } from "extract-colors";

export interface PaletteColor {
  hex: string;
  rgb: [number, number, number];
  area: number;
}

/**
 * Extract color palette from an image using the extract-colors library.
 * Returns colors sorted by prominence.
 */
export async function getPalette(
  imageSrc: string,
  options?: { count?: number }
): Promise<PaletteColor[]> {
  const colors = await extractColorsFromSrc(imageSrc, {
    crossOrigin: "anonymous",
  });

  return colors.slice(0, options?.count ?? 5).map((c) => ({
    hex: c.hex,
    rgb: [c.red, c.green, c.blue] as [number, number, number],
    area: c.area,
  }));
}
