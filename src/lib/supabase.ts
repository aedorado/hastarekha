import { createClient as createBrowserClient } from '@/utils/supabase/client';

export const isSupabaseConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export const supabase = isSupabaseConfigured ? createBrowserClient() : null;


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

  // ─── Age Calculation (Notes 20, 22, 27) ───
  age_method: '' | '30-midpoint' | 'cheiro-98' | 'shadamsha-72' | 'three-line-avg';

  // ─── Life × Fate Line Junction Timing (Notes 21, 22, 23) ───
  // Where the Fate Line crosses the Life Line reveals family-support / independence windows.
  life_fate_junctions: Array<{ life_age: number; fate_age: number; reading: string }>;

  // ─── Left vs Right Hand Comparison (Notes 01, 06, 22) ───
  lh_vs_rh_notes: string;
}

export const parseVedicData = (notesField: string): VedicData => {
  const defaultData: VedicData = {
    palm_length: '',
    finger_length: '',
    palm_width: '',
    palm_shape: '',
    texture: 50,
    thumb_willpower: 'Average',
    thumb_length: '',
    thumb_angle: '',
    thumb_first_phalange_length: '',
    thumb_first_phalange_condition: '',
    has_clubbed_thumb: false,
    has_six_fingers: false,
    jupiter_sun_relation: '',
    mercury_length: '',
    manibandha_lines: '',
    notes: '',
    hand_type: '',
    hand_tattva: '',
    nail_shape: '',
    skin_texture: '',
    finger_knots: '',
    measurements: null,
    thumb_type: '',
    thumb_second_phalange: '',
    thumb_tip_element: '',
    jupiter_length: '',
    jupiter_tilt: '',
    jupiter_phalange_1: '',
    jupiter_phalange_2: '',
    jupiter_phalange_3: '',
    jupiter_tip_element: '',
    saturn_length: '',
    saturn_tilt: '',
    saturn_phalange_1: '',
    saturn_phalange_2: '',
    saturn_phalange_3: '',
    sun_length: '',
    sun_tilt: '',
    sun_crooked: false,
    sun_phalange_1: '',
    sun_phalange_2: '',
    sun_phalange_3: '',
    mercury_tilt: '',
    mercury_low_set: false,
    mercury_phalange_1: '',
    mercury_phalange_2: '',
    mercury_phalange_3: '',
    finger_gaps: '',
    finger_build: '',
    line_depth: '',
    // Nails
    nail_length: '',
    nail_width: '',
    nail_thickness: '',
    nail_shape_detail: '',
    nail_color: '',
    nail_surface: '',
    nail_lunula: '',
    nail_health_flag: '',
    nail_biting: false,
    // Palm Color
    palm_color: '',
    // Structured Mounts
    mount_jupiter: null,
    mount_saturn: null,
    mount_sun: null,
    mount_mercury: null,
    mount_moon: null,
    mount_venus: null,
    mount_mars_upper: null,
    mount_mars_lower: null,
    mount_mars_plain: null,
    mount_ketu: null,
    // Structured Lines
    line_life: null,
    line_fate: null,
    line_head: null,
    line_heart: null,
    line_sun: null,
    simian_type: '',
    simian_notes: '',
    line_mercury_present: null,
    line_mercury_starts_below_heart: false,
    line_mercury_starts_above_heart: false,
    line_mercury_joins_moon: false,
    line_mercury_single_vertical: false,
    line_mercury_data: null,
    // Age
    age_method: '',
    life_fate_junctions: [],
    // Comparison
    lh_vs_rh_notes: '',
  };

  if (!notesField) return defaultData;

  const trimmed = notesField.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      return { ...defaultData, ...JSON.parse(trimmed) };
    } catch (e) {
      // fallback to normal text parsing if JSON parsing fails
    }
  }

  // Fallback for old format: handType|description
  const parts = notesField.split('|');
  if (parts.length > 1) {
    return {
      ...defaultData,
      hand_type: parts[0] || '',
      notes: parts[1] || '',
    };
  }

  return {
    ...defaultData,
    notes: notesField,
  };
};

export const serializeVedicData = (data: VedicData): string => {
  return JSON.stringify(data);
};

