import {
  Point2D,
  AgingMethod,
  LineCategory,
  AgeTick,
  ScreenDimensions,
  AGING_METHODS,
} from './types';
import { getPointAndNormalAtFraction } from './geometry';

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
