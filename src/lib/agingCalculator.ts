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
  | '18-6-cadence'
  | 'mercury-56';

export type LineCategory =
  | 'line_life'
  | 'line_fate'
  | 'line_head'
  | 'line_heart'
  | 'line_sun'
  | 'line_mercury'
  | 'line_marriage'
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
    applicableLines: ['line_life', 'line_heart', 'line_fate', 'line_head'],
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
    applicableLines: ['line_life', 'line_heart', 'line_fate', 'line_head'],
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
    defaultLifespan: 90,
    description:
      'Heart Line finger base method (Lecture 27 §6). 8 finger base points (0, 18, 24, 42, 48, 66, 72, 90) projecting downward straight lines to date event intersections along the Heart Line.',
    lectureReference: 'Lecture 27 §6, §7',
    color: '#e11d48', // rose-600
    applicableLines: ['line_heart', 'line_head'],
  },
  'mercury-56': {
    id: 'mercury-56',
    title: 'Mercury Mount (Marriage 50 / 56-Year Scale)',
    sanskritName: 'Budha Vivāha Kāla (बुध विवाह काल)',
    defaultLifespan: 56,
    description:
      'Lecture 28 §4.2: Mercury mount timing scale for Vivāha Rekhā. Heart Line level = 0 years; base joint of Mercury finger (sandhi rekhā) = 50 or 56 years. Midpoint ≈ 25 / 28 years.',
    lectureReference: 'Lecture 28 §4.2',
    color: '#ec4899', // pink-500
    applicableLines: ['line_marriage'],
  },
};

export const CADENCE_AGES = [0, 18, 24, 42, 48, 66, 72, 90] as const;
export type CadenceAge = (typeof CADENCE_AGES)[number];

export const getDefaultCadencePoints = (isRightPalm: boolean): Point2D[] => {
  if (isRightPalm) {
    // Right palm: Pinky (Mercury) on right (x ~79), Index (Jupiter) on left (x ~26)
    return [
      { x: 79, y: 29 }, // Age 0: Percussion edge under Mercury
      { x: 71, y: 22 }, // Age 18: Mercury/Sun cleft
      { x: 64, y: 20 }, // Age 24: Sun base crease
      { x: 55, y: 18 }, // Age 42: Sun/Saturn cleft
      { x: 48, y: 18 }, // Age 48: Saturn base crease
      { x: 40, y: 19 }, // Age 66: Saturn/Jupiter cleft
      { x: 34, y: 21 }, // Age 72: Jupiter base crease
      { x: 26, y: 25 }, // Age 90: Jupiter radial edge
    ];
  } else {
    // Left palm: Pinky (Mercury) on left (x ~21), Index (Jupiter) on right (x ~74)
    return [
      { x: 21, y: 29 }, // Age 0: Percussion edge under Mercury
      { x: 29, y: 22 }, // Age 18: Mercury/Sun cleft
      { x: 36, y: 20 }, // Age 24: Sun base crease
      { x: 45, y: 18 }, // Age 42: Sun/Saturn cleft
      { x: 52, y: 18 }, // Age 48: Saturn base crease
      { x: 60, y: 19 }, // Age 66: Saturn/Jupiter cleft
      { x: 66, y: 21 }, // Age 72: Jupiter base crease
      { x: 74, y: 25 }, // Age 90: Jupiter radial edge
    ];
  }
};

export const getDefault30MidpointAnchors = (isRightPalm: boolean): {
  manibandha_start: Point2D;
  manibandha_end: Point2D;
  life_start: Point2D;
  mercury_sandhi: Point2D;
  saturn_root: Point2D;
} => {
  if (isRightPalm) {
    return {
      manibandha_start: { x: 42, y: 92 },
      manibandha_end: { x: 62, y: 92 },
      life_start: { x: 38, y: 48 },
      mercury_sandhi: { x: 86, y: 48 },
      saturn_root: { x: 52, y: 35 },
    };
  } else {
    return {
      manibandha_start: { x: 28, y: 92 },
      manibandha_end: { x: 48, y: 92 },
      life_start: { x: 62, y: 48 },
      mercury_sandhi: { x: 14, y: 48 },
      saturn_root: { x: 38, y: 35 },
    };
  }
};

