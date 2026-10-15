import { HandProfile, VedicData, MountSignData, LineAnalysisData } from '@/types/palmistry';

export const generateReportMarkdown = (profile: HandProfile, vedic: VedicData): string => {
  let md = `# Hasta Sāmudrika Śāstra — Consultation & Reading Report\n\n`;
  md += `**Subject Name:** ${profile.name || 'Anonymous'}\n`;
  if (profile.age) md += `**Age:** ${profile.age} years | `;
  if (profile.gender) md += `**Gender:** ${profile.gender} | `;
  md += `**Active (Dominant) Hand:** ${profile.dominant_hand || 'Right'}\n`;
  if (profile.dob) md += `**DOB:** ${profile.dob} `;
  if (profile.tob) md += `| **TOB:** ${profile.tob} `;
  if (profile.pob) md += `| **POB:** ${profile.pob}\n`;
  md += `**Report Generated:** ${new Date().toLocaleDateString()}\n\n`;
  md += `---\n\n`;

  md += `## 1. Core Hand Prakṛti & Tattva\n`;
  md += `- **Elemental Tattva:** ${vedic.hand_tattva || 'Not specified'}\n`;
  md += `- **Classical Hand Type:** ${vedic.hand_type || 'Not specified'}\n`;
  md += `- **Palm Color:** ${vedic.palm_color || 'Not specified'}\n`;
  if (vedic.texture !== undefined && vedic.texture !== null) {
    md += `- **Palm Soil (Firmness):** ${vedic.texture}/100 (${
      vedic.texture < 45
        ? 'Hard/Stiff Soil — high effort required'
        : vedic.texture > 60
        ? 'Soft & Supple — fertile ground'
        : 'Balanced medium'
    })\n`;
  }
  if (vedic.skin_texture) md += `- **Dorsal Skin Texture:** ${vedic.skin_texture}\n`;
  if (vedic.line_depth) md += `- **Line Depth:** ${vedic.line_depth}\n`;
  md += `\n`;

  md += `## 2. Thumb & Willpower Analysis (Icchā vs. Tarka)\n`;
  if (vedic.thumb_type) md += `- **Thumb Type:** ${vedic.thumb_type}\n`;
  if (vedic.thumb_angle) md += `- **Thumb Angle:** ${vedic.thumb_angle}\n`;
  if (vedic.thumb_willpower) md += `- **Willpower Rating:** ${vedic.thumb_willpower}\n`;
  if (vedic.thumb_first_phalange_length)
    md += `- **Thumb Reach vs. Base Marker:** ${vedic.thumb_first_phalange_length}\n`;
  if (vedic.thumb_first_phalange_condition)
    md += `- **1st Phalanx Condition:** ${vedic.thumb_first_phalange_condition}\n`;
  if (vedic.thumb_second_phalange)
    md += `- **2nd Phalanx (Logic / Tarka):** ${vedic.thumb_second_phalange}\n`;
  if (vedic.has_clubbed_thumb)
    md += `- **Clubbed Thumb:** Present — intense temper potential; requires emotional balance\n`;
  md += `\n`;

  md += `## 3. Four Planetary Fingers & Phalanges\n`;
  md += `### Jupiter (Guru) Finger\n`;
  md += `- Length: ${vedic.jupiter_length || 'Normal'} | Tilt: ${vedic.jupiter_tilt || 'Straight'}\n`;
  if (vedic.jupiter_phalange_1) md += `- 1st Phalanx (Spirituality/Mentality): ${vedic.jupiter_phalange_1}\n`;
  if (vedic.jupiter_phalange_2) md += `- 2nd Phalanx (Logic/Application): ${vedic.jupiter_phalange_2}\n`;
  if (vedic.jupiter_phalange_3) md += `- 3rd Phalanx (Results): ${vedic.jupiter_phalange_3}\n`;

  md += `### Saturn (Śani) Finger\n`;
  md += `- Length: ${vedic.saturn_length || 'Normal'} | Tilt: ${vedic.saturn_tilt || 'Straight'}\n`;
  if (vedic.saturn_phalange_1) md += `- 1st Phalanx (Discipline): ${vedic.saturn_phalange_1}\n`;
  if (vedic.saturn_phalange_2) md += `- 2nd Phalanx (Work Logic): ${vedic.saturn_phalange_2}\n`;
  if (vedic.saturn_phalange_3) md += `- 3rd Phalanx (Material Return): ${vedic.saturn_phalange_3}\n`;

  md += `### Sun (Sūrya) Finger\n`;
  md += `- Length: ${vedic.sun_length || 'Normal'} | Tilt: ${vedic.sun_tilt || 'Straight'}${
    vedic.sun_crooked ? ' | Crooked' : ''
  }\n`;
  if (vedic.sun_phalange_1) md += `- 1st Phalanx (Creative Vision): ${vedic.sun_phalange_1}\n`;
  if (vedic.sun_phalange_2) md += `- 2nd Phalanx (Aesthetic Logic): ${vedic.sun_phalange_2}\n`;
  if (vedic.sun_phalange_3) md += `- 3rd Phalanx (Fame/Acclaim): ${vedic.sun_phalange_3}\n`;

  md += `### Mercury (Budh) Finger\n`;
  md += `- Length: ${vedic.mercury_length || 'Normal'} | Tilt: ${vedic.mercury_tilt || 'Straight'}${
    vedic.mercury_low_set ? ' | Low-set base' : ''
  }\n`;
  if (vedic.mercury_phalange_1) md += `- 1st Phalanx (Speech/Eloquence): ${vedic.mercury_phalange_1}\n`;
  if (vedic.mercury_phalange_2) md += `- 2nd Phalanx (Commercial Logic): ${vedic.mercury_phalange_2}\n`;
  if (vedic.mercury_phalange_3) md += `- 3rd Phalanx (Trade Results): ${vedic.mercury_phalange_3}\n`;
  md += `\n`;

  md += `## 4. Nails (Nakh) & Health Diagnostics\n`;
  if (vedic.nail_shape_detail) md += `- **Shape:** ${vedic.nail_shape_detail}\n`;
  if (vedic.nail_color) md += `- **Color:** ${vedic.nail_color}\n`;
  if (vedic.nail_surface) md += `- **Surface:** ${vedic.nail_surface}\n`;
  if (vedic.nail_lunula) md += `- **Lunulae (Moons):** ${vedic.nail_lunula}\n`;
  if (vedic.nail_biting) md += `- **Nail Biting:** Present (nervous tension / suppressed restlessness)\n`;
  if (vedic.nail_health_flag) md += `- **Health Diagnostic Alert:** ${vedic.nail_health_flag}\n`;
  md += `\n`;

  md += `## 5. Seven Planetary Mounts & Sacred Signs\n`;
  const mountDefs: Array<{ key: keyof VedicData; name: string }> = [
    { key: 'mount_jupiter', name: 'Jupiter Mount (Guru)' },
    { key: 'mount_saturn', name: 'Saturn Mount (Śani)' },
    { key: 'mount_sun', name: 'Sun Mount (Sūrya)' },
    { key: 'mount_mercury', name: 'Mercury Mount (Budh)' },
    { key: 'mount_moon', name: 'Moon Mount (Chandra)' },
    { key: 'mount_venus', name: 'Venus Mount (Śukra)' },
    { key: 'mount_mars_lower', name: 'Lower Mars / Nimna Maṅgala (Inner Courage & Vitality)' },
    { key: 'mount_mars_upper', name: 'Upper Mars / Ucca Maṅgala (Outer Courage & Retaliation)' },
    { key: 'mount_mars_plain', name: 'Plain of Mars / Rāhu Zone (Middle Palm)' },
    { key: 'mount_ketu', name: 'Ketū Parvata (Base-Palm Zone / Moksha & Ancestral Roots)' },
  ];
  mountDefs.forEach(({ key, name }) => {
    const data = vedic[key] as MountSignData | null;
    if (data && (data.height || (data.signs && data.signs.length > 0) || data.notes)) {
      md += `### ${name}\n`;
      if (data.height) md += `- Height: ${data.height}\n`;
      if (data.apex) md += `- Apex Displacement: ${data.apex}\n`;
      if (data.signs && data.signs.length > 0) md += `- Sacred Signs: ${data.signs.join(', ')}\n`;
      if (data.quality) md += `- Tissue Quality: ${data.quality}\n`;
      if (data.notes) md += `- Observations: ${data.notes}\n`;
    }
  });
  md += `\n`;

  md += `## 6. Primary Lines (Rekhā) Analysis\n`;
  if (vedic.simian_type) {
    md += `### Simian Line Formation: ${vedic.simian_type}\n`;
    if (vedic.simian_notes) md += `- Observations: ${vedic.simian_notes}\n`;
    md += `\n`;
  }
  const lineDefs: Array<{ key: keyof VedicData; name: string }> = [
    { key: 'line_life', name: 'Life Line (Āyur Rekhā / Jīvana Rekhā)' },
    { key: 'line_head', name: 'Head / Brain Line (Mastiṣka Rekhā)' },
    { key: 'line_heart', name: 'Heart Line (Hṛdaya Rekhā)' },
    { key: 'line_fate', name: 'Fate Line (Bhāgya Rekhā / Śani Rekhā)' },
    { key: 'line_sun', name: 'Sun Line (Sūrya Rekhā / Kīrti Rekhā)' },
  ];
  lineDefs.forEach(({ key, name }) => {
    const data = vedic[key] as LineAnalysisData | null;
    if (
      data &&
      (data.quality ||
        data.origin ||
        data.terminus ||
        (data.features && data.features.length > 0) ||
        (data.signs && data.signs.length > 0))
    ) {
      md += `### ${name}\n`;
      if (data.quality) md += `- Quality: ${data.quality}\n`;
      if (data.origin) md += `- Origin: ${data.origin}\n`;
      if (data.terminus) md += `- Terminus: ${data.terminus}\n`;
      if (data.features && data.features.length > 0) md += `- Features: ${data.features.join(', ')}\n`;
      if (data.signs && data.signs.length > 0) md += `- Signs on Line: ${data.signs.join(', ')}\n`;
      if (data.notes) md += `- Notes: ${data.notes}\n`;
    }
  });

  if (vedic.line_mercury_present !== null && vedic.line_mercury_present !== undefined) {
    md += `### Mercury / Health Line (Budha Rekhā / Svasthya Rekhā)\n`;
    md += `- Status: ${vedic.line_mercury_present ? 'Present' : 'Absent (classical indicator of robust vitality)'}\n`;
    if (vedic.line_mercury_starts_below_heart)
      md += `- Origin: Below Heart Line (digestive/hepatic attention required)\n`;
    if (vedic.line_mercury_starts_above_heart)
      md += `- Starts above Heart Line (healer / counselor / trade acumen)\n`;
    if (vedic.line_mercury_joins_moon)
      md += `- Line of Intuition: Reaches Moon Mount (prophetic dreams, strong gut instinct)\n`;
    if (vedic.line_mercury_single_vertical)
      md += `- Single Vertical Line on Mount: Dhana Lābha (sudden windfall sign)\n`;
  }

  if (vedic.line_marriage) {
    const m = vedic.line_marriage;
    md += `### Marriage Line (Vivāha Rekhā / Śīla-guṇa Rekhā)\n`;
    if (m.quality) md += `- Line Quality: ${m.quality}\n`;
    if (m.estimated_age) md += `- Estimated Timing: ~Age ${m.estimated_age} (Mercury 0–56 scale)\n`;
    if (m.secondary_lines_count) md += `- Affection/Attraction Lines: ${m.secondary_lines_count} lines\n`;
    if (m.has_parasite_line_on_life)
      md += `- Upajīvī Rekhā Alert: Parasite line on Life Line indicates third-party domestic stress\n`;
    if (m.formations && m.formations.length > 0) md += `- Structural Formations: ${m.formations.join(', ')}\n`;
    if (m.venus_line_cutting)
      md += `- Venus Line Conflict: Direct line from Venus cuts Vivāha Rekhā (severe martial hazard)\n`;
    if (m.reaches_sun_mount)
      md += `- Sun Mount Connection: Reaches Sun Mount (fame/prosperity through marriage)\n`;
    if (m.cuts_sun_mount)
      md += `- Sun Mount Conflict: Cuts across Sun mount/line (scandal/trouble through spouse)\n`;
    if (m.crosses_heart_line) md += `- Heart Line Impact: Cuts Heart Line (sorrowful termination warning)\n`;
    if (m.notes) md += `- Clinical Notes: ${m.notes}\n`;
  }
  md += `\n`;

  // Age events
  const allEvents: Array<{ line: string; age: number; event: string }> = [];
  (['line_life', 'line_fate', 'line_head', 'line_heart', 'line_sun'] as const).forEach((k) => {
    const ld = vedic[k] as LineAnalysisData | null;
    if (ld && ld.age_events) {
      ld.age_events.forEach((ev) => {
        allEvents.push({ line: k.replace('line_', '').toUpperCase(), age: ev.age, event: ev.event });
      });
    }
  });
  if (allEvents.length > 0) {
    allEvents.sort((a, b) => a.age - b.age);
    md += `## 7. Chronological Life Timeline & Milestones\n`;
    allEvents.forEach((ev) => {
      md += `- **Age ${ev.age}** [${ev.line} Line]: ${ev.event}\n`;
    });
    md += `\n`;
  }

  if (vedic.life_fate_junctions && vedic.life_fate_junctions.length > 0) {
    md += `## 7b. Life × Fate Line Junction Timing\n`;
    vedic.life_fate_junctions.forEach((j) => {
      md += `- **Life age ${j.life_age} / Fate age ${j.fate_age}:** ${j.reading || 'Support/independence window'}\n`;
    });
    md += `\n`;
  }

  if (vedic.lh_vs_rh_notes) {
    md += `## 8. Left vs. Right Hand Karmic Synthesis\n`;
    md += `${vedic.lh_vs_rh_notes}\n\n`;
  }

  if (vedic.notes && vedic.notes.trim()) {
    md += `## 9. General Consultation Notes & Remedial Guidance\n`;
    md += `${vedic.notes.trim()}\n\n`;
  }

  return md;
};
