/**
 * Hasta Sāmudrika Śāstra – Aging Calculation Engine
 * 
 * Implements classical and contemporary Vedic aging systems taught in Lectures 20, 22, and 27:
 * 1. 30-Midpoint Method (Madhyabindu 30 Paddhati - Class Standard)
 * 2. Cheiro's 7-Year Method (Saptāṁśa Paddhati - 98/100 years, 14 parts)
 * 3. Old Indian 6-Year Method (Ṣaḍaṁśa Paddhati - 70/72 years, 12 parts)
 * 4. Three-Line Average Method (Tritattva Sarmāna - 100 years per line, composite average)
 * 5. 18+6 Cadence Method (Hṛdaya/Mastiska Krama - Heart & Head Lines)
 */

export type AgingMethod =
  | '30-midpoint'
  | 'cheiro-98'
  | 'shadamsha-72'
  | 'three-line-avg'
  | '18-6-cadence';

export type LineCategory =
  | 'line_life'
  | 'line_fate'
  | 'line_head'
  | 'line_heart'
  | 'line_sun'
  | 'line_mercury'
  | 'line_manibandha'
  | 'other';

export interface Point2D {
  x: number;
  y: number;
}

export interface AgeTick {
  age: number;
  fraction: number; // 0..1 along polyline
  point: Point2D; // {x, y} in % space (0..100)
  normal: Point2D; // Perpendicular unit vector
  label: string;
  isMajor: boolean;
  method: AgingMethod;
  color: string;
  description?: string;
}

export interface AgingMethodInfo {
  id: AgingMethod;
  title: string;
  sanskritName: string;
  defaultLifespan: number;
  description: string;
  lectureReference: string;
  color: string;
  applicableLines: LineCategory[];
}

export const AGING_METHODS: Record<AgingMethod, AgingMethodInfo> = {
  '30-midpoint': {
    id: '30-midpoint',
    title: '30-Midpoint Method',
    sanskritName: 'Madhyabindu 30 Paddhati (मध्यबिन्दु पद्धति)',
    defaultLifespan: 75,
    description:
      'Current live class standard. Life/Fate Line midpoint = 30. Lower half (30→75) repeatedly halved: 52.5, 41.25, 47, 63.75. Upper half halved: 15.',
    lectureReference: 'Lecture 20 §5, Lecture 27 §5',
    color: '#d97706', // amber-600
    applicableLines: ['line_life', 'line_fate'],
  },
  'cheiro-98': {
    id: 'cheiro-98',
    title: "Cheiro's 7-Year Scale",
    sanskritName: 'Saptāṁśa Paddhati (सप्तांश पद्धति)',
    defaultLifespan: 98,
    description:
      'Cheiro research method. Total lifespan taken as 98 (divided into 14 equal parts of 7 years: 7, 14, 21... 98). Maximum prediction horizon 7 years.',
    lectureReference: 'Lecture 27 §3',
    color: '#2563eb', // blue-600
    applicableLines: ['line_life', 'line_heart'],
  },
  'shadamsha-72': {
    id: 'shadamsha-72',
    title: 'Old Indian 6-Year Scale',
    sanskritName: 'Ṣaḍaṁśa Paddhati (षडांश पद्धति)',
    defaultLifespan: 72,
    description:
      'Classical Indian method. Lifespan of 70-72 divided into 12 equal parts of 6 years (6, 12, 18, 24... 72). Traditionally read on Heart Line, later Life Line.',
    lectureReference: 'Lecture 27 §2',
    color: '#9333ea', // purple-600
    applicableLines: ['line_life', 'line_heart'],
  },
  'three-line-avg': {
    id: 'three-line-avg',
    title: 'Three-Line Average Method',
    sanskritName: 'Tritattva Sarmāna (त्रितत्त्व सरमान)',
    defaultLifespan: 100,
    description:
      'Life Line, Head Line, and Heart Line each scaled to 100 years. Average of all three lines gives composite age milestone estimation.',
    lectureReference: 'Lecture 27 §4',
    color: '#0d9488', // teal-600
    applicableLines: ['line_life', 'line_head', 'line_heart'],
  },
  '18-6-cadence': {
    id: '18-6-cadence',
    title: '18 + 6 Cadence Method',
    sanskritName: 'Hṛdaya/Mastiska Krama (हृदय/मस्तिष्क क्रम)',
    defaultLifespan: 70,
    description:
      'Heart & Head Line method. Blocks of 18 active years separated by 6-year transition gaps (18, 24, 42, 48, 66, 72). Up to age ~50-70.',
    lectureReference: 'Lecture 27 §6, §7',
    color: '#e11d48', // rose-600
    applicableLines: ['line_heart', 'line_head'],
  },
};

