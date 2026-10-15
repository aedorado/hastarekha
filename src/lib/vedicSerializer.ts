import { VedicData } from '@/types/palmistry';

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
    knots_back_of_hand: '',
    crooked_fingers: [],
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
    // Marriage Line (Lecture 28)
    line_marriage: null,
    // Age
    age_method: '',
    max_age: 75,
    aging_calibration: null,
    aging_calibrations: {},
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
