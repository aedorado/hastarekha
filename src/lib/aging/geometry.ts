import { Point2D, ScreenDimensions } from './types';

/**
 * Calculates total arc length along a 2D polyline in true isometric physical screen space.
 * When dimensions are provided (or fallback 600x600), converts percentage deltas to screen pixels,
 * preventing widescreen aspect-ratio distortions.
 */
export function calculatePolylineLength(
  points: Point2D[],
  dimensions?: ScreenDimensions | DOMRect | null
): number {
  if (points.length < 2) return 0;
  const W = dimensions?.width && dimensions.width > 0 ? dimensions.width : 600;
  const H = dimensions?.height && dimensions.height > 0 ? dimensions.height : 600;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = ((points[i].x - points[i - 1].x) * W) / 100;
    const dy = ((points[i].y - points[i - 1].y) * H) / 100;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/**
 * Finds the coordinates, unit normal, and unit tangent at a given fraction t (0..1) along a polyline.
 * Uses true physical isometric space so ticks are strictly 90° perpendicular on screen
 * and fractions represent strictly equal physical divisions along the hand.
 */
export function getPointAndNormalAtFraction(
  points: Point2D[],
  fraction: number,
  dimensions?: ScreenDimensions | DOMRect | null
): { point: Point2D; normal: Point2D; tangent: Point2D } | null {
  if (points.length < 2) return null;
  const clampedFraction = Math.max(0, Math.min(1, fraction));
  const W = dimensions?.width && dimensions.width > 0 ? dimensions.width : 600;
  const H = dimensions?.height && dimensions.height > 0 ? dimensions.height : 600;

  const totalLength = calculatePolylineLength(points, dimensions);
  if (totalLength <= 0) return null;

  const targetDist = clampedFraction * totalLength;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dx = ((p2.x - p1.x) * W) / 100;
    const dy = ((p2.y - p1.y) * H) / 100;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (segLen === 0) continue;

    if (accumulated + segLen >= targetDist || i === points.length - 1) {
      const segT = (targetDist - accumulated) / segLen;
      const clampedSegT = Math.max(0, Math.min(1, segT));

      const point: Point2D = {
        x: p1.x + (p2.x - p1.x) * clampedSegT,
        y: p1.y + (p2.y - p1.y) * clampedSegT,
      };

      // Physical screen tangent (unit vector in pixels)
      const tangentPx = {
        x: dx / segLen,
        y: dy / segLen,
      };

      // Physical screen normal (strictly perpendicular: -dy, dx)
      const normalPx = {
        x: -tangentPx.y,
        y: tangentPx.x,
      };

      // Map normal back to SVG % space so rendered stroke has uniform length & true 90° angle
      const normal: Point2D = {
        x: (normalPx.x / W) * 600,
        y: (normalPx.y / H) * 600,
      };

      const tangent: Point2D = {
        x: (tangentPx.x / W) * 600,
        y: (tangentPx.y / H) * 600,
      };

      return { point, normal, tangent };
    }

    accumulated += segLen;
  }

  // Fallback to end
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  const dx = ((last.x - secondLast.x) * W) / 100;
  const dy = ((last.y - secondLast.y) * H) / 100;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const tangentPx = { x: dx / len, y: dy / len };
  const normalPx = { x: -tangentPx.y, y: tangentPx.x };

  return {
    point: { ...last },
    tangent: { x: (tangentPx.x / W) * 600, y: (tangentPx.y / H) * 600 },
    normal: { x: (normalPx.x / W) * 600, y: (normalPx.y / H) * 600 },
  };
}

/**
 * Computes the exact 50% midpoint (Maṇibandha Kendra - मध्यबिन्दु) of a traced wrist crease.
 * Used as the classical anchor for Age 75 (Life Line) and Age 0 (Fate Line).
 */
export function getManibandhaMidpoint(
  points: Point2D[],
  dimensions?: ScreenDimensions | DOMRect | null
): {
  midpoint: Point2D;
  normal: Point2D;
  tangent: Point2D;
  length: number;
} | null {
  if (!points || points.length < 2) return null;
  const geom = getPointAndNormalAtFraction(points, 0.5, dimensions);
  if (!geom) return null;
  const length = calculatePolylineLength(points, dimensions);
  return {
    midpoint: geom.point,
    normal: geom.normal,
    tangent: geom.tangent,
    length,
  };
}

/**
 * Finds the nearest point along a polyline to an arbitrary {x, y} coordinate,
 * returning the closest point, fraction t (0..1), and Euclidean distance.
 */
export function getNearestPointOnPolyline(
  points: Point2D[],
  target: Point2D,
  dimensions?: ScreenDimensions | DOMRect | null
): { point: Point2D; fraction: number; distance: number } | null {
  if (points.length < 2) return null;

  const W = dimensions?.width && dimensions.width > 0 ? dimensions.width : 600;
  const H = dimensions?.height && dimensions.height > 0 ? dimensions.height : 600;

  const totalLength = calculatePolylineLength(points, dimensions);
  if (totalLength <= 0) return null;

  let minDistance = Infinity;
  let bestPoint: Point2D = { ...points[0] };
  let bestDistAlongPolyline = 0;
  let accumulatedDist = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dxPx = ((p2.x - p1.x) * W) / 100;
    const dyPx = ((p2.y - p1.y) * H) / 100;
    const targetDxPx = ((target.x - p1.x) * W) / 100;
    const targetDyPx = ((target.y - p1.y) * H) / 100;

    const segLenSq = dxPx * dxPx + dyPx * dyPx;
    const segLen = Math.sqrt(segLenSq);

    if (segLen === 0) continue;

    // Project target onto segment p1->p2 in isometric pixel coordinates
    const u = (targetDxPx * dxPx + targetDyPx * dyPx) / segLenSq;
    const clampedU = Math.max(0, Math.min(1, u));

    const projX = p1.x + clampedU * (p2.x - p1.x);
    const projY = p1.y + clampedU * (p2.y - p1.y);

    const distToTarget = Math.sqrt(
      Math.pow(((target.x - projX) * W) / 100, 2) +
      Math.pow(((target.y - projY) * H) / 100, 2)
    );

    if (distToTarget < minDistance) {
      minDistance = distToTarget;
      bestPoint = { x: projX, y: projY };
      bestDistAlongPolyline = accumulatedDist + clampedU * segLen;
    }

    accumulatedDist += segLen;
  }

  return {
    point: bestPoint,
    fraction: Math.max(0, Math.min(1, bestDistAlongPolyline / totalLength)),
    distance: minDistance,
  };
}
