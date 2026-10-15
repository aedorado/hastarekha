import { VedicData } from '@/types/palmistry';

export const getVedicInterpretations = (vedic: VedicData): string[] => {
  const readings: string[] = [];

  // 0. Nature-First Hierarchy (Lecture 28 §2.4)
  if (vedic.hand_tattva || vedic.thumb_willpower || vedic.thumb_first_phalange_length) {
    readings.push('🧭 Nature-First Reading Framework (Lecture 28 §2.4): Hand type sets ~60% baseline temperament → modified by Thumb top phalange (willpower/decisions) & Mercury (communication) before evaluating marriage, career, or health.');
  }

  // 1. Tattva (Lecture 02)
  if (vedic.hand_tattva) {
    if (vedic.hand_tattva.includes('Agni')) {
      readings.push('🔥 Agni Tattva (Fire Hand): Energetic, impulsive, horizontal learner (skims). Sun/Mars traits.');
    } else if (vedic.hand_tattva.includes('Jala')) {
      readings.push('💧 Jala Tattva (Water Hand): Sensitive, imaginative, digests anger internally (can surface as stomach issues/stress/depression); adaptable outwardly but prone to career/life instability if overly emotional.');
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

  // 5. Jupiter Finger & Tilt (Lecture 08 & Lecture 28 §2.2)
  if (vedic.jupiter_length === 'Long') {
    readings.push('♃ Long Jupiter: Authoritative, dominating, ego in knowledge domain.');
  } else if (vedic.jupiter_length === 'Short') {
    readings.push('♃ Short Jupiter: Insists "I know this" despite lacking real knowledge; dominating/egotistic without substance (defame-yoga tendency); poor judgment of right vs. wrong; avoids responsibility; can be timid/cowardly and ill-mannered.');
  }
  if (vedic.jupiter_tilt === 'Toward Saturn') {
    readings.push('♃→🪐 Jupiter Tilt → Saturn (Guru-Śani Yuti): Research enters knowledge; acquires wisdom patiently without haste; strict adherence to rules/regulations; never forces own views onto others (8th house depth).');
  } else if (vedic.jupiter_tilt === 'Toward Thumb') {
    readings.push('♃→👍 Jupiter Tilt → Thumb: Dominating personal will, ego-assertion, and high administrative self-confidence.');
  }

  // 6. Saturn Tilt (Lecture 09 & Lecture 28 §2.2, §2.5)
  if (vedic.saturn_tilt === 'Toward Jupiter') {
    readings.push('🪐→♃ Saturn Tilt → Jupiter (Śani-Guru Yuti): Buddhi-viveka and dharmic wisdom infused into work (karma); positive reframing — even when hardships arrive, the native finds constructive spiritual benefit.');
  } else if (vedic.saturn_tilt === 'Toward Sun') {
    readings.push('🪐→☀️ Saturn Tilt → Sun: Karma aligned with government, public honor, and fame achieved through relentless professional duty.');
  }

  // 7. Sun Finger & Tilt (Lecture 09 & Lecture 28 §2.5)
  if (vedic.sun_length === 'Long') {
    readings.push('☀️ Long Sun: Risk-taker, acts before thinking, creative recognition drive.');
  }
  if (vedic.sun_tilt === 'Toward Saturn') {
    readings.push('☀️→🪐 Sun Tilt → Saturn: Highly auspicious for career endurance and professional results; however, name and fame arrive late with effort, with minor defame sensitivity or health strain.');
  } else if (vedic.sun_tilt === 'Toward Mercury') {
    readings.push('☀️→☿ Sun Tilt → Mercury: Commercialized creativity — monetizes creative talents, fluent communication in arts and enterprise.');
  }

  // 8. Mercury Pinky (Lecture 10)
  if (vedic.mercury_length === 'Long') {
    readings.push('☿ Long Mercury: Skilled at persuasion — turns situations to their favor and convinces others of their point of view.');
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
    readings.push('🌬️ Wide Finger Gaps: Highly generous, quick to spend or help.');
  }

  // 11. Knots vs. Crooked Fingers (Lecture 10 & Lecture 28 §2.7)
  if (vedic.knots_back_of_hand) {
    if (vedic.knots_back_of_hand.includes('All Knotty') || vedic.knots_back_of_hand.includes('Philosophical')) {
      readings.push('📖 Dārśanika Hasta (Knotty Joints on Back of Palm): Raised knuckle joints mark a deep philosophical thinker, analyst, and patient researcher.');
    } else if (vedic.knots_back_of_hand !== 'Smooth / None') {
      readings.push(`📖 Knotty Knuckles (${vedic.knots_back_of_hand}): Philosophical, questioning, and investigative mindset specifically active in that planetary domain.`);
    }
  } else if (vedic.finger_knots === 'Fully Philosophical (Knotty)') {
    readings.push('📖 Knotty Fingers: Deep analytical filters; philosophical depth in that specific finger\'s domain.');
  }

  if (vedic.crooked_fingers && vedic.crooked_fingers.length > 0) {
    if (vedic.crooked_fingers.includes('Saturn')) {
      readings.push('⚡ Crooked Saturn Finger (Tēḍhī-Mēḍhī): Distortions in career path or career where tactical cleverness must be deployed; distinct from philosophical knotty joints.');
    }
    vedic.crooked_fingers.filter(f => f !== 'Saturn').forEach(f => {
      readings.push(`⚡ Crooked ${f} Finger: Planetary energy flow amplified, strained, or prone to eccentric expression.`);
    });
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
      readings.push('⚪ Pale/Whitish Palm ("Depressive Palm"): anxiety, depression, weak immunity, eyesight/stomach/sleep issues, possible anemia; personality dull/low-reactivity ("cold-blooded").');
    } else if (vedic.palm_color.includes('Yellow')) {
      readings.push('🟡 Yellowish Palm: Iron deficiency / low hemoglobin indicator, history of jaundice; personality tends dull/rough-natured, not easily irritated.');
    } else if (vedic.palm_color.includes('Reddish')) {
      readings.push('🔴 Reddish Palm: Light red = energy/strength, romantic mood (can also show anger). Dark red-brown = possible serious illness (heart-related, BP issues — confirm via heart line), strong/impulsive anger; not a fully good sign.');
    } else if (vedic.palm_color.includes('Purple') || vedic.palm_color.includes('Aubergine')) {
      readings.push('🟣 Purple / Aubergine Palm: Terminal alert — critical condition indicator; urgent circulatory or respiratory distress.');
    } else if (vedic.palm_color.includes('Blu')) {
      readings.push('🔵 Bluish Palm: Renal / kidney distress indicator (veins on Venus); circulatory stagnation flagged.');
    }
  }

  // 14. Finger Phalanges — Saturn, Sun, Mercury (Lecture 08 general phalange framework: 1st=mentality, 2nd=logic, 3rd=result — applied per finger)
  if (vedic.saturn_phalange_1 === 'Long') readings.push('🪐 Saturn Phalanx 1 (Long): Deep discipline and seriousness in this domain.');
  if (vedic.saturn_phalange_2 === 'Horizontal line') readings.push('🪐 Saturn Phalanx 2 (Horizontal line): Obstacle or delay in scientific/technical execution.');
  if (vedic.saturn_phalange_2 === 'Vertical line (stress)') readings.push('🪐 Saturn Phalanx 2 (Vertical lines): Heavy mental strain and pressure regarding career duties.');
  if (vedic.saturn_phalange_3 === 'Open/Full') readings.push('🪐 Saturn Phalanx 3 (Full): Solid tangible material and financial results from hard work.');
  if (vedic.saturn_phalange_3 === 'Thin') readings.push('🪐 Saturn Phalanx 3 (Thin): High labor with disproportionately low material yield.');

  if (vedic.sun_phalange_1 === 'Long') readings.push('☀️ Sun Phalanx 1 (Long): High aesthetic refinement, creative vision, flair for arts.');
  if (vedic.sun_phalange_2 === 'Horizontal line') readings.push('☀️ Sun Phalanx 2 (Horizontal line): Clashes of ego; struggle in translating creative ideas to reality.');
  if (vedic.sun_phalange_2 === 'Vertical line (stress)') readings.push('☀️ Sun Phalanx 2 (Vertical line): Anxiety and sensitivity regarding social reputation.');
  if (vedic.sun_phalange_3 === 'Open/Full') readings.push('☀️ Sun Phalanx 3 (Full): Luxurious life standards, widespread public recognition.');
  if (vedic.sun_phalange_3 === 'Thin') readings.push('☀️ Sun Phalanx 3 (Thin): Respected and famous, but modest material wealth accumulation.');

  if (vedic.mercury_phalange_1 === 'Long') readings.push('☿ Mercury Phalanx 1 (Long): Strong communication ability.');
  if (vedic.mercury_phalange_2 === 'Horizontal line') readings.push('☿ Mercury Phalanx 2 (Horizontal line): Prone to financial miscalculation or contractual oversights.');
  if (vedic.mercury_phalange_2 === 'Vertical line (stress)') readings.push('☿ Mercury Phalanx 2 (Vertical line): Commercial pressure and business overextension.');
  if (vedic.mercury_phalange_3 === 'Open/Full') readings.push('☿ Mercury Phalanx 3 (Full): Good business/trade results.');
  if (vedic.mercury_phalange_3 === 'Thin') readings.push('☿ Mercury Phalanx 3 (Thin): Business acumen present, but profit margins leak.');

  // 15. Nails (Lectures 11-12)
  if (vedic.nail_shape_detail) {
    if (vedic.nail_shape_detail === 'Square') readings.push('💅 Square Nails: Practical, methodical, emotionally stable and fair-minded.');
    else if (vedic.nail_shape_detail === 'Round') readings.push('💅 Round Nails: Gentle, adaptable, affectionate, sensitive nature.');
    else if (vedic.nail_shape_detail === 'Conical/Tapered') readings.push('💅 Conical/Tapered Nails: Artistic, intuitive, sensitive to environment.');
    else if (vedic.nail_shape_detail === 'Spatulate') readings.push('💅 Spatulate Nails: Restless action-taker, inventor, thrives on practical execution.');
    else if (vedic.nail_shape_detail === 'Spoon-shaped (Concave)') readings.push('⚠️ Spoon Nails (Koilonychia): Thyroid issues, heart disease, anemia, or liver conditions (get a liver check); may also reflect general nutrient/vitamin deficiency.');
    else if (vedic.nail_shape_detail === 'Clubbed nail') readings.push('⚠️ Clubbed Nails: Severe disease indicator — lung problems/TB, stomach infection and inflammation, constipation, weak immunity, autoimmune disease.');
  }
  if (vedic.nail_color) {
    if (vedic.nail_color.includes('White spots')) readings.push('💅 White Spots on Nails: Classical sign of impending financial gain (not disease); conventionally also linked to calcium deficiency (not zinc).');
    else if (vedic.nail_color.includes('Yellow')) readings.push('⚠️ Yellow Nails: Blood-related issues, liver problems, commonly associated with bacterial infection.');
    else if (vedic.nail_color.includes('Blu') || vedic.nail_color.includes('Purple')) readings.push('⚠️ Black/Blue/Purple Nails: Most severe nail-color sign — whole-nail discoloration can indicate a long-term or very serious condition; a spot suggests onset of a disease; linked to toxin buildup or oxygen deficiency; a sudden appearance warrants checking for recent food poisoning.');
    else if (vedic.nail_color.includes('Pale')) readings.push('💅 Pale/White Nails: Blood deficiency (anemia), weak immunity, liver-related problems, lethargic/dull disposition — described as the strongest nail-color indicator of depression.');
    else if (vedic.nail_color.includes('Reddish')) readings.push('⚠️ Reddish Nails: Heart-related problems, blood pressure issues, quick temper; can also indicate depression (less strongly than white nails).');
    else if (vedic.nail_color.includes('Dark discoloration')) readings.push('⚠️ Dark Discoloration: May be mechanical/cooking injury to skin near the nail, OR a sign of food-poisoning/toxin buildup — check which applies.');
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
    readings.push('⚠️ Absent/Reduced Lunulae: Indicates declining health. If gone from all fingers but still present in the thumb, get a liver test. Can also correlate with stomach issues or mental-health concerns — not a fixed universal meaning.');
  }
  if (vedic.nail_biting) {
    readings.push('💅 Nail Biting: Driven by tension/nervousness; said to weaken the root chakra — associated with bone problems, security-related fear, and lower back pain.');
  }
  if (vedic.nail_health_flag) {
    readings.push(`🏥 Nail Health Note: ${vedic.nail_health_flag}`);
  }

  // 16. Mount Signs & Apex (Lectures 13-18)
  if (vedic.mount_jupiter) {
    const signs = vedic.mount_jupiter.signs || [];
    if (signs.includes('Cross')) readings.push('♃ Cross on Jupiter: Highly auspicious — happy marriage, noble education, blessed spousal connection (the only positive place for a cross).');
    if (signs.includes('Square')) readings.push('♃ Square on Jupiter (Teacher\'s Square): Natural instructional gift; protection from reputational attacks.');
    if (signs.includes('Triangle')) readings.push('♃ Triangle on Jupiter: Scientific, research-oriented, diplomatic nature.');
    if (signs.includes('Conch (Śaṅkha) 🐚')) readings.push('♃ Conch on Jupiter: Noble spiritual destiny and sudden spiritual uplift (Note 21 §1.1).');
    if (signs.includes('Flag 🚩')) readings.push('♃ Flag on Jupiter: Celebrated fame and magnified leadership willpower (Note 21 §1.2).');
    if (vedic.mount_jupiter.apex === 'Centered') readings.push('🎯 Jupiter Apex Centered: Dominant Guru influence — high vivek, moral discernment, patience, and fortunate expansion.');
    if (vedic.mount_jupiter.apex === 'Toward Saturn') readings.push('🎯 Jupiter Apex → Saturn: Knowledge gains seriousness (gambhīrtā), technical acumen, research depth ("khojī"), and respect for social norms.');
    if (vedic.mount_jupiter.apex === 'Toward Thumb') readings.push('🎯 Jupiter Apex → Thumb: Knowledge directed toward self ("I") — natural leadership ability, assertive authority, potential overconfidence.');
    if (vedic.mount_jupiter.apex === 'Toward Head Line') readings.push('🎯 Jupiter Apex → Mind Line: Intellect added to wisdom — practicality, multidisciplinary research capacity active from childhood.');
    if (vedic.mount_jupiter.apex === 'Toward Heart Line') readings.push('🎯 Jupiter Apex → Heart Line: Wisdom guided by emotional empathy — practical compassion and listening to one\'s heart.');
  }

  if (vedic.mount_saturn) {
    const signs = vedic.mount_saturn.signs || [];
    if (signs.includes('Cross')) readings.push('🪐 Cross on Saturn: Karmic warnings, unexpected life turns, risk of bone/joint accidents.');
    if (signs.includes('Star')) readings.push('🪐 Star on Saturn: Heavy karmic events, sudden stroke of fatalistic destiny or great endurance test.');
    if (signs.includes('Square')) readings.push('🪐 Square on Saturn: Supreme protective shield against physical accidents and karmic catastrophes.');
    if (signs.includes('Single Vertical Line')) readings.push('🪐 Single Vertical Line on Saturn: Prosperous and peaceful old age; unshakeable steady income.');
    if (signs.includes('Flag 🚩')) readings.push('🪐 Flag on Saturn: Prominence in karmic/scholarly works and high perseverance (Note 21 §1.2).');
    if (vedic.mount_saturn.apex === 'Centered') readings.push('🎯 Saturn Apex Centered: Dominant Śani influence — strong sense of duty, philosophical solitude, disciplined labor.');
    if (vedic.mount_saturn.apex === 'Toward Jupiter') readings.push('🎯 Saturn Apex → Jupiter: Wisdom and dharma added to work — brings shubhtā (auspiciousness) and softens karmic delays.');
    if (vedic.mount_saturn.apex === 'Toward Sun') readings.push('🎯 Saturn Apex → Sun: Fame through karma/work, but delayed recognition; watch for arthritis or BP.');
  }

  if (vedic.mount_sun) {
    const signs = vedic.mount_sun.signs || [];
    if (signs.includes('Star')) readings.push('☀️ Star on Sun: Worldwide renown, sudden fame, exceptional genius in arts or public office.');
    if (signs.includes('Trident')) readings.push('☀️ Trident on Sun Mount: Tri-fold renown — acclaim through art/status, commerce (Mercury), and perseverance (Saturn).');
    if (signs.includes('Diamond Chain')) readings.push('☀️ Diamond Chain on Sun: Wish fulfilment symbol — doubles the fame and protective radiance.');
    if (signs.includes('Canopy / Circle')) readings.push('☀️ Canopy / Circle on Sun: Lifetime umbrella of divine honor; impervious to disgrace.');
    if (signs.includes('Square')) readings.push('☀️ Square on Sun: Immunity from defamation, financial security against property loss.');
    if (signs.includes('Cross')) readings.push('☀️ Cross on Sun: Obstruction to fame and recognition, defamation risk.');
    if (signs.includes('Flag 🚩')) readings.push('☀️ Flag on Sun: High renown, widespread celebrity, strengthened willpower (Note 21 §1.2).');
    if (vedic.mount_sun.apex === 'Centered') readings.push('🎯 Sun Apex Centered: Dominant Sūrya influence — natural creative brilliance, dignified presence, healthy self-respect.');
    if (vedic.mount_sun.apex === 'Toward Saturn') readings.push('🎯 Sun Apex → Saturn: Serious/disciplined art; delayed fame achieved through laborious patience.');
    if (vedic.mount_sun.apex === 'Toward Mercury') readings.push('🎯 Sun Apex → Mercury: Eloquent speech, commercial flair in arts, charismatic presentation.');
  }

  if (vedic.mount_mercury) {
    const signs = vedic.mount_mercury.signs || [];
    if (signs.includes('Star')) readings.push('☿ Star on Mercury: Brilliance in rhetoric, scientific research, mathematical agility.');
    if (signs.includes('Square')) readings.push('☿ Square on Mercury: Protected against business ruin and fraud.');
    if (signs.includes('3+ Vertical Lines (Medical Stigmata)')) readings.push('☿ Medical Stigmata (3+ Lines): Natural healing hands, empathy, suited for medicine or therapy.');
    if (vedic.mount_mercury.apex === 'Centered') readings.push('🎯 Mercury Apex Centered: Dominant Budha influence — analytical logic, versatility, commercial diplomacy.');
    if (vedic.mount_mercury.apex === 'Toward Sun') readings.push('🎯 Mercury Apex → Sun: Communication backed by charm and charisma; persuasive orator in trade.');
    if (vedic.mount_mercury.apex === 'Toward Outside Edge') readings.push('🎯 Mercury Apex → Percussion Edge: Rough boundary crossing — classical texts associate with increased life struggle.');
  }

  if (vedic.mount_moon) {
    const signs = vedic.mount_moon.signs || [];
    if (signs.includes('Triangle')) readings.push('🌙 Triangle on Moon: Heightened psychic intuition, prophetic visions, mastery of occult arts.');
    if (signs.includes('Star') || signs.includes('Cross')) readings.push('🌙 Star/Cross on Moon: Psychological turbulence, vulnerability to over-imagination, caution near water bodies.');
    if (signs.includes('Square')) readings.push('🌙 Square on Moon: Protection during long travels and mental emotional balance under pressure.');
    if (signs.includes('Conch (Śaṅkha) 🐚')) readings.push('🌙 Conch on Moon/Ketū: High spiritual attainment, prophetic intuition, and sudden wealth (Note 21 §1.1).');
    if (vedic.mount_moon.apex === 'Centered / Sāmānya') readings.push('🎯 Moon Mount Centered/Balanced: Normal imaginative flow, adaptable to all environments, peace of mind.');
    if (vedic.mount_moon.apex === 'Toward Upper Mars') readings.push('🎯 Moon Bulge → Upper Mars: Restlessness, tendency toward irritation and quarrels; potential Chandra-Mangal wealth yoga.');
    if (vedic.mount_moon.apex === 'Toward Wrist / Ketu') readings.push('🎯 Moon Bulge → Ketū/Wrist: Inclination toward solitude, spirituality, and intuition; digestive sensitivity.');
    if (vedic.mount_moon.apex === 'Toward Venus') readings.push('🎯 Moon Bulge → Venus: Vast life force and expansive Life Line sweep.');
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
    if (vedic.line_life.features?.includes('Fork at end towards Moon') || vedic.line_life.features?.includes('Split Life Line (Dual Branches)')) {
      readings.push('✈️ Split Life Line (Dual Branches - Lecture 28 §3): Inward + outward branches indicate dual residences, frequent long-distance travel, and multitasker nature; ending of a branch around 50–60 indicates relocation (Moon influence).');
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
      readings.push('🌊 Fate from Moon Mount: Career needs public support, or a state-government-linked job; can also indicate Moon-related income (arts, share market, rental, interest).');
    } else if (vedic.line_fate.origin?.includes('Life')) {
      readings.push('🌱 Fate joined with Life Line: Career advanced with father/father-figure support — or, if the lines run together, the person takes on a father-figure/responsibility role in their own family.');
    } else if (vedic.line_fate.origin?.toLowerCase().includes('wrist')) {
      readings.push('⚓ Fate Line straight from the wrist: Self-made, hard-working person (support may still exist from father/family/surroundings).');
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
      readings.push('🎨 Head Line sloping/wavy toward Moon: The teacher calls this "very dangerous" — mood swings, daydreaming/living in imagination (not necessarily bad), possible depression. Watch for a cross/star at the end (suicidal-tendency warning).');
    } else if (vedic.line_head.terminus?.includes('Upper Mars')) {
      readings.push('📐 Straight Head Line to Mars: Very good if the mount\'s condition is good — strong personality; not good if the mount\'s condition is poor.');
    } else if (vedic.line_head.terminus?.includes('Mercury')) {
      readings.push('📐 Head Line ending at Mercury Mount: Very logical, very creative, out-of-the-box thinker, very intelligent.');
    }
    if (vedic.line_head.features?.includes('Writer\'s Fork (Fork at end)')) {
      readings.push('✍️ Writer\'s Fork: Multitasking ability, good writer/artist, business-minded — but the teacher\'s explicit caveat is that the mind stays disturbed/not calm despite the multitasking.');
    }
    if (vedic.line_head.signs?.includes('Island')) {
      readings.push('⚠️ Island on Head Line: Mental overload, migraine, period of indecision or intellectual strain.');
    }
  }

  if (vedic.line_heart) {
    if (vedic.line_heart.terminus?.includes('Jupiter')) {
      readings.push('❤️ Heart Line terminating under Jupiter: Practical but fair-minded, gives honest views in groups without being harsh on others; guru-like wisdom, straightforward.');
    } else if (vedic.line_heart.terminus?.includes('Saturn')) {
      readings.push('❤️ Heart Line terminating under Saturn: Cold, somewhat selfish (matlabī), little warmth or emotional attachment; speaks only when it serves a purpose.');
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

  // 18. Mercury Line / Health / Liver (Lecture 27 §9)
  if (vedic.line_mercury_present === false) {
    readings.push('✨ Mercury Line Absent: Considered good — the teacher states "it is good that it is not [there]"; presence (not absence) is linked to health/liver issues.');
  } else if (vedic.line_mercury_present === true) {
    if (vedic.line_mercury_starts_below_heart) {
      readings.push('⚠️ Mercury Line below Heart: More health problems (general) — also called the liver line, linked to liver issues when present.');
    }
    if (vedic.line_mercury_starts_above_heart) {
      readings.push('🩺 Mercury Line above Heart: Business indications in later ages — the "healer line," found in doctors, healers, counsellors (Mercury governs speech/vāṇī).');
    }
    if (vedic.line_mercury_joins_moon) {
      readings.push('👁️ Line of Intuition (Joined to Moon): Strong premonitions, prophetic dreams, keen gut instincts.');
    }
    if (vedic.line_mercury_single_vertical) {
      readings.push('💰 Single Vertical Line on Mercury: Sudden money gain.');
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
    readings.push(`🧬 ${vedic.simian_type}: Sharp, practical, and stubborn — balances heart and mind well when the line quality is good; can become irritable, anxious, or suspicious when unbalanced.`);
  }

  // ─── 19. Vivāha Rekhā / Marriage Line (Lecture 28 §4, §5, §5.7) ───
  if (vedic.line_marriage) {
    const m = vedic.line_marriage;

    // Quality
    if (m.quality === 'Normal (Healthy)') {
      readings.push('💍 Vivāha Rekhā (Balanced/Normal): Auspicious indicator of healthy, emotionally balanced, and fulfilling marital bonding.');
    } else if (m.quality === 'Faint/Thin (Detached)') {
      readings.push('💍 Vivāha Rekhā (Faint/Thin): Low emotional/romantic attachment; marriage approached with spiritual detachment or practical independence.');
    } else if (m.quality === 'Dark/Heavy (Rigid/Burdened)') {
      readings.push('💍 Vivāha Rekhā (Dark/Heavy — Gaḍhī): Orthodox, rigid, or controlling domestic approach; high pressure/burdens on married life. Check Life Line for parasite lines from dependent relatives.');
    } else if (m.quality === 'Broken Repeatedly') {
      readings.push('⚡ Vivāha Rekhā (Broken Repeatedly): Intermittent phases of marital harmony alternating with domestic friction.');
    } else if (m.quality === 'Zigzag') {
      readings.push('〰️ Vivāha Rekhā (Zigzag): Unpredictable fluctuations in domestic harmony.');
    } else if (m.quality === 'Absent') {
      readings.push('💍 Vivāha Rekhā (Absent): Does NOT indicate bachelorhood (per deśa-kāla-paristhiti); reflects lack of emotional romantic dependency or a self-contained relationship approach.');
    }

    // Parasite Line linkage (Lecture 28 §4.1)
    if (m.has_parasite_line_on_life) {
      readings.push('⚠️ Parasite Line (Upajīvī Rekhā) on Life Line: Dependent relatives, ailing family members, or in-laws are causing direct domestic strain on marital life.');
    }

    // Secondary lines (Lecture 28 §4)
    if (typeof m.secondary_lines_count === 'number' && m.secondary_lines_count > 1) {
      readings.push(`💞 Multiple Relationship Lines (${m.secondary_lines_count} lines): Reflects intense past attractions, crushes, or relationship negotiations — does NOT indicate multiple marriages.`);
    }

    // Age on Mercury Mount (Lecture 28 §4.2)
    if (typeof m.estimated_age === 'number' && m.estimated_age > 0) {
      readings.push(`⏳ Vivāha Rekhā Timing: Approximately age ${m.estimated_age} (calibrated on the 0–56 Mercury mount vertical scale; Heart Line = 0, Base joint = 56).`);
    }

    // Formations (Lecture 28 §5)
    const forms = m.formations || [];
    if (forms.includes('Sharp Upward Hook')) {
      readings.push('🚫 Upward Hook on Marriage Line: Classical sign of lifelong aversion to marriage, bachelorhood, or insurmountable obstacles to marriage.');
    }
    if (forms.includes('Cut by Vertical Line')) {
      readings.push('⚠️ Vertical Line Cutting Marriage Line: Sudden break or unexpected crisis in marriage; monitor spouse health/accidental risk.');
    }
    if (forms.includes('Continues after Vertical Cut')) {
      readings.push('🔄 Marriage Line Continues after Cut: Resolution of marital crisis; partnership endures through the storm.');
    }
    if (forms.includes('Dropping toward Heart Line')) {
      readings.push('💔 Marriage Line Drooping toward Heart Line: Low emotional vitality, dull/disappointing marriage, emotional burden, or heartbreak.');
    }
    if (forms.includes('Cutting Heart Line') || m.crosses_heart_line) {
      readings.push('⚡ Marriage Line Cutting Heart Line: Worst sorrowful termination; intense grief or emotional breakdown from marital collapse.');
    }
    if (forms.includes('Short Downward Branches')) {
      readings.push('〰️ Short Downward Branches: Normal domestic ups and downs (found in 50%+ of palms); manageable if not touching Heart Line.');
    }
    if (forms.includes('Gentle Upward Curve / Upward Branches')) {
      readings.push('✨ Gentle Upward Curve/Branches: Auspicious, happy married life and mutual elevation.');
    }
    if (forms.includes('Circle / Dot at End')) {
      readings.push('⭕ Circle at End of Marriage Line: Spouse mortality warning / bereavement marker.');
    }
    if (forms.includes('Small Island')) {
      readings.push('⚠️ Small Island on Marriage Line: Sudden acute marital crisis experienced with intense contrast after a smooth phase.');
    }
    if (forms.includes('Large Island')) {
      readings.push('⚠️ Large Island on Marriage Line: Chronic ongoing friction normalized from the beginning of married life.');
    }
    if (forms.includes('Fork at Start')) {
      readings.push('🌱 Fork at Start of Marriage Line: Initial hesitation, delays, or family distractions before marital stabilization.');
    }
    if (forms.includes('Fork at End')) {
      readings.push('🥀 Fork at End of Marriage Line: Loss of interest, divergent paths, or emotional estrangement in later years.');
    }
    if (forms.includes('Fork in Middle')) {
      readings.push('🌿 Fork in Middle of Marriage Line: Bifurcation of energy — upward branch promotes growth, downward branch brings friction.');
    }
    if (forms.includes('Triangle on Line')) {
      readings.push('🔺 Triangle on Marriage Line: Highly fortunate, rare blessing in marital life.');
    }
    if (forms.includes('Reaching Sun Mount') || m.reaches_sun_mount) {
      readings.push('🌟 Marriage Line Reaching Sun Mount: Marriage brings elevated social status, name, fame, and wealth.');
    }
    if (forms.includes('Cutting Sun Mount/Line') || m.cuts_sun_mount) {
      readings.push('⚠️ Marriage Line Cutting Sun Mount/Line: Scandal, reputational attack, or financial loss through spouse/woman.');
    }
    if (forms.includes('Line from Venus Mount Cutting') || m.venus_line_cutting) {
      readings.push('⚔️ Venus Line Cutting Marriage Line: Extreme spousal discord; potential for domestic violence or partner harm (verify with Mars and Thumb).');
    }
    if (forms.includes('>--< Divorce Indication') || forms.includes('>< Divorce Indication')) {
      readings.push('⚡ >--< Formation on Marriage Line: Classical indicator of divorce or legal separation (bifurcated on both ends).');
    }
    if (forms.includes('Downward Hook')) {
      readings.push('⚓ Downward Hook on Marriage Line: Permanent unresolved marital deadlock.');
    }

    // Heart Line Linkage Synthesis (Lecture 28 §5.7)
    if (vedic.line_heart?.terminus?.includes('Saturn')) {
      readings.push('💍 Marriage Synergy: Heart line terminates under Saturn — practical, calculative love ("loves with the head"); strong arranged-marriage alignment.');
    } else if (vedic.line_heart?.terminus?.includes('Jupiter')) {
      readings.push('❤️ Marriage Synergy: Heart line reaches Jupiter Mount — idealistic romantic devotion; high love-marriage alignment (boosted in Fire/Water hands).');
    }
  }

  // 20. Karmic Hand Comparison (Lectures 01, 06, 22)
  if (vedic.lh_vs_rh_notes && vedic.lh_vs_rh_notes.trim().length > 0) {
    readings.push(`⚖️ Left vs Right Hand Synthesis: ${vedic.lh_vs_rh_notes.trim()}`);
  }

  return readings;
};
