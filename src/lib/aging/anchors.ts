import { Point2D } from './types';

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