export const LINE_LABELS: Record<LineCategory, string> = {
  line_life: 'Life Line (Āyur Rekhā)',
  line_fate: 'Fate Line (Bhāgya Rekhā)',
  line_head: 'Head Line (Mastiska Rekhā)',
  line_heart: 'Heart Line (Hṛdaya Rekhā)',
  line_sun: 'Sun Line (Sūrya Rekhā)',
  line_mercury: 'Mercury Line (Budha Rekhā)',
  line_manibandha: 'Wrist Crease (Maṇibandha Rekhā)',
  other: 'Other Crease',
};

/**
 * Calculates total arc length along a 2D polyline in % coordinate space.
 */
export function calculatePolylineLength(points: Point2D[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
}

/**
 * Computes the exact 50% midpoint (Maṇibandha Kendra - मध्यबिन्दु) of a traced wrist crease.
 * Used as the classical anchor for Age 75 (Life Line) and Age 0 (Fate Line).
 */
export function getManibandhaMidpoint(points: Point2D[]): {
  midpoint: Point2D;
  normal: Point2D;
  tangent: Point2D;
  length: number;
} | null {
  if (!points || points.length < 2) return null;
  const geom = getPointAndNormalAtFraction(points, 0.5);
  if (!geom) return null;
  const length = calculatePolylineLength(points);
  return {
    midpoint: geom.point,
    normal: geom.normal,
    tangent: geom.tangent,
    length,
  };
}

/**
 * Finds the coordinates, unit normal, and unit tangent at a given fraction t (0..1) along a polyline.
 */
export function getPointAndNormalAtFraction(
  points: Point2D[],
  fraction: number
): { point: Point2D; normal: Point2D; tangent: Point2D } | null {
  if (points.length < 2) return null;
  const clampedFraction = Math.max(0, Math.min(1, fraction));
  const totalLength = calculatePolylineLength(points);
  if (totalLength <= 0) return null;

  const targetDist = clampedFraction * totalLength;
  let accumulated = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    if (segLen === 0) continue;

    if (accumulated + segLen >= targetDist || i === points.length - 1) {
      const segT = (targetDist - accumulated) / segLen;
      const clampedSegT = Math.max(0, Math.min(1, segT));

      const point: Point2D = {
        x: p1.x + dx * clampedSegT,
        y: p1.y + dy * clampedSegT,
      };

      const tangent: Point2D = {
        x: dx / segLen,
        y: dy / segLen,
      };

      // Perpendicular normal: (-dy, dx)
      const normal: Point2D = {
        x: -tangent.y,
        y: tangent.x,
      };

      return { point, normal, tangent };
    }

    accumulated += segLen;
  }

  // Fallback to end
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  const dx = last.x - secondLast.x;
  const dy = last.y - secondLast.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    point: { ...last },
    tangent: { x: dx / len, y: dy / len },
    normal: { x: -dy / len, y: dx / len },
  };
}

/**
 * Maps a chronological age to fraction t (0..1) along polyline for a chosen method.
 */
export function getFractionForAge(
  method: AgingMethod,
  age: number,
  lineCategory: LineCategory,
  maxAge = 75
): number {
  if (age <= 0) return 0;

  switch (method) {
    case '30-midpoint': {
      // 0..30 maps to 0..0.5
      // 30..maxAge maps to 0.5..1.0
      if (age <= 30) {
        return (age / 30) * 0.5;
      }
      const span = Math.max(1, maxAge - 30);
      const fracInUpper = Math.min(1, (age - 30) / span);
      return 0.5 + fracInUpper * 0.5;
    }

    case 'cheiro-98': {
      return Math.min(1, age / 98);
    }

    case 'shadamsha-72': {
      return Math.min(1, age / 72);
    }

    case 'three-line-avg': {
      return Math.min(1, age / 100);
    }

    case '18-6-cadence': {
      // 18+6 cadence cycles: 18 active, 6 gap
      const cycleLength = 24; // 18 + 6
      const cycleFrac = 0.333; // 3 full cycles approx fit in normal hand span
      const numCycles = age / cycleLength;
      return Math.min(1, numCycles * cycleFrac);
    }

    default:
      return Math.min(1, age / maxAge);
  }
}

/**
 * Computes chronological age given a fraction t (0..1) along polyline for a chosen method.
 */
