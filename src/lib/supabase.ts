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

  // --- Lecture 09: Sun (Ring) Finger ---
  sun_length: 'Short' | 'Normal' | 'Long' | '';
  sun_tilt: 'Toward Saturn' | 'Straight' | 'Toward Mercury' | '';
  sun_crooked: boolean;

  // --- Lecture 10: Mercury (Little) Finger ---
  mercury_tilt: 'Attached to Sun' | 'Straight' | 'Separated from Sun' | '';
  mercury_low_set: boolean; // base sits lower than other fingers

  // --- Lecture 10: General Finger Profile ---
  finger_gaps: '' | 'None' | 'Small gaps (generous)' | 'Wide gaps (free spirit)';
  finger_build: '' | 'Normal' | 'Long & thin (creative)' | 'Short & thick (stubborn + anger)' | 'Thick base (food lover / lazy)';
  line_depth: '' | 'Light lines' | 'Normal' | 'Deep / dark lines (tough life)';
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
    sun_length: '',
    sun_tilt: '',
    sun_crooked: false,
    mercury_tilt: '',
    mercury_low_set: false,
    finger_gaps: '',
    finger_build: '',
    line_depth: '',
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

  if (existingIndex >= 0) {
    current[existingIndex] = { ...profile, created_at: current[existingIndex].created_at || new Date().toISOString() };
  } else {
    current.push({ ...profile, created_at: new Date().toISOString() });
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
