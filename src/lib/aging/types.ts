/**
 * Types and registries for Vedic aging calculation methods.
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

export interface ScreenDimensions {
  width: number;
  height: number;
}

export const CADENCE_AGES = [0, 18, 24, 42, 48, 66, 72, 90] as const;
export type CadenceAge = (typeof CADENCE_AGES)[number];

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