export const getDefaultMercury56Anchors = (isRightPalm: boolean): {
  mercury_heart_level: Point2D;
  mercury_base: Point2D;
} => {
  if (isRightPalm) {
    return {
      mercury_heart_level: { x: 80, y: 38 },
      mercury_base: { x: 77, y: 22 },
    };
  } else {
    return {
      mercury_heart_level: { x: 17, y: 38 },
      mercury_base: { x: 20, y: 22 },
    };
  }
};

export const getDefaultThreeLineAvgPaths = (
  isRightPalm: boolean,
  wristMidpoint?: Point2D | null
): { life: Point2D[]; heart: Point2D[]; head: Point2D[] } => {
  if (isRightPalm) {
    const mk = wristMidpoint || { x: 52, y: 92 };
    return {
      // Life Line: from thumb origin (0y) around Venus to wrist center (100y)
      life: [
        { x: 38, y: 48 },
        { x: 40, y: 56 },
        { x: 43, y: 66 },
        { x: 47, y: 78 },
        { x: mk.x, y: mk.y },
      ],
      // Heart Line: from ulnar percussion (0y) across to opposite radial edge under Jupiter (100y)
      heart: [
        { x: 82, y: 38 },
        { x: 68, y: 38 },
        { x: 54, y: 39 },
        { x: 40, y: 38 },
        { x: 26, y: 35 },
      ],
      // Mind Line: from radial origin (0y) across to opposite Moon mount percussion (100y)
      head: [
        { x: 37, y: 49 },
        { x: 49, y: 55 },
        { x: 62, y: 61 },
        { x: 74, y: 65 },
        { x: 84, y: 67 },
      ],
    };
  } else {
    const mk = wristMidpoint || { x: 38, y: 92 };
    return {
      // Life Line: from thumb origin (0y) around Venus to wrist center (100y)
      life: [
        { x: 62, y: 48 },
        { x: 60, y: 56 },
        { x: 57, y: 66 },
        { x: 53, y: 78 },
        { x: mk.x, y: mk.y },
      ],
      // Heart Line: from ulnar percussion (0y) across to opposite radial edge under Jupiter (100y)
      heart: [
        { x: 18, y: 38 },
        { x: 32, y: 38 },
        { x: 46, y: 39 },
        { x: 60, y: 38 },
        { x: 74, y: 35 },
      ],
      // Mind Line: from radial origin (0y) across to opposite Moon mount percussion (100y)
      head: [
        { x: 63, y: 49 },
        { x: 51, y: 55 },
        { x: 38, y: 61 },
        { x: 26, y: 65 },
        { x: 16, y: 67 },
      ],
    };
  }
};

export function calculateThreeLineAverage(
  lifeAge: number | null | undefined,
  heartAge: number | null | undefined,
  headAge: number | null | undefined
): {
  sum: number;
  average: number;
  rangeText: string;
  count: number;
} | null {
  const valid = [
    { name: 'life', age: lifeAge },
    { name: 'heart', age: heartAge },
    { name: 'head', age: headAge },
  ].filter((item) => item.age !== null && item.age !== undefined && !isNaN(item.age) && item.age > 0);

  if (valid.length === 0) return null;
  const sum = valid.reduce((acc, curr) => acc + (curr.age as number), 0);
  const average = Math.round(sum / valid.length);
  const rangeText = `${average} to ${average + 2} yrs`;
  return { sum, average, rangeText, count: valid.length };
}

export const LINE_LABELS: Record<LineCategory, string> = {
  line_life: 'Life Line (Āyur Rekhā)',
  line_fate: 'Fate Line (Bhāgya Rekhā)',
  line_head: 'Head Line (Mastiska Rekhā)',
  line_heart: 'Heart Line (Hṛdaya Rekhā)',
  line_sun: 'Sun Line (Sūrya Rekhā)',
  line_mercury: 'Mercury Line (Budha Rekhā)',
  line_marriage: 'Marriage Line (Vivāha Rekhā / Śīla-guṇa Rekhā)',
  line_manibandha: 'Maṇibandha Rekhā (मणिबन्ध)',
  other: 'Other Crease',
};