export function getAgeForFraction(
  method: AgingMethod,
  fraction: number,
  lineCategory: LineCategory,
  maxAge = 75
): number {
  const t = Math.max(0, Math.min(1, fraction));

  switch (method) {
    case '30-midpoint': {
      if (t <= 0.5) {
        // First half = 0 to 30 years
        return parseFloat(((t / 0.5) * 30).toFixed(1));
      } else {
        // Second half = 30 to maxAge years
        const upperT = (t - 0.5) / 0.5;
        return parseFloat((30 + upperT * (maxAge - 30)).toFixed(1));
      }
    }

    case 'cheiro-98': {
      return parseFloat((t * 98).toFixed(1));
    }

    case 'shadamsha-72': {
      return parseFloat((t * 72).toFixed(1));
    }

    case 'three-line-avg': {
      return parseFloat((t * 100).toFixed(1));
    }

    case '18-6-cadence': {
      // Approx 3 full 24-year cycles (72 yrs)
      return parseFloat((t * 72).toFixed(1));
    }

    default:
      return parseFloat((t * maxAge).toFixed(1));
  }
}

/**
 * Generates all classical age ticks with 2D coordinates and normal vectors along the line.
 */
export function computeAgeTicks(
  points: Point2D[],
  method: AgingMethod,
  lineCategory: LineCategory = 'line_life',
  maxAge = 75
): AgeTick[] {
  if (points.length < 2) return [];

  const ticks: AgeTick[] = [];
  const methodInfo = AGING_METHODS[method];

  switch (method) {
    case '30-midpoint': {
      // Arvind Ji's exact construction from Lecture 20 & 27:
      // Ticks: 0 (Start), 15 (1/4), 30 (Midpoint), 41.25, 47, 52.5, 63.75, 75 (End)
      // When applied to Fate Line: upper section has 42, 46, 49 (Heart crossing), 55, 75/80.
      const milestones: Array<{
        age: number;
        fraction: number;
        isMajor: boolean;
        desc?: string;
      }> = [
          { age: 0, fraction: 0, isMajor: true, desc: 'Birth / Origin' },
          { age: 15, fraction: 0.25, isMajor: false, desc: 'Youth (¼ point)' },
          { age: 30, fraction: 0.5, isMajor: true, desc: 'Midpoint (Fixed 30)' },
        ];

      if (lineCategory === 'line_fate') {
        // Fate line timings (Lecture 22 §7, Lecture 27 §5)
        milestones.push(
          { age: 42, fraction: 0.625, isMajor: false, desc: 'First career consolidation' },
          { age: 46, fraction: 0.6875, isMajor: false, desc: 'Mid-career expansion' },
          { age: 49, fraction: 0.75, isMajor: true, desc: 'Heart line crossing zone' },
          { age: 55, fraction: 0.833, isMajor: false, desc: 'Late zenith' },
          { age: maxAge, fraction: 1.0, isMajor: true, desc: 'Saturn mount terminus' }
        );
      } else {
        // Life line timings (Arvind Ji drawing):
        // 52.5 = midpoint of (30, 75) -> fraction 0.75
        // 41.25 = midpoint of (30, 52.5) -> fraction 0.625
        // 46.875 ≈ 47 = midpoint of (41.25, 52.5) -> fraction 0.6875
        // 63.75 = midpoint of (52.5, 75) -> fraction 0.875
        const halfSpan = (maxAge - 30) / 2;
        const quarterSpan = halfSpan / 2;
        const p52_5 = 30 + halfSpan; // 52.5
        const p41_25 = 30 + quarterSpan; // 41.25
        const p47 = (p41_25 + p52_5) / 2; // ~46.9
        const p63_75 = p52_5 + quarterSpan; // 63.75

        milestones.push(
          { age: parseFloat(p41_25.toFixed(1)), fraction: 0.625, isMajor: false, desc: 'Quarter 1 post-30' },
          { age: Math.round(p47), fraction: 0.6875, isMajor: false, desc: 'Subdivision (Arvind Ji)' },
          { age: parseFloat(p52_5.toFixed(1)), fraction: 0.75, isMajor: true, desc: 'Three-quarter mark' },
          { age: parseFloat(p63_75.toFixed(1)), fraction: 0.875, isMajor: false, desc: 'Upper maturity' },
          { age: maxAge, fraction: 1.0, isMajor: true, desc: `Base scale (${maxAge} yrs)` }
        );
      }

      for (const m of milestones) {
        const geom = getPointAndNormalAtFraction(points, m.fraction);
        if (geom) {
          ticks.push({
            age: m.age,
            fraction: m.fraction,
            point: geom.point,
            normal: geom.normal,
            label: `${m.age}`,
            isMajor: m.isMajor,
            method: '30-midpoint',
            color: methodInfo.color,
            description: m.desc,
          });
        }
      }
      break;
    }

    case 'cheiro-98': {
      // 14 equal parts, 7 years each (Lecture 27 §3)
      for (let i = 1; i <= 14; i++) {
        const age = i * 7;
        const fraction = i / 14;
        const geom = getPointAndNormalAtFraction(points, fraction);
        if (geom) {
          ticks.push({
            age,
            fraction,
            point: geom.point,
            normal: geom.normal,
            label: `${age}`,
            isMajor: i % 2 === 0 || i === 14,
            method: 'cheiro-98',
            color: methodInfo.color,
            description: `Part ${i} (Cheiro 7-yr scale)`,
          });
        }
      }
      break;
    }

    case 'shadamsha-72': {
      // 12 equal parts, 6 years each (Lecture 27 §2)
      for (let i = 1; i <= 12; i++) {
        const age = i * 6;
        const fraction = i / 12;
        const geom = getPointAndNormalAtFraction(points, fraction);
        if (geom) {
          ticks.push({
            age,
            fraction,
            point: geom.point,
            normal: geom.normal,
            label: `${age}`,
            isMajor: age === 30 || age === 36 || age === 72,
            method: 'shadamsha-72',
            color: methodInfo.color,
            description: `Part ${i} (Ṣaḍaṁśa 6-yr scale)`,
          });
        }
      }
      break;
    }

    case 'three-line-avg': {
      // 10-year major intervals across 100 years
      for (let age = 10; age <= 100; age += 10) {
        const fraction = age / 100;
        const geom = getPointAndNormalAtFraction(points, fraction);
        if (geom) {
          ticks.push({
            age,
            fraction,
            point: geom.point,
            normal: geom.normal,
            label: `${age}`,
            isMajor: age === 50 || age === 100,
            method: 'three-line-avg',
            color: methodInfo.color,
            description: `${age}% scale marker`,
          });
        }
      }
      break;
    }

    case '18-6-cadence': {
      // 18+6 cadence: 18, 24, 42, 48, 66, 72 (Lecture 27 §6)
      // Represented over line span
      const cadenceMilestones: Array<{ age: number; isMajor: boolean; desc: string }> = [
        { age: 18, isMajor: true, desc: 'End of 1st 18-yr block' },
        { age: 24, isMajor: false, desc: 'End of 1st 6-yr transition gap' },
        { age: 42, isMajor: true, desc: 'End of 2nd 18-yr block' },
        { age: 48, isMajor: false, desc: 'End of 2nd 6-yr transition gap' },
        { age: 66, isMajor: true, desc: 'End of 3rd 18-yr block' },
        { age: 72, isMajor: false, desc: 'End of 3rd 6-yr transition gap' },
      ];

      const maxCadence = 72;
      for (const cm of cadenceMilestones) {
        const fraction = cm.age / maxCadence;
        if (fraction <= 1.0) {
          const geom = getPointAndNormalAtFraction(points, fraction);
          if (geom) {
            ticks.push({
              age: cm.age,
              fraction,
              point: geom.point,
              normal: geom.normal,
              label: `${cm.age}`,
              isMajor: cm.isMajor,
              method: '18-6-cadence',
              color: methodInfo.color,
              description: cm.desc,
            });
          }
        }
      }
      break;
    }
  }

  return ticks;
}

/**
 * Finds the nearest point along a polyline to an arbitrary {x, y} coordinate,
 * returning the closest point, fraction t (0..1), and Euclidean distance.
 */
export function getNearestPointOnPolyline(
  points: Point2D[],
  target: Point2D
): { point: Point2D; fraction: number; distance: number } | null {
  if (points.length < 2) return null;

  const totalLength = calculatePolylineLength(points);
  if (totalLength <= 0) return null;

  let minDistance = Infinity;
  let bestPoint: Point2D = { ...points[0] };
  let bestDistAlongPolyline = 0;
  let accumulatedDist = 0;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLenSq = dx * dx + dy * dy;
    const segLen = Math.sqrt(segLenSq);

    if (segLen === 0) continue;

    // Project target onto segment p1->p2
    const u = ((target.x - p1.x) * dx + (target.y - p1.y) * dy) / segLenSq;
    const clampedU = Math.max(0, Math.min(1, u));

    const projX = p1.x + clampedU * dx;
    const projY = p1.y + clampedU * dy;
    const distToTarget = Math.sqrt(
      Math.pow(target.x - projX, 2) + Math.pow(target.y - projY, 2)
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
