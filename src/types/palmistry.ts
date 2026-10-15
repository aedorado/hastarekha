export type HandView = 'right_palm' | 'right_back' | 'left_palm' | 'left_back' | 'd1_chart';

export const HAND_VIEW_LABELS: Record<HandView, string> = {
  right_palm: 'Right Palm (Front)',
  right_back: 'Right Hand (Back)',
  left_palm: 'Left Palm (Front)',
  left_back: 'Left Hand (Back)',
  d1_chart: 'D-1 Rasi Chart',
};

export interface Pin {
  id: string;
  view: HandView;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  description: string;
  color: string;
}

export interface Drawing {
  id: string;
  view: HandView;
  points: Array<{ x: number; y: number }>;
  color: string;
  thickness: number;
  label?: string;
  lineCategory?: 'line_life' | 'line_fate' | 'line_head' | 'line_heart' | 'line_sun' | 'line_mercury' | 'line_marriage' | 'line_manibandha' | 'other';
}

// ─── Mount sign type ───
export interface MountSignData {
  height: 'Raised' | 'Normal' | 'Flat' | 'Very High / Overbuilt' | 'Displaced/Shifted' | '';
  apex: string;
  signs: string[]; // e.g. ['Star', 'Cross', 'Square']
  quality: 'Firm/Healthy' | 'Spongy (poor)' | 'Flat/Pressed' | '';
  notes: string;
}

// ─── Structured line analysis type ───
export interface LineAnalysisData {
  quality: '' | 'Normal' | 'Faint/Thin' | 'Dark/Bleeding' | 'Broken' | 'Wavy/Uneven' | 'Chain-like' | 'Double' | 'Absent';
  origin: string; // free-form origin description
  terminus: string; // which mount / where it ends
  signs: string[]; // signs on the line
  features: string[]; // structural features
  age_events: Array<{ age: number; event: string }>;
  notes: string;
}

// ─── Lecture 28: Marriage Line (Vivāha Rekhā / Śīla-guṇa Rekhā) ───
export interface MarriageLineData {
  quality: '' | 'Normal (Healthy)' | 'Faint/Thin (Detached)' | 'Dark/Heavy (Rigid/Burdened)' | 'Broken Repeatedly' | 'Zigzag' | 'Absent';
  origin?: string; // typically 'Percussion Edge'
  terminus?: string; // typically 'Mercury Mount' or 'Sun Mount'
  formations: string[]; // Upward hook, Vertical cut, Dropping down, Fork at end, Small island, Large island, etc.
  estimated_age: number | ''; // 0–56 scale
  has_parasite_line_on_life: boolean; // parasite line alongside Life line causing domestic stress
  secondary_lines_count: number | ''; // count of faint crush/attraction lines
  venus_line_cutting: boolean; // line from Venus mount cutting marriage line
  reaches_sun_mount: boolean; // reaches sun mount (fame through marriage)
  cuts_sun_mount: boolean; // cuts across sun line/mount (trouble through spouse)
  crosses_heart_line: boolean; // branches or line cutting Heart line (sorrow)
  notes: string;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface ThreeLineAvgAnchor {
  full_path?: Point2D[] | null;       // Full theoretical path (0 to 100 years)
  end_fraction?: number | null;      // 0..1 fraction along full_path where actual line terminates
  end_point?: Point2D | null;        // Point on path where it ends
  age?: number | null;               // Estimated age (e.g. 70, 75, 60)
}

export interface ThreeLineAvgData {
  life?: ThreeLineAvgAnchor | null;
  heart?: ThreeLineAvgAnchor | null;
  head?: ThreeLineAvgAnchor | null;
  final_age?: number | null;
}

export interface AgingCalibrationAnchors {
  manibandha_start?: Point2D | null; // Tap 1: left of wrist bracelet
  manibandha_end?: Point2D | null;   // Tap 2: right of wrist bracelet
  life_start?: Point2D | null;        // Tap 1: thumb side origin (Age 0)
  mercury_sandhi?: Point2D | null;    // Tap 2: outer crease under Mercury finger
  saturn_root?: Point2D | null;       // Tap 1: base joint of middle (Saturn) finger (Age 75)
  cadence_points?: Point2D[] | null;  // 8 points for 18+6 cadence method: [0, 18, 24, 42, 48, 66, 72, 90]
  mercury_heart_level?: Point2D | null; // Tap 1: Heart Line level on outer percussion (Age 0)
  mercury_base?: Point2D | null;        // Tap 2: Root crease under Mercury finger (Age 56)
  three_line_avg?: ThreeLineAvgData | null; // Three-Line Average Method (Notes 27 §3)
}

export interface VedicData {
  palm_length: number | '';
  finger_length: number | '';
  palm_width: number | '';
  palm_shape: 'Square' | 'Rectangular' | '';
  texture: number; // 0-100 (stiff to soft)
  thumb_willpower: 'Strong' | 'Weak' | 'Average';
  thumb_length: 'Short' | 'Average' | 'Long' | '';
  thumb_angle: 'Below 30°' | '30°-45°' | '45°-70°' | '70°-90°' | 'Exactly 90°' | 'Above 90°' | '';
  thumb_first_phalange_length: 'Short' | 'Average' | 'Long' | '';
  thumb_first_phalange_condition: 'Smooth' | 'Sunken/Flattened' | 'Cut marks/lines' | 'Bulged' | '';
  has_clubbed_thumb: boolean;
  has_six_fingers: boolean;
  jupiter_sun_relation: 'Jupiter Longer' | 'Sun Longer' | 'Equal' | '';
  mercury_length: 'Short' | 'Average' | 'Long' | '';
  manibandha_lines: number | '';
  notes: string;
  hand_type: string;
  hand_tattva: string;
  nail_shape: 'Wide/Small' | 'Long/Small' | 'Wide/Big' | 'Square' | 'Beautiful' | '';
  skin_texture: 'Soft/Moisturized' | 'Medium' | 'Hard/Stiff' | 'Rough' | 'Thin-skinned (Nerves visible)' | '';
  finger_knots: 'Smooth' | 'Jupiter & Saturn Knots' | 'Fully Philosophical (Knotty)' | 'Crooked Fingers' | '';
  // Lecture 28 §2.7: Separating back-of-hand knots from crooked fingers
  knots_back_of_hand: '' | 'Smooth / None' | 'Jupiter Knots' | 'Saturn Knots' | 'Sun Knots' | 'Mercury Knots' | 'All Knotty (Philosophical / Dārśanika)';
  crooked_fingers: string[]; // e.g. ['Saturn', 'Sun', 'Mercury', 'Jupiter']
  measurements: {
    palm_start: { x: number; y: number };
    palm_end: { x: number; y: number };
    finger_start: { x: number; y: number };
    finger_end: { x: number; y: number };
    width_start: { x: number; y: number };
    width_end: { x: number; y: number };
  } | null;