export interface ScreenDimensions {
  width: number;
  height: number;
}

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

    case 'mercury-56': {
      return Math.min(1, age / (maxAge === 50 ? 50 : 56));
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

    case 'mercury-56': {
      return parseFloat((t * (maxAge === 50 ? 50 : 56)).toFixed(1));
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
  maxAge = 75,
  dimensions?: ScreenDimensions | DOMRect | null
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
        const geom = getPointAndNormalAtFraction(points, m.fraction, dimensions);
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
        const geom = getPointAndNormalAtFraction(points, fraction, dimensions);
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
        const geom = getPointAndNormalAtFraction(points, fraction, dimensions);
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
        const geom = getPointAndNormalAtFraction(points, fraction, dimensions);
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
      // 18+6 cadence milestones: 0, 18, 24, 42, 48, 66, 72, 90 (Lecture 27 §6)
      const cadenceMilestones: Array<{ age: number; isMajor: boolean; desc: string }> = [
        { age: 0, isMajor: false, desc: 'Percussion edge under Mercury (Age 0)' },
        { age: 18, isMajor: true, desc: 'End of 1st 18-yr block' },
        { age: 24, isMajor: false, desc: 'End of 1st 6-yr transition gap' },
        { age: 42, isMajor: true, desc: 'End of 2nd 18-yr block' },
        { age: 48, isMajor: false, desc: 'End of 2nd 6-yr transition gap' },
        { age: 66, isMajor: true, desc: 'End of 3rd 18-yr block' },
        { age: 72, isMajor: false, desc: 'End of 3rd 6-yr transition gap' },
        { age: 90, isMajor: true, desc: 'End of 4th 18-yr block (Jupiter base)' },
      ];

      const maxCadence = 90;
      for (const cm of cadenceMilestones) {
        const fraction = cm.age / maxCadence;
        if (fraction <= 1.0) {
          const geom = getPointAndNormalAtFraction(points, fraction, dimensions);
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

    case 'mercury-56': {
      // Lecture 28 §4.2: Mercury Mount scale (0 to 56 years)
      // Only applicable to Marriage lines or Mercury lines across the mount, NOT Heart Line!
      if (lineCategory !== 'line_marriage' && lineCategory !== 'line_mercury') {
        break;
      }

      // Heart Line level = 0, Mercury base joint = 56. Midpoint ≈ 28.
      const milestones: Array<{ age: number; fraction: number; isMajor: boolean; desc: string }> = [
        { age: 0, fraction: 0, isMajor: true, desc: 'Heart Line Level (Age 0)' },
        { age: 14, fraction: 0.25, isMajor: false, desc: 'Quarter Mark (Age 14)' },
        { age: 21, fraction: 21 / 56, isMajor: false, desc: 'Early Twenties (Age 21)' },
        { age: 28, fraction: 0.5, isMajor: true, desc: 'Midpoint (Age 28 - Classic Mid)' },
        { age: 35, fraction: 35 / 56, isMajor: false, desc: 'Mid Thirties (Age 35)' },
        { age: 42, fraction: 0.75, isMajor: true, desc: 'Three-Quarter Mark (Age 42)' },
        { age: 49, fraction: 49 / 56, isMajor: false, desc: 'Late Forties (Age 49)' },
        { age: 56, fraction: 1.0, isMajor: true, desc: 'Mercury Finger Base Crease (Age 56)' },
      ];

      for (const m of milestones) {
        const geom = getPointAndNormalAtFraction(points, m.fraction, dimensions);
        if (geom) {
          ticks.push({
            age: m.age,
            fraction: m.fraction,
            point: geom.point,
            normal: geom.normal,
            label: `${m.age}`,
            isMajor: m.isMajor,
            method: 'mercury-56',
            color: methodInfo.color,
            description: m.desc,
          });
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