export const getVedicInterpretations = (vedic: VedicData): string[] => {
  const readings: string[] = [];

  // 1. Tattva (Lecture 02)
  if (vedic.hand_tattva) {
    if (vedic.hand_tattva.includes('Agni')) {
      readings.push('🔥 Agni Tattva (Fire Hand): Energetic, impulsive, horizontal learner (skims). Sun/Mars traits.');
    } else if (vedic.hand_tattva.includes('Jala')) {
      readings.push('💧 Jala Tattva (Water Hand): Sensitive, imaginative, digests anger internally. Craves routine.');
    } else if (vedic.hand_tattva.includes('Pṛthvī')) {
      readings.push('🪵 Pṛthvī Tattva (Earth Hand): Stubborn, Generational Planner, values financial/life security.');
    } else if (vedic.hand_tattva.includes('Vāyu')) {
      readings.push('💨 Vāyu Tattva (Air Hand): Fact-finder, investigator, analytical deep-learner.');
    }
  }

  // 2. Stiffness / Soil (Lecture 01)
  if (vedic.texture !== undefined) {
    if (vedic.texture < 45) {
      readings.push('⚠️ Hard/Stiff Soil: High struggle required. Successful yogas are blocked from bearing easy fruit.');
    } else if (vedic.texture > 60) {
      readings.push('✨ Soft/Supple Soil: Fertile ground for yogas, but requires willpower to override laziness.');
    }
  }

  // 3. Thumb Type (Lecture 07)
  if (vedic.thumb_type) {
    if (vedic.thumb_type === 'Waist-like') {
      readings.push('👍 Waist-like Thumb: Diplomatic, highly social, responsive, great humor. (Best type)');
    } else if (vedic.thumb_type === 'Middle Type') {
      readings.push('👍 Middle Type Thumb: Resourceful (Jugadu), polite, good at adjustments.');
    } else if (vedic.thumb_type === 'Slight Bend') {
      readings.push('👍 Slight Bend Thumb: Conditional adjustments, mild dominance, comfort-seeker.');
    } else if (vedic.thumb_type === 'Stiff') {
      readings.push('👍 Stiff Thumb: Rigid, plain-spoken, indirect anger expression.');
    } else if (vedic.thumb_type === 'Very Flexible') {
      readings.push('👍 Very Flexible Thumb: Spendthrift, overthinker, avoids physical labor.');
    } else if (vedic.thumb_type === 'Elementary') {
      readings.push('👍 Elementary Thumb: Postpones tasks, lacks clear life goals.');
    }
  }

  // 4. Thumb 2nd Phalange (Lecture 07)
  if (vedic.thumb_second_phalange) {
    if (vedic.thumb_second_phalange === 'Long (over-thinker)') {
      readings.push('🧠 Long Logic Segment: Over-thinker prone to analysis paralysis.');
    } else if (vedic.thumb_second_phalange === 'Short (impulsive)') {
      readings.push('🧠 Short Logic Segment: Impulsive, acts without reasoning things through.');
    } else if (vedic.thumb_second_phalange === 'Half-cut line') {
      readings.push('🧠 Half-cut Logic Line: Logic cuts off midway; inconsistent reasoning.');
    }
  }

  // 5. Jupiter Finger (Lecture 08)
  if (vedic.jupiter_length === 'Long') {
    readings.push('♃ Long Jupiter: Authoritative, dominating, ego in knowledge domain.');
  } else if (vedic.jupiter_length === 'Short') {
    readings.push('♃ Short Jupiter: Low self-confidence, relies on others for direction.');
  }

  // 6. Saturn Tilt (Lecture 09)
  if (vedic.saturn_tilt === 'Toward Jupiter') {
    readings.push('🪐 Saturn Tilt → Jupiter: High desire to learn before acting (philosophical).');
  } else if (vedic.saturn_tilt === 'Toward Sun') {
    readings.push('🪐 Saturn Tilt → Sun: Karma linked to name/fame; possible nervous anxiety.');
  }

  // 7. Sun Finger (Lecture 09)
  if (vedic.sun_length === 'Long') {
    readings.push('☀️ Long Sun: Risk-taker, acts before thinking, creative recognition drive.');
  }

  // 8. Mercury Pinky (Lecture 10)
  if (vedic.mercury_length === 'Long') {
    readings.push('☿ Long Mercury: Excellent logic, persuasion, research ("snake dies, stick intact").');
  } else if (vedic.mercury_length === 'Short') {
    readings.push('☿ Short Mercury: Intellectual delay, reproduction concerns, timid speech.');
  }

  // 9. Mercury Tilt (Lecture 10)
  if (vedic.mercury_tilt === 'Attached to Sun') {
    readings.push('☿ Mercury Attached to Sun: Command in speech, craves fame, fears disapproval.');
  } else if (vedic.mercury_tilt === 'Separated from Sun') {
    readings.push('☿ Mercury Separated: Independent mind, open to breaking family/social norms.');
  }

  // 10. Gaps (Lecture 10)
  if (vedic.finger_gaps === 'Small gaps (generous)') {
    readings.push('🤲 Small Finger Gaps: Highly generous, quick to spend or help.');
  } else if (vedic.finger_gaps === 'Wide gaps (free spirit)') {
    readings.push('🌬️ Wide Finger Gaps: Works outside conventions, independent, ignores criticism.');
  }

  // 11. Knots (Lecture 10)
  if (vedic.finger_knots === 'Fully Philosophical (Knotty)') {
    readings.push('📖 Knotty Fingers: Deep analytical filters, philosophical, Message Deliverer.');
  } else if (vedic.finger_knots === 'Crooked Fingers') {
    readings.push('⚡ Crooked Fingers: Planetary energy highly amplified or distorted.');
  }

  // 12. Line Depth (Lecture 10)
  if (vedic.line_depth === 'Deep / dark lines (tough life)') {
    readings.push('⚠️ Deep/Dark Lines: Indicative of a tough, pressure-filled life.');
  } else if (vedic.line_depth === 'Light lines') {
    readings.push('✨ Light Lines: Favorable indicator representing relatively easier phases.');
  }

  // 13. Palm Color (Lecture 04)
  if (vedic.palm_color) {
    if (vedic.palm_color.includes('Pinkish')) {
      readings.push('🌸 Pinkish Palm: Healthy baseline, balanced vitality and harmonious prāṇa.');
    } else if (vedic.palm_color.includes('Pale')) {
      readings.push('⚪ Pale/Whitish Palm: Lower vitality, anemic tendency, introspective or reserved energy.');
    } else if (vedic.palm_color.includes('Yellow')) {
      readings.push('🟡 Yellowish Palm: Liver / Pitta dosha indicator, potential metabolic fatigue.');
    } else if (vedic.palm_color.includes('Reddish')) {
      readings.push('🔴 Reddish Palm: High heat/Agni, quick-tempered, passionate, intense blood pressure tendencies.');
    } else if (vedic.palm_color.includes('Purple') || vedic.palm_color.includes('Aubergine')) {
      readings.push('🟣 Purple / Aubergine Palm: Terminal alert — critical condition indicator; urgent circulatory or respiratory distress.');
    } else if (vedic.palm_color.includes('Blu')) {
      readings.push('🔵 Bluish Palm: Renal / kidney distress indicator (veins on Venus); circulatory stagnation flagged.');
    }
  }

  // 14. Finger Phalanges — Saturn, Sun, Mercury (Lectures 08-10)
  if (vedic.saturn_phalange_1 === 'Long') readings.push('🪐 Saturn Phalanx 1 (Long): Deep discipline, philosophical solitude, serious mindset.');
  if (vedic.saturn_phalange_2 === 'Horizontal line') readings.push('🪐 Saturn Phalanx 2 (Horizontal line): Obstacle or delay in scientific/technical execution.');
  if (vedic.saturn_phalange_2 === 'Vertical line (stress)') readings.push('🪐 Saturn Phalanx 2 (Vertical lines): Heavy mental strain and pressure regarding career duties.');
  if (vedic.saturn_phalange_3 === 'Open/Full') readings.push('🪐 Saturn Phalanx 3 (Full): Solid tangible material and financial results from hard work.');
  if (vedic.saturn_phalange_3 === 'Thin') readings.push('🪐 Saturn Phalanx 3 (Thin): High labor with disproportionately low material yield.');

  if (vedic.sun_phalange_1 === 'Long') readings.push('☀️ Sun Phalanx 1 (Long): High aesthetic refinement, creative vision, flair for arts.');
  if (vedic.sun_phalange_2 === 'Horizontal line') readings.push('☀️ Sun Phalanx 2 (Horizontal line): Clashes of ego; struggle in translating creative ideas to reality.');
  if (vedic.sun_phalange_2 === 'Vertical line (stress)') readings.push('☀️ Sun Phalanx 2 (Vertical line): Anxiety and sensitivity regarding social reputation.');
  if (vedic.sun_phalange_3 === 'Open/Full') readings.push('☀️ Sun Phalanx 3 (Full): Luxurious life standards, widespread public recognition.');
  if (vedic.sun_phalange_3 === 'Thin') readings.push('☀️ Sun Phalanx 3 (Thin): Respected and famous, but modest material wealth accumulation.');

  if (vedic.mercury_phalange_1 === 'Long') readings.push('☿ Mercury Phalanx 1 (Long): Exceptional speech, silver-tongued diplomat, master communicator.');
  if (vedic.mercury_phalange_2 === 'Horizontal line') readings.push('☿ Mercury Phalanx 2 (Horizontal line): Prone to financial miscalculation or contractual oversights.');
  if (vedic.mercury_phalange_2 === 'Vertical line (stress)') readings.push('☿ Mercury Phalanx 2 (Vertical line): Commercial pressure and business overextension.');
  if (vedic.mercury_phalange_3 === 'Open/Full') readings.push('☿ Mercury Phalanx 3 (Full): Sharp business acumen with profitable trade results.');
  if (vedic.mercury_phalange_3 === 'Thin') readings.push('☿ Mercury Phalanx 3 (Thin): Business acumen present, but profit margins leak.');

  // 15. Nails (Lectures 11-12)
  if (vedic.nail_shape_detail) {
    if (vedic.nail_shape_detail === 'Square') readings.push('💅 Square Nails: Practical, methodical, emotionally stable and fair-minded.');
    else if (vedic.nail_shape_detail === 'Round') readings.push('💅 Round Nails: Gentle, adaptable, affectionate, sensitive nature.');
    else if (vedic.nail_shape_detail === 'Conical/Tapered') readings.push('💅 Conical/Tapered Nails: Artistic, intuitive, sensitive to environment.');
    else if (vedic.nail_shape_detail === 'Spatulate') readings.push('💅 Spatulate Nails: Restless action-taker, inventor, thrives on practical execution.');
    else if (vedic.nail_shape_detail === 'Spoon-shaped (Concave)') readings.push('⚠️ Spoon Nails (Koilonychia): Indicates chronic fatigue, iron deficiency or metabolic depletion.');
    else if (vedic.nail_shape_detail === 'Clubbed nail') readings.push('⚠️ Clubbed Nails: Respiratory/cardiovascular alert — consult medical practitioner.');
  }
  if (vedic.nail_color) {
    if (vedic.nail_color.includes('White spots')) readings.push('💅 White Spots on Nails: Classical sign of sudden gains / zinc-mineral assimilation marker.');
    else if (vedic.nail_color.includes('Yellow')) readings.push('⚠️ Yellow Nails: Sluggish liver/jaundice flag; check metabolic health.');
    else if (vedic.nail_color.includes('Blu') || vedic.nail_color.includes('Purple')) readings.push('⚠️ Blue/Purple Nails: Poor circulation or oxygenation distress.');
    else if (vedic.nail_color.includes('Pale')) readings.push('💅 Pale Nails: Low hemoglobin/prāṇic vitality indicator.');
  }
  if (vedic.nail_surface) {
    if (vedic.nail_surface.includes('Fluted')) {
      readings.push('🚨 Fluted Nail Ridges: Deep longitudinal cracks; severe arthritis, chronic degenerative or vascular risk.');
    } else if (vedic.nail_surface.includes('Vertical') || vedic.nail_surface.includes('Ridged')) {
      readings.push('💅 Vertical Nail Ridges: Father-line inheritance marker, nervous exhaustion, stress or vāta-doṣa.');
    } else if (vedic.nail_surface.includes('Horizontal')) {
      readings.push('⚠️ Horizontal Nail Ridges (Beau lines): Mother-line inheritance marker, acute illness shock or protein deficiency.');
    } else if (vedic.nail_surface.includes('Brittle')) {
      readings.push('💅 Brittle Nails: Vāta aggravation, calcium/mineral deficit.');
    } else if (vedic.nail_surface.includes('Spotted')) {
      readings.push('💅 Spotted Nail Surface: Uneven mineral absorption or metabolic fluctuation.');
    }
  }
  if (vedic.nail_lunula === 'Absent (health concern)') {
    readings.push('⚠️ Absent Nail Moons (Lunulae): Low metabolic fire (mandāgni), sluggish circulation.');
  }
  if (vedic.nail_biting) {
    readings.push('💅 Nail Biting: Chronic interior nervous restlessness or suppressed anxiety.');
  }
  if (vedic.nail_health_flag) {
    readings.push(`🏥 Nail Health Note: ${vedic.nail_health_flag}`);
  }

  // 16. Mount Signs & Apex (Lectures 13-18)
  if (vedic.mount_jupiter) {
    const signs = vedic.mount_jupiter.signs || [];
    if (signs.includes('Cross')) readings.push('♃ Cross on Jupiter: Highly auspicious — happy marriage, noble education, blessed spousal connection.');
    if (signs.includes('Star')) readings.push('♃ Star on Jupiter: Extraordinary ambition realized; sudden social rise and high authority.');
    if (signs.includes('Square')) readings.push('♃ Square on Jupiter (Teacher\'s Square): Natural instructional gift; protection from reputational attacks.');
    if (signs.includes('Trident')) readings.push('♃ Trident on Jupiter: Spiritual wisdom, executive command, and high dharmic recognition.');
    if (signs.includes('Grille') || signs.includes('Mole')) readings.push('♃ Grille/Mole on Jupiter: Vanity, dogmatic pride, obstacles in guru or parental blessings.');
  }

  if (vedic.mount_saturn) {
    const signs = vedic.mount_saturn.signs || [];
    if (signs.includes('Cross')) readings.push('🪐 Cross on Saturn: Karmic warnings, unexpected life turns, risk of bone/joint accidents.');
    if (signs.includes('Star')) readings.push('🪐 Star on Saturn: Heavy karmic events, sudden stroke of fatalistic destiny or great endurance test.');
    if (signs.includes('Square')) readings.push('🪐 Square on Saturn: Supreme protective shield against physical accidents and karmic catastrophes.');
    if (signs.includes('Single Vertical Line')) readings.push('🪐 Single Vertical Line on Saturn: Prosperous and peaceful old age; unshakeable steady income.');
  }

  if (vedic.mount_sun) {
    const signs = vedic.mount_sun.signs || [];
    if (signs.includes('Star')) readings.push('☀️ Star on Sun: Worldwide renown, sudden fame, exceptional genius in arts or public office.');
    if (signs.includes('Trident')) readings.push('☀️ Trident on Sun Mount: Tri-fold renown — acclaim through art/status, commerce (Mercury), and perseverance (Saturn).');
    if (signs.includes('Diamond Chain')) readings.push('☀️ Diamond Chain on Sun: Wish fulfilment symbol — doubles the fame and protective radiance.');
    if (signs.includes('Canopy / Circle')) readings.push('☀️ Canopy / Circle on Sun: Lifetime umbrella of divine honor; impervious to disgrace.');
    if (signs.includes('Square')) readings.push('☀️ Square on Sun: Immunity from defamation, financial security against property loss.');
    if (signs.includes('Cross') || signs.includes('Island')) readings.push('☀️ Cross/Island on Sun: Public scandal, eye strain/troubles, obstruction to recognition.');
  }

  if (vedic.mount_mercury) {
    const signs = vedic.mount_mercury.signs || [];
    if (signs.includes('Star')) readings.push('☿ Star on Mercury: Brilliance in rhetoric, scientific research, mathematical agility.');
    if (signs.includes('Square')) readings.push('☿ Square on Mercury: Protected against business ruin and fraud.');
    if (signs.includes('3+ Vertical Lines (Medical Stigmata)')) readings.push('☿ Medical Stigmata (3+ Lines): Natural healing hands, empathy, suited for medicine or therapy.');
  }

  if (vedic.mount_moon) {
    const signs = vedic.mount_moon.signs || [];
    if (signs.includes('Triangle')) readings.push('🌙 Triangle on Moon: Heightened psychic intuition, prophetic visions, mastery of occult arts.');
    if (signs.includes('Star') || signs.includes('Cross')) readings.push('🌙 Star/Cross on Moon: Psychological turbulence, vulnerability to over-imagination, caution near water bodies.');
    if (signs.includes('Square')) readings.push('🌙 Square on Moon: Protection during long travels and mental emotional balance under pressure.');
  }

  if (vedic.mount_venus) {
    const signs = vedic.mount_venus.signs || [];
    if (signs.includes('Square')) readings.push('♀ Square on Venus: Shield against emotional entrapment and scandalous infatuations.');
    if (signs.includes('Grille')) readings.push('♀ Grille on Venus: Restless passions, hyper-sensual desires, energy dispersion.');
  }

  if (vedic.mount_mars_upper?.signs?.includes('Star')) {
    readings.push('⚔️ Star on Upper Mars: Supreme martial courage, victorious in court and battle, cool head under crisis.');
  }
  if (vedic.mount_mars_lower?.signs?.includes('Star')) {
    readings.push('⚔️ Star on Lower Mars: Impulsive conflict, teenage injuries or accident-prone youth.');
  }

  // 17. Structured Lines (Lectures 19-27)
  if (vedic.line_life) {
    if (vedic.line_life.features?.includes('Supportive / Mars Line (Devata Raksha)')) {
      readings.push('🛡️ Mars Line (Devatā Rakṣā): Divine guardian angel line — shields against grave illness and danger.');
    }
    if (vedic.line_life.features?.includes('Fork at end towards Moon')) {
      readings.push('✈️ Life Line Fork to Moon: Long-distance travel, foreign relocation or changing lands in twilight years.');
    }
    if (vedic.line_life.signs?.includes('Island')) {
      readings.push('⚠️ Island on Life Line: Temporary period of health debility or prolonged confinement/struggle.');
    }
    if (vedic.line_life.signs?.includes('Square')) {
      readings.push('✨ Square on Life Line: Miraculous recovery from illness; hospital protection.');
    }
  }

  if (vedic.line_fate) {
    if (vedic.line_fate.origin?.includes('Moon')) {
      readings.push('🌊 Fate from Moon Mount: Career blessed by public popularity, assistance from strangers or spouse.');
    } else if (vedic.line_fate.origin?.includes('Life')) {
      readings.push('🌱 Fate from Life Line: Self-made destiny carved by intense personal grit and family foundations.');
    } else if (vedic.line_fate.origin?.includes('Wrist')) {
      readings.push('⚓ Fate from Wrist (Maṇibandha): Clear vocation determined early in youth.');
    }
    if (vedic.line_fate.features?.includes('Branch to Jupiter')) {
      readings.push('👑 Fate Branch to Jupiter: Exceptional rise to executive power and leadership.');
    }
    if (vedic.line_fate.features?.includes('Branch to Sun')) {
      readings.push('🌟 Fate Branch to Sun: High fame and public prestige accompany professional work.');
    }
    if (vedic.line_fate.signs?.includes('Diamond Chain at end')) {
      readings.push('💎 Diamond Chain on Fate: Peak life fulfilment; multiple desires materialized.');
    }
  }

  if (vedic.line_head) {
    if (vedic.line_head.terminus?.includes('Moon')) {
      readings.push('🎨 Head Line sloping to Moon: Rich creative imagination, literary gifts, poetic nature.');
    } else if (vedic.line_head.terminus?.includes('Upper Mars')) {
      readings.push('📐 Straight Head Line to Mars: Practical, pragmatic, mathematical logic, realistic worldview.');
    }
    if (vedic.line_head.features?.includes('Writer\'s Fork (Fork at end)')) {
      readings.push('✍️ Writer\'s Fork: Versatile duality — synthesizes creative imagination with pragmatic business acumen.');
    }
    if (vedic.line_head.signs?.includes('Island')) {
      readings.push('⚠️ Island on Head Line: Mental overload, migraine, period of indecision or intellectual strain.');
    }
  }

  if (vedic.line_heart) {
    if (vedic.line_heart.terminus?.includes('Jupiter')) {
      readings.push('❤️ Heart Line terminating under Jupiter: Idealistic, noble romantic ethics, unconditional loyalty.');
    } else if (vedic.line_heart.terminus?.includes('Saturn')) {
      readings.push('❤️ Heart Line terminating under Saturn: Sensual, pragmatic, emotionally guarded, practical expectations.');
    }
    if (vedic.line_heart.features?.includes('Guru Fork (Fork at end to Jupiter)')) {
      readings.push('🔱 Guru Fork on Heart: Auspicious balance between deep affection and social dignity.');
    }
    if (vedic.line_heart.quality === 'Chain-like') {
      readings.push('⚠️ Chain-like Heart Line: Hypersensitive emotional turbulence, subject to heartache.');
    }
  }

  if (vedic.line_sun) {
    if (vedic.line_sun.origin?.includes('Heart Line')) {
      readings.push('☀️ Sun Line from Heart: Blossoming of true fame and artistic fulfillment after age 50.');
    } else if (vedic.line_sun.origin?.includes('Wrist') || vedic.line_sun.origin?.includes('Fate')) {
      readings.push('☀️ Long Sun Line: Early recognized talent, royal patronage and sustained lifelong renown.');
    }
    if (vedic.line_sun.signs?.includes('Trident at end')) {
      readings.push('🔱 Sun Line Trident: Multi-faceted success across art, commerce, and leadership.');
    }
  }

  // 18. Mercury Line / Health / Liver (Lecture 27)
  if (vedic.line_mercury_present === false) {
    readings.push('✨ Mercury Line Absent: Highly auspicious — classical indicator of robust digestive vitality and resilient constitution.');
  } else if (vedic.line_mercury_present === true) {
    if (vedic.line_mercury_starts_below_heart) {
      readings.push('⚠️ Mercury Line below Heart: Potential digestive, liver or nervous sensitivity.');
    }
    if (vedic.line_mercury_starts_above_heart) {
      readings.push('🩺 Mercury Line above Heart: Healer\'s or business acumen line — counseling and consultation gifts.');
    }
    if (vedic.line_mercury_joins_moon) {
      readings.push('👁️ Line of Intuition (Joined to Moon): Strong premonitions, prophetic dreams, keen gut instincts.');
    }
    if (vedic.line_mercury_single_vertical) {
      readings.push('💰 Single Vertical Line on Mercury: Sudden windfall or unexpected commercial gain (Dhana Lābha).');
    }
  }

  // 18b. Life × Fate Junction Timing (Lectures 21-23)
  if (vedic.life_fate_junctions && vedic.life_fate_junctions.length > 0) {
    vedic.life_fate_junctions.forEach((j) => {
      readings.push(`⏳ Life×Fate Junction (Life age ${j.life_age} / Fate age ${j.fate_age}): ${j.reading || 'Support/independence window — see notes.'}`);
    });
  }

  // 18c. Simian / Semi-Simian Formations (Lectures 24-27)
  if (vedic.simian_type && vedic.simian_type !== 'None') {
    readings.push(`🧬 ${vedic.simian_type}: Fusion of head and heart energies; high intensity focus and driven singular path.`);
  }

  // 19. Karmic Hand Comparison (Lectures 01, 06, 22)
  if (vedic.lh_vs_rh_notes && vedic.lh_vs_rh_notes.trim().length > 0) {
    readings.push(`⚖️ Left vs Right Hand Synthesis: ${vedic.lh_vs_rh_notes.trim()}`);
  }

  return readings;
};

export function calculateAge(dobString: string): number | '' {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
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


const DEMO_STORAGE_KEY = 'hastarekha_demo_db';

export const getDemoProfiles = (): HandProfile[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveDemoProfile = (profile: HandProfile): HandProfile[] => {
  if (typeof window === 'undefined') return [];
  const current = getDemoProfiles();
  const existingIndex = current.findIndex(p => p.id === profile.id);
  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    current[existingIndex] = {
      ...profile,
      created_at: current[existingIndex].created_at || now,
      updated_at: now,
    };
  } else {
    current.push({ ...profile, created_at: now, updated_at: now });
  }

  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const deleteDemoProfile = (id: string): HandProfile[] => {
  if (typeof window === 'undefined') return [];
  const current = getDemoProfiles();
  const filtered = current.filter(p => p.id !== id);
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};