  // --- Lecture 07: Thumb Type & Advanced Phalange ---
  thumb_type: 'Waist-like' | 'Stiff' | 'Slight Bend' | 'Very Flexible' | 'Middle Type' | 'Elementary' | '';
  thumb_second_phalange: 'Normal' | 'Long (over-thinker)' | 'Short (impulsive)' | 'Half-cut line' | '';
  thumb_tip_element: 'Square (Earth)' | 'Round (Air)' | 'Conical (Water)' | 'Spatulate (Fire)' | '';

  // --- Lecture 08: Jupiter (Index) Finger ---
  jupiter_length: 'Short' | 'Normal' | 'Long' | '';
  jupiter_tilt: 'Toward Saturn' | 'Straight' | 'Toward Thumb' | '';
  jupiter_phalange_1: 'Short' | 'Normal' | 'Long & Bulged' | ''; // mentality/spirituality
  jupiter_phalange_2: 'Normal' | 'Horizontal line (reduced logic)' | 'Vertical line (stress)' | ''; // logic/implementation
  jupiter_phalange_3: 'Open/Full' | 'Thin' | 'Has marks/lines' | '';   // results
  jupiter_tip_element: 'Square (Earth)' | 'Round (Air)' | 'Conical (Water)' | 'Spatulate (Fire)' | '';

  // --- Lecture 09: Saturn (Middle) Finger ---
  saturn_length: 'Short' | 'Normal' | 'Long' | '';
  saturn_tilt: 'Toward Jupiter' | 'Straight' | 'Toward Sun' | '';
  // Saturn phalanges (Notes 09)
  saturn_phalange_1: 'Short' | 'Normal' | 'Long' | ''; // discipline/service
  saturn_phalange_2: 'Normal' | 'Horizontal line' | 'Vertical line (stress)' | ''; // logic/research
  saturn_phalange_3: 'Open/Full' | 'Thin' | 'Has marks/lines' | ''; // results/material

  // --- Lecture 09: Sun (Ring) Finger ---
  sun_length: 'Short' | 'Normal' | 'Long' | '';
  sun_tilt: 'Toward Saturn' | 'Straight' | 'Toward Mercury' | '';
  sun_crooked: boolean;
  // Sun phalanges (Notes 09)
  sun_phalange_1: 'Short' | 'Normal' | 'Long' | ''; // creativity/recognition
  sun_phalange_2: 'Normal' | 'Horizontal line' | 'Vertical line (stress)' | ''; // logic/ego
  sun_phalange_3: 'Open/Full' | 'Thin' | 'Has marks/lines' | ''; // results/luxury

  // --- Lecture 10: Mercury (Little) Finger ---
  mercury_tilt: 'Attached to Sun' | 'Straight' | 'Separated from Sun' | '';
  mercury_low_set: boolean; // base sits lower than other fingers
  // Mercury phalanges (Notes 10)
  mercury_phalange_1: 'Short' | 'Normal' | 'Long' | ''; // communication
  mercury_phalange_2: 'Normal' | 'Horizontal line' | 'Vertical line (stress)' | ''; // business logic
  mercury_phalange_3: 'Open/Full' | 'Thin' | 'Has marks/lines' | ''; // results/trade

