// Auto-generated utility functions for s2doc TypeScript integration
// Based on kieta-data-objs util.ts

import { RectangleRegion } from "./rectangleregion.model";


/**
 * Converts a Base64 string to an HTMLImageElement.
 * @param base64 - The Base64 string representing an image.
 * @returns A Promise that resolves to an HTMLImageElement.
 */
export function base64ToImg(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Invalid Base64 image data"));
    img.src = base64.startsWith("data:image/")
      ? base64
      : `data:image/png;base64,${base64}`;
  });
}

/**
 * Converts an HTMLCanvasElement or HTMLImageElement to a Base64 string.
 * @param source - The source to convert (Canvas or Image).
 * @param format - The image format (e.g., 'image/png', 'image/jpeg'). Default is 'image/png'.
 * @param quality - Quality for image compression (only applicable for JPEG). Default is 0.92.
 * @returns A Base64 string representation of the image.
 */
export function imgToBase64(
  source: HTMLCanvasElement | HTMLImageElement,
  format: string = "image/png",
  quality: number = 0.92,
): string {
  if (source instanceof HTMLCanvasElement) {
    return source.toDataURL(format, quality);
  } else if (source instanceof HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to create canvas context");
    }

    context.drawImage(source, 0, 0);
    return canvas.toDataURL(format, quality);
  } else {
    throw new Error("Invalid source type. Expected Canvas or Image.");
  }
}

/**
 * Converts a BoundingBox to image space using width and height factors.
 * @param bbox - The BoundingBox to convert.
 * @param widthFactor - The scaling factor for width.
 * @param heightFactor - The scaling factor for height.
 * @returns A new BoundingBox instance in image space.
 */
export function getInImgSpace(
  bbox: RectangleRegion,
  widthFactor: number,
  heightFactor: number,
): RectangleRegion {
  if (bbox.space === "img") {
    return bbox;
  }
  return new RectangleRegion(
    bbox.x1 * widthFactor,
    bbox.y1 * heightFactor,
    bbox.x2 * widthFactor,
    bbox.y2 * heightFactor,
    "img"
  );
}

/**
 * Converts a BoundingBox to XML space using width and height factors.
 * @param bbox - The BoundingBox to convert.
 * @param widthFactor - The scaling factor for width.
 * @param heightFactor - The scaling factor for height.
 * @returns A new BoundingBox instance in XML space.
 */
export function getInXmlSpace(
  bbox: RectangleRegion,
  widthFactor: number,
  heightFactor: number,
): RectangleRegion {
  if (bbox.space === "img") {
    return new RectangleRegion(
      bbox.x1 / widthFactor,
      bbox.y1 / heightFactor,
      bbox.x2 / widthFactor,
      bbox.y2 / heightFactor,
      "xml"
    );
  }
  return bbox;
}
