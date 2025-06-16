/**
 * Utility functions for converting between different window positioning systems
 */

/**
 * Convert center-based position (used by 3D desktop) to top-left position (used by legacy desktop)
 */
export function centerToTopLeft(
  centerPosition: { x: number; y: number },
  size: { width: number | string; height: number | string }
): { x: number; y: number } {
  const width = typeof size.width === "number" ? size.width : parseInt(size.width as string);
  const height = typeof size.height === "number" ? size.height : parseInt(size.height as string);
  
  return {
    x: centerPosition.x - width / 2,
    y: centerPosition.y - height / 2,
  };
}

/**
 * Convert top-left position (used by legacy desktop) to center-based position (used by 3D desktop)
 */
export function topLeftToCenter(
  topLeftPosition: { x: number; y: number },
  size: { width: number | string; height: number | string }
): { x: number; y: number } {
  const width = typeof size.width === "number" ? size.width : parseInt(size.width as string);
  const height = typeof size.height === "number" ? size.height : parseInt(size.height as string);
  
  return {
    x: topLeftPosition.x + width / 2,
    y: topLeftPosition.y + height / 2,
  };
}