  // --- Lecture 10: General Finger Profile ---
  finger_gaps: '' | 'None' | 'Small gaps (generous)' | 'Wide gaps (free spirit)';
  finger_build: '' | 'Normal' | 'Long & thin (creative)' | 'Short & thick (stubborn + anger)' | 'Thick base (food lover / lazy)';
  line_depth: '' | 'Light lines' | 'Normal' | 'Deep / dark lines (tough life)';

  // ─── Lecture 11-12: Nails (Nakh) — Detailed ───
  nail_length: '' | 'Small/Short' | 'Large/Long' | 'Medium';
  nail_width: '' | 'Wide (Chauṛā)' | 'Narrow/Tight (Sankrā)' | 'Normal';
  nail_thickness: '' | 'Thick (Earth)' | 'Thin/Papery' | 'Medium';
  nail_shape_detail: '' | 'Square' | 'Round' | 'Conical/Tapered' | 'Spatulate' | 'Spoon-shaped (Concave)' | 'Clubbed nail';
  nail_color: '' | 'Pink/Normal (Healthy)' | 'Pale/White' | 'Yellow (Liver/Health)' | 'Blue/Purple (Serious)' | 'Reddish' | 'White spots present' | 'Dark discoloration';
  nail_surface: '' | 'Smooth' | 'Ridged/Vertical lines' | 'Horizontal ridges (protein def)' | 'Spotted' | 'Brittle/Breaks easily' | string;
  nail_lunula: '' | 'Visible on all fingers' | 'Visible on some fingers' | 'Absent (health concern)';
  nail_health_flag: string; // free text for specific health observations
  nail_biting: boolean;

  // ─── Palm Color (Note 04) ───
  palm_color: '' | 'Pinkish (Healthy)' | 'Pale/Whitish' | 'Yellow (health/liver)' | 'Reddish (heat/aggression)' | 'Bluish (kidney/renal alert)' | 'Purple / Aubergine (terminal alert)' | string;

  // ─── Structured Mount Signs (Notes 13-18, 20-22) ───
  mount_jupiter: MountSignData | null;
  mount_saturn: MountSignData | null;
  mount_sun: MountSignData | null;
  mount_mercury: MountSignData | null;
  mount_moon: MountSignData | null;
  mount_venus: MountSignData | null;
  mount_mars_upper: MountSignData | null;
  mount_mars_lower: MountSignData | null;
  mount_mars_plain: MountSignData | null;
  mount_ketu: MountSignData | null; // Ketu area at wrist base between Moon and Venus (Note 20-22)

  // ─── Structured Line Analysis ───
  line_life: LineAnalysisData | null;
  line_fate: LineAnalysisData | null;
  line_head: LineAnalysisData | null;
  line_heart: LineAnalysisData | null;
  line_sun: LineAnalysisData | null;
  // Simian / Semi-Simian Formations (Notes 24-27)
  simian_type: '' | 'None' | 'Full Simian (Heart + Head fused)' | 'Semi-Simian / Sydney Line (Bridge branch or parallel touch)';
  simian_notes: string;
  // Mercury / Health Line (Note 27 — full lecture)
  line_mercury_present: boolean | null; // null = not checked; false = absent (good); true = present
  line_mercury_starts_below_heart: boolean; // health problems if true
  line_mercury_starts_above_heart: boolean; // healer/business line
  line_mercury_joins_moon: boolean; // intuition line
  line_mercury_single_vertical: boolean; // sudden money gain on mercury mount
  line_mercury_data: LineAnalysisData | null;

  // ─── Lecture 28: Marriage Line (Vivāha Rekhā / Śīla-guṇa Rekhā) ───
  line_marriage: MarriageLineData | null;

  // ─── Age Calculation (Notes 20, 22, 27, 28) ───
  age_method: '' | '30-midpoint' | 'cheiro-98' | 'shadamsha-72' | 'three-line-avg' | '18-6-cadence' | 'mercury-56';
  max_age?: number; // customizable maximum lifespan scale (default 75 for India deśa-kāla)
  aging_calibration?: AgingCalibrationAnchors | null;
  aging_calibrations?: Partial<Record<HandView, AgingCalibrationAnchors>> | null;

  // ─── Life × Fate Line Junction Timing (Notes 21, 22, 23) ───
  // Where the Fate Line crosses the Life Line reveals family-support / independence windows.
  life_fate_junctions: Array<{ life_age: number; fate_age: number; reading: string }>;

  // ─── Left vs Right Hand Comparison (Notes 01, 06, 22) ───
  lh_vs_rh_notes: string;
}

export interface HandProfile {
  id: string;
  name: string;
  age: number | '';
  gender: string;
  dominant_hand: 'Left' | 'Right';
  images: Record<string, string>; // e.g. { right_palm: "url", right_back: "url"... }
  general_notes: string;
  mounts_data: Record<string, string>; // mounts details
  lines_data: Record<string, string>;  // lines details
  pins: Pin[];
  drawings: Drawing[];
  tags: string[];
  created_at?: string;
  updated_at?: string;
  dob?: string;
  tob?: string;
  pob?: string;
}
