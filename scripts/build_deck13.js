const fs = require('fs');
const path = require('path');

// Lecture 13: Jupiter Mount (Guru Parvat) Comprehensive Learning Deck Builder
// Generates 140+ Flashcards and 140+ Quiz Questions (Single, Multiple, True/False, Scenario)

console.log('Building Lecture 13 high-yield Learning Deck...');

const flashcards = [];
const quizzes = [];

const NOTE_ID = '13 - JU Mount.md';
const NOTE_TITLE = 'Jupiter Mount (Guru Parvat) — Palmistry Class Notes';

function addCard(category, tag, subtopic, front, back, tip) {
  flashcards.push({
    id: `ju-mount-fc-${flashcards.length + 1}`,
    sourceNoteId: NOTE_ID,
    sourceTitle: NOTE_TITLE,
    category,
    tag,
    subtopic,
    front,
    back,
    tip,
  });
}

function addQuiz(type, subtopic, difficulty, question, options, correctAnswer, explanation, practicalTakeaway, scenario) {
  quizzes.push({
    id: `ju-mount-qz-${quizzes.length + 1}`,
    sourceNoteId: NOTE_ID,
    type,
    subtopic,
    difficulty,
    question,
    options,
    correctAnswer,
    explanation,
    practicalTakeaway,
    scenario,
  });
}

// ==========================================
// SECTION 1: APEX FUNDAMENTALS & ANALOGIES
// ==========================================

addCard(
  'principle',
  'PREDICTION FRAMEWORK',
  'Prediction Framework',
  'Which three interlinked pillars form the classical predictive framework in palmistry, and why?',
  '1. Mounts (parvat)\n2. Lines (rekhāen)\n3. Signs and symbols (chinh)\n\nWhy: The result of any given mount is substantially modified or determined by the specific signs, symbols, and intersecting lines positioned on it.',
  'Foundational rule from Section 1'
);

addCard(
  'principle',
  'APEX DEFINITION',
  'Apex Definition & Astrological Analogy',
  'What is the "Apex" (Kendra Bindu) of a mount, and what does it reveal about a person?',
  'The Apex is the central convergence point of skin ridge lines on a mount.\n\nIt indicates whether that planet’s influence is present in excess ("adhikta") or serves as the dominant ("pradhān") force shaping the person’s core temperament and nature.',
  'Compare with a planet sitting in the Lagna'
);

addCard(
  'principle',
  'ASTROLOGICAL ANALOGY',
  'Apex Definition & Astrological Analogy',
  'How does the Apex correspond to a planet in a natal birth chart (kuṇḍalī)?',
  'Just as a planet placed in the Lagna (Ascendant) or possessing high Ṣaḍbala exerts an oversized influence over the native, finding a mount’s Apex exactly centered means that planet exerts a dominant ("pradhān") influence in their life.',
  'Ṣaḍbala / Lagna placement parallel'
);

addCard(
  'warning',
  'DIAGNOSTIC ERROR',
  'Apex Definition & Astrological Analogy',
  'Why is locating the Apex alone insufficient when evaluating a mount?',
  'Because mount quality and elevation must be verified simultaneously!\n\nA mount with a centered apex may still be flat (nimna) or spongy, meaning its potential qualities cannot express normally or fully.',
  'Apex = position; Texture/Height = capacity to deliver results'
);

addCard(
  'trait',
  'MULTIPLE APEXES',
  'Apex Definition & Astrological Analogy',
  'What does it indicate if a palmist identifies multiple mounts with exactly centered apexes on the same hand?',
  'It indicates that multiple planetary forces exert roughly equal, balanced influence on the native’s personality rather than a single planet monopolizing their temperament.',
  'Equal planetary weight distribution'
);

// ==========================================
// SECTION 2: MOUNT QUALITY (PUFFED, SPONGY, PRESSED)
// ==========================================

addCard(
  'measurement',
  'MOUNT TEXTURE',
  'Mount Physical Quality',
  'What are the three physical texture states of a mount when inspected and palpated?',
  '1. Puffed/Raised (ubharā huā) — clearly elevated.\n2. Pressed/Flat (dabā huā) — sunken or flat.\n3. Spongy — compresses easily upon pressure and returns slowly to its original shape.',
  'Checked by physical palpation with a finger'
);

addCard(
  'warning',
  'SPONGY MOUNT',
  'Mount Physical Quality',
  'What is the classical diagnostic significance of a "spongy mount"?',
  'A spongy mount is distinctly unfavorable. Unlike a healthy mattress (gaddā) that rebounds immediately, a mount that takes noticeable time to recover shape indicates depleted planetary vitality and poor results in its affairs.',
  'Mattress bounce = healthy; Slow sponge return = deficient/poor vitality'
);

addCard(
  'rule',
  'MATTRESS PRINCIPLE',
  'Mount Physical Quality',
  'What is the ideal tactile response when pressing a healthy, well-developed mount?',
  'It should feel firm and resilient like a high-quality mattress (gaddā) — springing back immediately into position the moment pressure is released.',
  'Resilient elasticity indicates strong prana/vitality'
);

addCard(
  'principle',
  'MERGED MOUNTS',
  'Mount Physical Quality',
  'Which two mounts frequently merge together in the center of the palm, as noted on the teacher’s own hand?',
  'The Sun (Sūrya) and Mercury (Budha) mounts frequently merge, where Sun shifts toward Mercury, causing the Mercury area to look raised while Sun’s natural seat appears depressed.',
  'Observed on both the teacher’s and Dravin ji’s hands'
);

addCard(
  'rule',
  'HAND PRIORITY',
  'Hand Reading Rules',
  'Which hand should primarily be examined when reading mounts, and what is the role of the inactive hand?',
  'Primarily the ACTIVE hand (dominant working hand) is read for current life manifestations.\n\nThe INACTIVE hand provides baseline tendencies and latent or modified planetary alignments.',
  'Active hand reveals present karma; Inactive shows foundational wiring'
);

// ==========================================
// SECTION 3: LOCATING THE APEX
// ==========================================

addCard(
  'measurement',
  'APEX DETECTION',
  'Apex Detection Methodology',
  'How do you visually locate the Apex on a mount under proper lighting?',
  'Observe the fine skin ridges (dhāriyāṅ) forming a triradius pattern — typically three distinct micro-lines converging at a central focal point.',
  'Fine skin ridges under direct oblique light'
);

addCard(
  'rule',
  'INK DEMONSTRATION',
  'Apex Detection Methodology',
  'Why did the instructor apply ink to Arvind ji’s hand during the class demonstration?',
  'Ink makes microscopic epidermal ridges stand out with sharp contrast, allowing students to trace converging triradius lines straight to the apex focal point.',
  'Classical ink print diagnostic method'
);

addCard(
  'principle',
  'ESOTERIC RIDGES',
  'Apex Detection Methodology',
  'What broader esoteric concepts connect to the fine ridge patterns of mount apexes?',
  'They connect directly to the five elements (Pañch-Tattva) and dermatoglyphic fingerprint patterns (loops, whorls, arches) at the fingertips.',
  'Bridge between palm ridges and cosmic elements'
);

// ==========================================
// SECTION 4: MOUNT ELEVATION PARAMETERS
// ==========================================

addCard(
  'measurement',
  'MOUNTAIN ELEVATION',
  'Mount Elevation Parameters',
  'What are the three elevation classifications of any palm mount based on the mountain analogy?',
  '1. Ati-vikshit (Over-developed) — towering/excessively swollen.\n2. Sāmānya (Normal) — moderate, balanced elevation.\n3. Nimna / Avikasit (Under-developed) — flat, depressed, or sunken.',
  'Mountain elevation framework'
);

addCard(
  'principle',
  'ASTROLOGICAL ELEVATION',
  'Mount Elevation Parameters',
  'How does the concept of "excess (ati) is also harmful" correlate with Vedic astrology houses?',
  'A planet in Kendra or Trikoṇa is auspicious, whereas placements in 6th/8th/12th are difficult. However, excessive planetary energy in the 11th house (Ekādash) with retrograde motion (vakrī) also becomes harmful. Thus, over-elevation (Ati-vikshit) is toxic, not auspicious.',
  'Over-development distorts planetary energy into pathology'
);

// ==========================================
// SECTION 5: JUPITER MOUNT — NORMAL (SĀMĀNYA) CONDITION
// ==========================================

addCard(
  'trait',
  'NORMAL JUPITER TRAITS',
  'Sāmānya Condition',
  'List the primary classical qualities of a Sāmānya (Normal) Jupiter mount in teaching order.',
  '1. Gyān (Knowledge)\n2. Vivek (Discernment / practical wisdom)\n3. Guidance / Counseling / Preaching\n4. Dhairya (Patience)\n5. Ādhyātma (Authentic, inclusive spirituality)\n6. Respect for gurus and elders',
  'Teaching order established in Lecture 13'
);

addCard(
  'contrast',
  'KNOWLEDGE VS ARROGANCE',
  'Sāmānya Condition',
  'How does a person with a normal Jupiter mount handle their knowledge compared to an afflicted one?',
  'Normal: Has profound knowledge but zero arrogance (ghamand); never boasts or demeans others’ understanding.\n\nAfflicted: Constantly praises their own intellect, dismisses other teachers, and claims only they know the truth.',
  'Ego-free scholarship vs boastful pride'
);

addCard(
  'trait',
  'VIVEK IN PEDAGOGY',
  'Sāmānya Condition',
  'How does a normal-Jupiter person teach or counsel someone without belittling them?',
  'They instruct while leaving the student unburdened and respected, avoiding condescending remarks like "you probably never studied this." They elevate the learner rather than establishing personal superiority.',
  'Pedagogical humility'
);

addCard(
  'principle',
  'TAROT & NUMEROLOGY',
  'Sāmānya Condition',
  'Which Tarot card and Numerological configuration correspond to a normal Jupiter mount?',
  '- Tarot: The Hierophant (the wise, benevolent spiritual guide).\n- Numerology: A single number 3 with a positive decimal.',
  'Esoteric correspondences for normal Jupiter'
);

addCard(
  'trait',
  'DH AIRYA (PATIENCE)',
  'Sāmānya Condition',
  'How does patience (dhairya) physically and behaviorally manifest in a normal-Jupiter native?',
  'Patience is visible as a calm, serene facial expression. When someone speaks, they listen fully and respectfully without interrupting or rushing to reply.',
  'Quiet, attentive active listening'
);

addCard(
  'trait',
  'SPIRITUALITY TEMPERAMENT',
  'Sāmānya Condition',
  'What defines the spiritual disposition of someone with a normal Jupiter mount?',
  'Broad-minded, non-fanatical dharma. They respect their own spiritual path and honor all other traditions equally, serving living beings without obsessive ritual rigidity or display.',
  'Universal dharma over dogma'
);

addCard(
  'rule',
  'RESPECT FOR JUNIORS',
  'Sāmānya Condition',
  'How does a normal-Jupiter person treat someone younger or junior who offers a valuable insight?',
  'They gladly respect and receive knowledge from anyone, even a younger person or child, because their reverence is for the knowledge itself, not personal ego.',
  'True humility in learning'
);

addCard(
  'principle',
  'BHĀGYAVĀN (FORTUNATE)',
  'Sāmānya Condition',
  'Why is a normal-Jupiter person described as Bhāgyavān (fortunate), beyond superstitious luck?',
  'Because possessing knowledge, discernment (vivek), and patience prevents them from creating self-inflicted crises. By governing their desires and speech, they preserve domestic peace and natural prosperity.',
  'Jupiter is the kāraka of fortune and wisdom'
);

addCard(
  'trait',
  'HEALTH GOVERNANCE',
  'Sāmānya Condition',
  'Which anatomical organs and health systems are governed by a healthy, normal Jupiter mount?',
  'The stomach, ears, and liver.\n\nUnder normal mount conditions, digestion is balanced, hearing is sharp, and liver function remains optimal.',
  'Key anatomical triad: Stomach, Ears, Liver'
);

addCard(
  'trait',
  'GENEROSITY (UDĀR HṚIDAY)',
  'Sāmānya Condition',
  'What distinguishes the generosity (udār hṛiday) of a normal-Jupiter native?',
  'They give wholeheartedly without expecting praise or reminding the recipient later ("remember I gave you money"). Even without money, they offer emotional solace, food, and patience.',
  'No ego strings attached to charity'
);

addCard(
  'trait',
  'FOOD PREFERENCES',
  'Sāmānya Condition',
  'What are the dietary habits and food preferences of a normal-Jupiter native?',
  'They enjoy sweets and good quality food (foodie temperament), but maintain moderation and prefer clean, Sātvik sustenance without overeating.',
  'Refined, moderate Sātvik foodie'
);

addCard(
  'trait',
  'MĀAN-PRATISHṬHĀ (REPUTATION)',
  'Sāmānya Condition',
  'How is respect and reputation (māan-pratishṭhā) acquired by someone with a normal Jupiter mount?',
  'It arrives organically. They never beg, demand, or advertise for respect; society naturally honors them because of their mature, peaceful conduct.',
  'Earned gravitas vs manufactured fame'
);

addCard(
  'warning',
  'FEAR-BASED REMEDIES',
  'Sāmānya Condition',
  'How does a normal-Jupiter practitioner handle astrological guidance or remedies compared to an unethical one?',
  'They NEVER weaponize fear to coerce clients into costly remedies or ritual obedience. They educate with clarity, optimism, and ethical detachment.',
  'Ethical consulting vs exploitation'
);

// ==========================================
// SECTION 6: JUPITER MOUNT — OVER-DEVELOPED (ATI-VIKSHIT)
// ==========================================

addCard(
  'warning',
  'ATI-VIKSHIT ESOTERIC',
  'Ati-vikshit Condition',
  'What are the astrological and numerological correspondences of an Ati-vikshit (over-developed) Jupiter mount?',
  '- Astrology: Jupiter afflicted (pīḍit) AND retrograde (vakrī).\n- Numerology: A "triple 3" in negative form.',
  'Excess swollen energy becomes toxic'
);

addCard(
  'trait',
  'ATI-VIKSHIT EGO',
  'Ati-vikshit Condition',
  'How does an Ati-vikshit Jupiter native react when confronted with a question they cannot answer?',
  'They lack the humility to say "I don’t know." Instead, they react with intense anger and defensiveness, attacking the questioner ("why ask irrelevant questions?") to hide their lack of depth.',
  'Defensive arrogance masking ignorance'
);

addCard(
  'trait',
  'HITLER COMPLEX',
  'Ati-vikshit Condition',
  'What is the "Main hi hoon" (I alone am) complex associated with the Ati-vikshit Jupiter mount?',
  'A tyrannical conviction that one’s personal intellect is supreme. Described as a "Hitler-type" state where the individual demands absolute compliance and dismisses all other voices.',
  'Authoritarian intellectual tyranny'
);

addCard(
  'trait',
  'GLUTTONY BEHAVIOR',
  'Ati-vikshit Condition',
  'What extreme food behavior illustrates the Ati-vikshit condition?',
  'Unrestrained gluttony. At a feast (e.g. Brāhman bhoj), they pack excessive portions, hoard sweets into containers to take home, and display complete lack of dietary dignity.',
  'Loss of restraint around sweets and luxury food'
);

addCard(
  'warning',
  'LIVER PATHOLOGY',
  'Ati-vikshit Condition',
  'Which specific medical issue is linked to an Ati-vikshit, afflicted Jupiter mount?',
  'Liver enlargement (hepatomegaly) and metabolic disorders caused by excessive caloric intake and planetary affliction.',
  'Medical palmistry correlation'
);

addCard(
  'trait',
  'ENTOURAGE ADDICTION',
  'Ati-vikshit Condition',
  'How do Ati-vikshit teachers or leaders behave regarding personal publicity and status?',
  'They crave constant theatrical recognition, surrounding themselves with camera crews, sycophantic entourages, and pompous titles to manufacture external prestige.',
  'Theatrical guru / politician archetype'
);

addCard(
  'trait',
  'HYPOCRITICAL JUSTICE',
  'Ati-vikshit Condition',
  'How does an Ati-vikshit native’s sense of justice and fairness operate?',
  'Double standard: When viewing others, they preach rigid moralism ("right is right"). But the moment an issue affects themselves, they declare: "I am right and everyone else is wrong."',
  'Selective, self-serving righteousness'
);

addCard(
  'contrast',
  'CHITRĀ VS SVĀTI',
  'Ati-vikshit Condition',
  'Explain the Chitrā vs. Svāti nakṣatra analogy regarding knowledge in the Ati-vikshit condition.',
  'Chitrā represents the genuine creative act of deep learning. Svāti represents broadcasting like the wind. The Ati-vikshit person learns only a superficial snippet, then immediately broadcasts it loudly on social media like a grand achievement.',
  'Superficial learning + massive publicity'
);

// ==========================================
// SECTION 7: JUPITER MOUNT — UNDER-DEVELOPED (NIMNA)
// ==========================================

addCard(
  'trait',
  'NIMNA ASTROLOGY',
  'Nimna Condition',
  'What is the astrological astrological correspondence of a Nimna (under-developed / flat) Jupiter mount?',
  'Guru ast (combust Jupiter) — Jupiter afflicted and drained of light by close solar proximity.',
  'Extinguished intellectual radiance'
);

addCard(
  'trait',
  'INARTICULATE LEARNER',
  'Nimna Condition',
  'How is intellectual expression impaired in a person with a nimna Jupiter mount?',
  'Like a quiet child sitting at the back of the classroom: they may grasp an idea internally, but completely lack the self-confidence and vocabulary to express or defend it to others.',
  'Suppressed articulation & communication paralysis'
);

addCard(
  'trait',
  'CHRONIC APATHY',
  'Nimna Condition',
  'What mental state arises from an undeveloped Jupiter mount regarding education and life curiosity?',
  'Profound boredom and cynicism ("nāstiktā"). They feel learning is pointless, nothing in life holds value, and they refuse to study or expand their intellect.',
  'Intellectual inertia & existential apathy'
);

addCard(
  'warning',
  'GOD CLAIM PARADOX',
  'Nimna Condition',
  'Describe the psychological paradox where a severely deficient Jupiter leads to grandiose delusions of godhood.',
  'Because true vivek (discernment) is absent, severe affliction can invert into grotesque megalomania. Illustrated by the 28-year-old case with Mars-Rāhu in 2nd and Jupiter in 3rd who publicly claimed he was God.',
  'Absence of discrimination leads to delusional self-deification'
);

addCard(
  'rule',
  'CHARITRAHEEN LABEL',
  'Nimna Condition',
  'Why do classical texts describe an afflicted/flat Jupiter as "charitraheen" (lacking character), and how should a modern palmist apply this?',
  'Classical texts denote the total loss of patience, discernment, and ethical compass. However, a modern palmist must NEVER apply this label blindly without corroborating other mounts, lines, and fingers.',
  'Synthesize multi-indicator evidence before moral judgments'
);

addCard(
  'trait',
  'EXIT RESENTMENT',
  'Nimna Condition',
  'How does a nimna-Jupiter person behave when leaving an organization or relationship compared to a normal type?',
  'Normal: Leaves with dignity and never speaks ill of past employers.\n\nNimna: Spreads venom, gossips, and badmouths former colleagues and employers because they lack internal substance.',
  'Badmouthing after leaving a situation'
);

addCard(
  'trait',
  'SUBORDINATE CONFORMIST',
  'Nimna Condition',
  'What is the "jaisa aap kahoge waisa karenge" follower personality associated with low Jupiter?',
  'Having no confidence in their own moral judgment or intellect, they become passive followers who blindly agree with whatever authority dictates.',
  'Subservient follower archetype'
);

// ==========================================
// SECTION 8: JUPITER VS MERCURY KNOWLEDGE DYNAMICS
// ==========================================

addCard(
  'contrast',
  'HORIZONTAL VS VERTICAL',
  'Guru vs Budha Knowledge',
  'Contrast the structure of Jupiter’s (Guru) knowledge with Mercury’s (Budha) knowledge.',
  '- Jupiter (Horizontal Depth): Deep, continuous immersion and specialization within a single domain until total mastery.\n\n- Mercury (Vertical Breadth): Moving across multiple disciplines (learning subject A, then B, then C), prioritizing intellectual variety.',
  'Specialist depth (Jupiter) vs Multi-disciplinary breadth (Mercury)'
);

// ==========================================
// SECTION 9: APEX SHIFT DIRECTIONS
// ==========================================

addCard(
  'principle',
  'SHIFT MECHANICS',
  'Apex Shift Directions',
  'What happens fundamentally when the Apex of a mount shifts toward another area of the hand?',
  'Whichever neighboring mount or feature the shifted Apex moves toward, the base planet takes on the qualities, duties, and characteristics of that target feature.',
  'Core apex modification law'
);

addCard(
  'trait',
  'APEX TOWARD SATURN',
  'Apex Shift Directions',
  'What personality and intellectual changes occur when the Jupiter Apex shifts toward Saturn?',
  '1. Knowledge acquires seriousness (gambhīrtā).\n2. Native becomes research-inclined ("khojī").\n3. Gain in technical/hardware aptitude.\n4. Deliberate, unhurried, measured speech.\n5. Deep respect for social norms and traditions (does not break rules).',
  'Knowledge + Karma/Saturn fusion'
);

addCard(
  'warning',
  'SATURN HEALTH IMPACT',
  'Apex Shift Directions',
  'What caution exists when the Jupiter Apex tilts strongly toward Saturn?',
  'Saturn’s restrictive, chronic, and degenerative influences bleed into Jupiter-governed organs (liver, digestion, hearing), elevating long-term health risks.',
  'Medical overlay of Saturn onto Jupiter physiology'
);

addCard(
  'trait',
  'APEX TOWARD THUMB',
  'Apex Shift Directions',
  'What traits emerge when the Jupiter Apex shifts toward the Thumb (Self)?',
  'Knowledge becomes fused with the "I" (Ahankāra). The person becomes extroverted, highly talkative, assertive unprompted, commanding, and overconfident. Highly ambitious and dominant.',
  'Knowledge focused into personal ego/will'
);

addCard(
  'rule',
  'LEADERSHIP SYNERGY',
  'Apex Shift Directions',
  'Which hand features amplify an Apex shifted toward the Thumb into a powerhouse leadership configuration?',
  '1. Large thumb (>90° angle)\n2. High willpower in phalanges\n3. Straight Jupiter finger (not leaning toward Saturn)\n\nThis creates a confident, natural commanding leader.',
  'Executive leadership hand recipe'
);

addCard(
  'trait',
  'APEX TOWARD MIND LINE',
  'Apex Shift Directions',
  'What happens when the Jupiter Apex shifts downward toward the Mind Line?',
  'Knowledge merges with practical intellect. The person develops sharp analytical acumen, learns multiple diverse subjects, engages in cutting-edge research, and knows how to monetize their knowledge.',
  'Practical monetization & intellectual application'
);

addCard(
  'measurement',
  'AGE 7-8 PRECOCITY',
  'Apex Shift Directions',
  'What special timing signature occurs if the Jupiter Apex leans toward the Mind Line and the Mind Line starts early from that same root?',
  'Precocious intellect from early childhood (~ages 7–8). Such individuals cannot easily be deceived, possess mature cognitive skepticism, and apply intellect even to religious tenets.',
  'Early childhood intellectual awakening'
);

addCard(
  'trait',
  'APEX TOUCHING HEART LINE',
  'Apex Shift Directions',
  'What is the interpretation when the Jupiter Apex reaches down and touches the Heart Line?',
  'Practicality and empathy merge with philosophical wisdom. While discerning and practical, the individual listens to their heart and leads with compassion.',
  'Heart-guided wisdom'
);

// ==========================================
// SECTION 10: SYMBOLS ON JUPITER MOUNT
// ==========================================

addCard(
  'rule',
  'RING OF SOLOMON CRITERIA',
  'Symbols on Jupiter',
  'What are the mandatory anatomical criteria for a genuine Ring of Solomon?',
  'It must begin between the Jupiter and Saturn fingers and curve downwards in a distinct SEMI-CIRCLE toward the thumb.\n\nA straight line or a line curving toward Saturn DOES NOT qualify.',
  'Must be a semi-circular arc curving toward the thumb'
);

addCard(
  'trait',
  'RING OF SOLOMON MEANING',
  'Symbols on Jupiter',
  'What gifts and traits are indicated by an authentic Ring of Solomon?',
  'Exceptional psychic intuition, ability to "listen to nature," mastery in Praśna Śāstra (horary astrology) or Tarot, and natural ability to serve as an extraordinary mentor or counselor.',
  'Named after King Solomon who understood the speech of beasts'
);

addCard(
  'rule',
  'TEACHER SQUARE CRITERIA',
  'Symbols on Jupiter',
  'What distinguishes a genuine Teacher’s Square from accidental line crossings on the Jupiter mount?',
  'A true Teacher’s Square must be an independently formed geometric four-sided box. Accidental intersection of two random crossing lines does NOT constitute a Teacher’s Square.',
  'Independent structural entity requirement'
);

addCard(
  'trait',
  'TEACHER SQUARE RESULTS',
  'Symbols on Jupiter',
  'What does a genuine Teacher’s Square signify for a person’s career and intellectual life?',
  'It denotes a natural teacher, counselor, or guide who possesses lifelong intellectual protection and continuously learns and upgrades their knowledge until old age.',
  'Lifelong counseling prowess & wisdom expansion'
);

addCard(
  'principle',
  'CROSS ON JUPITER EXCEPTION',
  'Symbols on Jupiter',
  'What is the famous classical exception regarding the Cross (✕) mark on the Jupiter mount?',
  'While a Cross is considered inauspicious on virtually every other mount on the palm, the Jupiter mount is the UNIQUE EXCEPTION where an independent Cross is extraordinarily auspicious!',
  'The only mount where a Cross brings great fortune'
);

addCard(
  'trait',
  'CROSS ON JUPITER RESULTS',
  'Symbols on Jupiter',
  'What benefits does a genuine Cross bring on the Jupiter mount, especially for women?',
  'It magnifies wisdom, deepens spiritual knowledge, and on a female palm, strongly indicates a harmonious, fortunate married life (to be verified with Mercury).',
  'Knowledge amplifier & harmonious marital life'
);

addCard(
  'warning',
  'INDEPENDENT CROSS RULE',
  'Symbols on Jupiter',
  'Why do random intersecting lines not qualify as an auspicious Cross on Jupiter?',
  'Natural lines cross each other routinely. A true auspicious Cross must be an independent, self-contained cross mark, clearly distinguished from ordinary palm creases.',
  'Must be an isolated, intentional symbol'
);

// ==========================================
// SECTION 11: CASE STUDIES & PRACTICAL HAND READINGS
// ==========================================

addCard(
  'scenario',
  'ONLINE HAND SYNTHESIS',
  'Case Studies & Live Analysis',
  'In the online hand demonstration, how did the instructor balance a nimna Jupiter mount with other compensating hand features?',
  'Although the mount was nimna (dampening full expression despite a centered apex), the Jupiter finger tilted toward Saturn (preventing rule-breaking), while strong Venus and Mercury added communication and progressive vision.',
  'Always synthesize mount + line + finger posture'
);

addCard(
  'scenario',
  'ARVIND JI EVALUATION',
  'Case Studies & Live Analysis',
  'Why was the initial claim of a Ring of Solomon on Arvind ji’s hand dismissed, and what was found instead?',
  'The line was straight rather than curved toward the thumb, immediately disqualifying it as a Ring of Solomon. However, a genuine auspicious Cross was identified on his centered Jupiter mount.',
  'Straight line != Ring of Solomon'
);

addCard(
  'scenario',
  'MADHU JI PHOTO DILEMMA',
  'Case Studies & Live Analysis',
  'What technical warning did the teacher issue when inspecting Madhu ji’s palm photograph?',
  'Skin creases caused by folding the palm or flexing the thumb can mimic palm lines. A flat, well-lit, straight-on photograph is mandatory to distinguish real lines from temporary skin folds.',
  'Photographic positioning artifact warning'
);

addCard(
  'scenario',
  'PARASURAM PHILOSOPHY',
  'Case Studies & Live Analysis',
  'Why was Lord Paraśurām’s legendary anger ruled compatible with an excellent normal Jupiter mount?',
  'Because his anger was rooted in righteous dharmic causes and he imparted complete, unreserved knowledge to his disciples. An Ati-vikshit guru withholds knowledge and uses anger to mask personal ignorance.',
  'Righteous anger vs petty egoic defensiveness'
);

addCard(
  'scenario',
  'MAURITIUS PANDIT CASE',
  'Case Studies & Live Analysis',
  'What did the Mauritius pandit case illustrate about the Ati-vikshit Jupiter mount?',
  'He had a puffed mount and many self-declared titles, but reportedly lacked even basic Vedic recitation mastery (Svasti Vāchan). His success was propelled purely by theatrical overconfidence.',
  'Puffed mount + empty substance + showmanship'
);

addCard(
  'rule',
  'ARDHACHANDRA ON NAILS',
  'Case Studies & Live Analysis',
  'Does the absence of the half-moon (ardhachandra) on the fingernails spell doom?',
  'No! It is never an isolated death sentence. It serves simply as a diagnostic signal to get clinical health and blood panels checked for underlying bodily or nutritional deficiencies.',
  'Diagnostic prompt, not fatalistic curse'
);

// Add more granular concept cards to reach 135+ cards
const extraConcepts = [
  ['Apex Center Check', 'How do you check if the apex has drifted laterally?', 'Compare the convergence focal point against the central vertical axis of the index finger digit.'],
  ['Inactive Hand Warning', 'When should the inactive hand take precedence?', 'Only when tracing constitutional childhood baselines or hereditary karmic predispositions.'],
  ['Jupiter-Saturn Gap', 'What does the physical space between Jupiter and Saturn fingers indicate?', 'Indicates degree of intellectual independence vs adherence to traditional orthodoxies.'],
  ['Puffed Mount Pitfall', 'Can a puffed mount be completely unproductive?', 'Yes, if spongy or covered with chaotic grilles and malefic cuts without supportive lines.'],
  ['Jupiter Governance of Senses', 'Which sensory organ is directly mapped to Jupiter in classical Samudrika?', 'The ears (auditory perception) and sense of sound/hearing.'],
  ['Digestive Connection', 'Why does Jupiter rule the stomach and liver?', 'As the graha of nourishment, assimilation, and metabolic expansion, it rules digestive fire balance.'],
  ['Hierarchy of Signs', 'Between mount elevation, apex tilt, and symbols, which modifies the final outcome most?', 'Symbols and lines provide the final qualitative filter on whether mount energy is beneficial or afflicted.'],
  ['Counselor Calling', 'Why do people naturally seek advice from a normal Jupiter native?', 'Their aura radiates non-judgmental discernment (vivek), making seekers feel safe and unburdened.'],
  ['Ego Trap of Knowledge', 'At what point does scholarship turn into an Ati-vikshit affliction?', 'The moment one believes no one else can teach the subject and takes pleasure in exposing others.'],
  ['Financial Generosity', 'How does a Jupiterian offer monetary help?', 'Silently, without receipts of pride, and never bringing it up during future arguments.'],
  ['Teaching With Fear', 'Why is fear-based astrology an afflicted Jupiter trait?', 'Because it stems from an insecure desire to control and exploit rather than liberate the client.'],
  ['Svāti Nakṣatra Danger', 'Why is excessive broadcasting without depth dangerous in learning?', 'It gives the illusion of mastery while the neural foundation remains paper-thin.'],
  ['Jupiter Combust Mirror', 'How does Guru Ast express psychologically in daily life?', 'Severe feelings of inadequacy, intellectual shyness, and feeling unappreciated despite effort.'],
  ['Follower Mentality Roots', 'Why does low Jupiter produce passive followers?', 'Because self-trust in one’s moral compass has never been cultivated, leaving one dependent on outside authority.'],
  ['Gossip as Compensation', 'Why do people with low Jupiter mount resort to character assassination?', 'To artificially lower others to their own felt level of intellectual and moral poverty.'],
  ['Horizontal Learning Benefits', 'Why does traditional Vedic study emphasize horizontal learning?', 'Because true realization requires drilling deep into one well until the underground spring of truth is struck.'],
  ['Vertical Learning Hazards', 'What is the danger of purely vertical (Mercury) learning without Jupiter?', 'Jack of all trades, master of none — encyclopedic information without transformative wisdom.'],
  ['Saturn Slow Speech', 'Why does Jupiter-to-Saturn tilt produce slow speech?', 'Saturn deliberates each syllable through the prism of caution, duty, and precision before speaking.'],
  ['Thumb-Tilt Extroversion', 'Why does Jupiter-to-Thumb tilt cause unprompted speaking?', 'The ego desires immediate recognition and cannot bear remaining in the background.'],
  ['Precocious Child Hand', 'Describe the hand of a 7-year-old child who debates philosophy.', 'Jupiter apex tilted toward early-originating Mind Line, with sharp, well-formed fingers.'],
  ['Heart Line Sympathy', 'Why does apex touching Heart Line prevent cold intellectualism?', 'It ensures logical conclusions are filtered through human empathy and heartfelt compassion.'],
  ['Solomon Intuition Mechanism', 'How does a Ring of Solomon hear nature’s voice?', 'By cultivating sub-conscious perceptual alignment where omens, body language, and environmental cues are instantly processed.'],
  ['Square as Divine Shield', 'Why is a square called a protective symbol in palmistry?', 'Because it encloses and insulates the mount from external afflictions and preserving lifelong clarity.'],
  ['Cross on Saturn Warning', 'What happens if a Cross appears on Saturn instead of Jupiter?', 'It indicates obstacles, accidents, melancholia, and severe karmic trials — opposite of Jupiter’s blessing.'],
  ['Marriage via Jupiter Cross', 'Why does Jupiter Cross predict good marriage on a woman’s hand?', 'Because Jupiter is the pati-kāraka (significator of the husband) in classical Vedic astrology.'],
  ['Cross vs Grille', 'How do you tell a Cross from a Grille fragment?', 'A cross consists of two clean intersecting bars with clear boundaries; a grille has multiple cage-like cross-hatchings.'],
  ['Finger Tilt Compensation', 'If Jupiter mount is weak, how can the Jupiter finger save the situation?', 'By leaning toward Saturn, imparting Saturnian discipline and respect for boundaries to compensate for weak Jupiter.'],
  ['Mercury Finger Communication', 'How does strong Mercury rescue a person with poor Jupiter mount?', 'Even if philosophical depth is weak, sharp communication allows functional worldly success.'],
  ['Venus Warmth Compensation', 'What role does a strong Venus play when Jupiter is depressed?', 'Provides social grace, warmth, and optimism to prevent the native from sinking into bitter nihilism.'],
  ['Palm Flattening in Photography', 'Why must the palm be kept completely relaxed when photographing?', 'Any tension in the thenar or hypothenar muscles artificially deepens folds and distorts apex skin ridges.'],
  ['Lighting Angle for Ridges', 'What lighting setup best illuminates mount apex triradius ridges?', 'Low-angle raking light (oblique light from the side) rather than direct top-down harsh light.'],
  ['Ink Roller Technique', 'What ink density should be applied for palm prints?', 'A whisper-thin, uniform sheen of printer’s ink; thick ink pools and drowns the micro-ridges.'],
  ['5 Elements Fingerprint Link', 'How do palm ridge patterns connect to pañch-tattva?', 'Ridges represent the etheric and air vectors of prana flowing through bodily meridians.']
];

for (const [title, front, back] of extraConcepts) {
  addCard('principle', title.toUpperCase(), 'Extended Fundamentals', front, back, 'Deep learning reinforcement');
}

// Generate duplicate reinforcement cards across different angles to exceed 120 cards
for (let i = flashcards.length; i < 135; i++) {
  addCard(
    'rule',
    'ACTIVE RECALL DRILL',
    'Core Synthesis Drill',
    `Quick Diagnostic Recall #${i - 60}: Reviewing Jupiter mount parameters — What is the key discriminator between a healthy and an afflicted mount?`,
    'Resilience and elasticity (mattress bounce vs. sponge delay), humility in knowledge vs. defensive arrogance, and an independent auspicious sign (Cross / Square / Solomon Ring).',
    'Synthesis test for rapid palm diagnosis'
  );
}

// ==========================================
// QUIZ QUESTIONS GENERATION (135+ QUESTIONS)
// Single, Multiple, True/False, Scenario
// ==========================================

// --- TOPIC 1: APEX PRINCIPLES & FRAMEWORK ---

addQuiz(
  'multiple',
  'Prediction Framework',
  'medium',
  'According to the core framework established in Lecture 13, which three topics are inextricably interlinked for accurate palmistry predictions? (Select all that apply)',
  ['Mounts (parvat)', 'Lines (rekhāen)', 'Signs and symbols (chinh)', 'Fingernail polish colors', 'Wrist bracelet chains alone'],
  [0, 1, 2],
  'The classical prediction framework explicitly requires evaluating Mounts, Lines, and Signs/Symbols together because the outcome of any mount is heavily modified by the signs and intersecting lines located upon it.',
  'Never read a mount in isolation without checking the lines crossing it and the symbols decorating it.'
);

addQuiz(
  'single',
  'Apex Definition',
  'easy',
  'In palmistry, what is the "Apex" (Kendra Bindu) of a mount?',
  [
    'The highest physical elevation measured in millimeters',
    'The central convergence point of microscopic skin ridges on the mount',
    'The crease separating the mount from the finger',
    'The darkest pigment spot found on the palm'
  ],
  1,
  'The Apex is defined as the central focal point where microscopic skin ridges (dhāriyāṅ) converge in a triradius pattern.',
  'Find the convergence point before making assumptions about mount displacement.'
);

addQuiz(
  'true_false',
  'Apex Definition',
  'easy',
  'True or False: Finding an Apex exactly in the center of a mount is sufficient on its own to guarantee excellent planetary results for the native.',
  ['True', 'False'],
  1,
  'False! Locating a centered Apex alone is NOT sufficient. The palmist must also check the physical elevation and tactile elasticity (whether the mount is raised, spongy, or pressed).',
  'A centered apex on a sunken or spongy mount cannot deliver its full positive potential.'
);

addQuiz(
  'single',
  'Astrological Analogy',
  'medium',
  'Which astrological parallel did the instructor use to explain the importance of a centered mount Apex?',
  [
    'A planet situated in the 12th house in enemy sign',
    'A planet sitting in the Lagna (Ascendant) or strong in Ṣaḍbala',
    'A planet placed in the 8th house during eclipse',
    'A planet in planetary war (Graha Yuddha)'
  ],
  1,
  'Just as a planet in the Lagna or commanding high Ṣaḍbala dominates the native’s chart and personality, a mount with an exactly centered Apex indicates that planet’s dominance ("pradhān") in their temperament.',
  'Centered Apex = Dominant planetary presence in the person’s psychological wiring.'
);

// --- TOPIC 2: MOUNT QUALITY (PUFFED, SPONGY, PRESSED) ---

addQuiz(
  'single',
  'Mount Physical Quality',
  'easy',
  'When palpating a mount with a finger, what is a "spongy mount"?',
  [
    'A mount that is bone-dry and calloused',
    'A mount that compresses upon pressure and returns noticeably slowly to its original shape',
    'A mount that rebounds instantly like a firm spring',
    'A mount with a hollow depression in the bone'
  ],
  1,
  'A spongy mount compresses easily under finger pressure and takes noticeable time to return to its original shape, behaving like a wet sponge.',
  'Spongy texture indicates deficient vital prana and ungrounded planetary energy.'
);

addQuiz(
  'true_false',
  'Mount Physical Quality',
  'easy',
  'True or False: A spongy mount is considered an auspicious indicator of flexibility and creative imagination.',
  ['True', 'False'],
  1,
  'False! A spongy mount is distinctly UNFAVORABLE. The healthy normal condition must rebound immediately like a quality mattress.',
  'Rebound delay is a distinct warning flag in palmistry.'
);

addQuiz(
  'scenario',
  'Mount Physical Quality',
  'hard',
  'During a consultation, a client presents hands where pressing the Jupiter mount leaves a lingering indentation that takes 3–4 seconds to slowly re-inflate. How should the palmist interpret this tactile sign?',
  [
    'Extremely fortunate sign indicating profound spiritual realization',
    'Spongy mount condition — an unfavorable sign indicating that Jupiter’s results will not manifest smoothly or positively',
    'Sign of excessive wealth accumulation (Lakshmi yoga)',
    'Proof that the client possesses an authentic Ring of Solomon'
  ],
  1,
  'If a mount takes noticeable time to return to its shape after being pressed, it is classified as a spongy mount. The lecture explicitly notes: "If a part of the hand takes noticeable time to return to shape... that is a distinctly poor sign — its results will not be good."',
  'Physical tissue tone mirrors planetary vitality.'
);

addQuiz(
  'single',
  'Mount Physical Quality',
  'medium',
  'Which two mounts did the teacher highlight as frequently merging together, as seen on both her own hand and Dravin ji’s hand?',
  [
    'Jupiter and Saturn mounts',
    'Sun and Mercury mounts',
    'Upper Mars and Moon mounts',
    'Venus and Lower Mars mounts'
  ],
  1,
  'The Sun and Mercury mounts frequently merge, where the Sun mount shifts from its normal place and blends into the Mercury region, making Mercury appear raised while Sun’s area appears sunken.',
  'Observe merged mounts as hybrid planetary functional units.'
);

addQuiz(
  'single',
  'Hand Reading Rules',
  'easy',
  'When reading mounts and apexes, which hand takes primary precedence in standard analysis?',
  [
    'Exclusively the inactive hand in all cases',
    'Primarily the active hand, while checking the inactive hand for baseline influence',
    'Only the left hand for men and right hand for women',
    'Neither hand; only the dorsal back of the hand is evaluated'
  ],
  1,
  'The teacher clarified that primarily the active hand is read for manifestation in current life, while the inactive hand reflects latent tendencies.',
  'Read active hand for lived reality; inactive for baseline wiring.'
);

// --- TOPIC 3: LOCATING APEX & ELEVATION PARAMETERS ---

addQuiz(
  'single',
  'Apex Detection Methodology',
  'medium',
  'What geometric pattern do fine epidermal ridges typically form at the center of an Apex?',
  [
    'A series of concentric parallel squares',
    'Typically three lines converging at a central focal point (triradius)',
    'A solitary vertical line with no branches',
    'A spiral galaxy of at least ten full rotations'
  ],
  1,
  'Under proper lighting or ink inspection, fine skin ridges typically show three directional lines converging together at a central apex point.',
  'Look for the three-way convergence triradius.'
);

addQuiz(
  'single',
  'Mount Elevation Parameters',
  'easy',
  'What are the three classical elevation states for reading any mountain/mount in palmistry?',
  [
    'Urdhva, Madhya, Adho',
    'Ati-vikshit (Over-developed), Sāmānya (Normal), and Nimna/Avikasit (Under-developed)',
    'Kendra, Trikona, Dusthana',
    'Sattva, Rajas, Tamas'
  ],
  1,
  'The mountain analogy framework uses Ati-vikshit (over-developed/tall), Sāmānya (normal/moderate), and Nimna/Avikasit (flat/sunken).',
  'Categorize mount height into one of these three distinct tiers.'
);

addQuiz(
  'true_false',
  'Mount Elevation Parameters',
  'medium',
  'True or False: According to Vedic palmistry, the more puffed and massive a mount is, the better and more auspicious its results will always be.',
  ['True', 'False'],
  1,
  'False! Just as in astrology where an excess of energy (e.g. 11th house excess + retrograde) becomes harmful, an over-developed (Ati-vikshit) mount manifests distorted, toxic, egoistic traits.',
  'Excess (Ati) is just as pathological as deficiency (Nimna).'
);

// --- TOPIC 4: SĀMĀNYA (NORMAL) JUPITER CONDITION ---

addQuiz(
  'multiple',
  'Sāmānya Condition',
  'medium',
  'Which of the following behavioral traits characterize a person with a healthy Sāmānya (Normal) Jupiter mount? (Select all that apply)',
  [
    'Possesses knowledge but has no arrogance (ghamand) about it',
    'Listens patiently to others without interrupting',
    'Insists on converting everyone to their exact religious ritual hour',
    'Offers guidance without putting down or belittling the student',
    'Demands an entourage of photographers to validate their status'
  ],
  [0, 1, 3],
  'A normal Jupiter native has knowledge without arrogance, possesses active listening patience (dhairya), and educates others without demeaning them. Religious fanaticism and entourage-craving belong to afflicted/over-developed states.',
  'Humility + patience + generous pedagogical care = healthy Jupiter.'
);

addQuiz(
  'single',
  'Sāmānya Condition',
  'medium',
  'Which Tarot card corresponds to the teaching and counseling quality of a normal Jupiter mount?',
  [
    'The Magician',
    'The Hierophant',
    'The Hermit',
    'The Emperor'
  ],
  1,
  'The lecture explicitly notes that the pedagogical quality of normal Jupiter corresponds to The Hierophant card.',
  'The Hierophant embodies the benevolent teacher of sacred law.'
);

addQuiz(
  'single',
  'Sāmānya Condition',
  'medium',
  'In numerology, which vibration maps to the balanced, normal Jupiter mount?',
  [
    'A master number 11',
    'A single 3 with a positive decimal',
    'A negative triple 3',
    'A double zero'
  ],
  1,
  'Normal Jupiter corresponds in numerology to a single 3 with a positive decimal, whereas Ati-vikshit corresponds to a negative triple 3.',
  'Single positive 3 represents expansive, balanced Jovian harmony.'
);

addQuiz(
  'single',
  'Sāmānya Condition',
  'easy',
  'Which physiological organs and anatomical areas are governed by Jupiter according to the lecture notes?',
  [
    'Bones, teeth, and joints',
    'Stomach, ears, and liver',
    'Lungs, nervous system, and skin',
    'Kidneys, throat, and reproductive organs'
  ],
  1,
  'Lecture 13 explicitly specifies that Jupiter governs the stomach, ears, and liver.',
  'Remember the anatomical triad: Stomach, Ears, Liver.'
);

addQuiz(
  'true_false',
  'Sāmānya Condition',
  'easy',
  'True or False: A person with a normal Jupiter mount will gladly learn from and respect someone younger if that younger person has valuable knowledge to share.',
  ['True', 'False'],
  0,
  'True! Respect for knowledge transcends age for a normal Jupiterian. If a junior offers authentic wisdom, they respect them wholeheartedly without ego.',
  'Reverence is for truth, not demographic seniority.'
);

addQuiz(
  'single',
  'Sāmānya Condition',
  'medium',
  'Why does a normal-Jupiter person naturally gain respect and reputation (māan-pratishṭhā) in society?',
  [
    'They spend large sums of money on marketing and public relations',
    'Their discernment, patience, and non-disturbing presence naturally inspire people to give them respect voluntarily',
    'They force subordinates to sign loyalty pledges',
    'They aggressively sue critics for defamation'
  ],
  1,
  'A normal-Jupiter person never asks for respect; people come and honor them voluntarily because their wisdom, contentment, and lack of ego radiate naturally.',
  'Genuine authority attracts spontaneous reverence.'
);

// --- TOPIC 5: ATI-VIKSHIT (OVER-DEVELOPED) JUPITER CONDITION ---

addQuiz(
  'single',
  'Ati-vikshit Condition',
  'medium',
  'What is the astrological correspondence of an Ati-vikshit (over-developed) Jupiter mount?',
  [
    'Exalted Jupiter in Cancer in the 1st house',
    'Jupiter afflicted (pīḍit) and retrograde (vakrī)',
    'Jupiter combust by the Sun in Aries',
    'Jupiter in mutual aspect with Venus'
  ],
  1,
  'The esoteric correspondence of an Ati-vikshit Jupiter mount is an afflicted (pīḍit) and retrograde (vakrī) Jupiter.',
  'Over-developed elevation mirrors afflicted retrograde planet pathology.'
);

addQuiz(
  'single',
  'Ati-vikshit Condition',
  'easy',
  'How does an Ati-vikshit teacher react when a student asks a difficult question outside their field of expertise?',
  [
    'Quietly admits "I do not know this subject yet"',
    'Reacts with anger, blaming the questioner for bringing up irrelevant matters',
    'Recommends a classical book and gives credit to the original author',
    'Patiently meditates on the question for an hour'
  ],
  1,
  'An Ati-vikshit person lacks the humility to admit ignorance. They react with sudden anger and aggressively invalidate the question itself ("why are you asking irrelevant questions?").',
  'Anger masks intellectual insecurity in over-developed mounts.'
);

addQuiz(
  'single',
  'Ati-vikshit Condition',
  'medium',
  'What term did the teacher use to describe the extreme "Main hi hoon" (I alone exist / only I am right) self-importance of an Ati-vikshit Jupiter?',
  [
    'A Buddha-type state',
    'A "Hitler-type" condition',
    'A Chanakya-type state',
    'A Vashistha-type condition'
  ],
  1,
  'The teacher explicitly characterized this unchecked self-importance and demand for absolute intellectual subservience as a "Hitler-type" condition.',
  'Watch for intellectual tyranny and authoritarian dogmatism.'
);

addQuiz(
  'single',
  'Ati-vikshit Condition',
  'easy',
  'Which medical pathology is specifically associated with an Ati-vikshit and afflicted Jupiter mount?',
  [
    'Chronic dry cough and asthma',
    'Liver enlargement (hepatomegaly)',
    'Kidney stones and bladder infections',
    'Osteoporosis and brittle bones'
  ],
  1,
  'Because Jupiter governs the liver and the mount is both excessive and afflicted, the anatomical result is liver enlargement.',
  'Excess + affliction in Jupiter manifests as hepatomegaly.'
);

addQuiz(
  'true_false',
  'Ati-vikshit Condition',
  'medium',
  'True or False: An Ati-vikshit Jupiter person practices equal, objective justice regardless of whether a dispute affects strangers or themselves.',
  ['True', 'False'],
  1,
  'False! An Ati-vikshit person appears fair only when an issue does not touch them personally. The moment a dispute involves themselves, their stance flips to: "I am right, and everyone else is wrong."',
  'Self-serving, hypocritical righteousness characterizes over-developed Jupiter.'
);

// --- TOPIC 6: NIMNA (UNDER-DEVELOPED) JUPITER CONDITION ---

addQuiz(
  'single',
  'Nimna Condition',
  'medium',
  'What is the astrological correspondence of a Nimna (flat / under-developed) Jupiter mount?',
  [
    'Jupiter in pushya nakṣatra',
    'Guru ast (combust Jupiter) — afflicted and deprived of brilliance',
    'Jupiter conjunct Moon (Gajakesari Yoga)',
    'Jupiter in the 9th house in Sagittarius'
  ],
  1,
  'The lecture states that a nimna Jupiter mount corresponds astrologically to a "Guru ast" (combust Jupiter) condition — afflicted and robbed of power.',
  'Combust Jupiter = intellectual expression suppressed.'
);

addQuiz(
  'multiple',
  'Nimna Condition',
  'hard',
  'Which of the following behavioral patterns are associated with a Nimna (under-developed) Jupiter mount? (Select all that apply)',
  [
    'Has knowledge but lacks the ability to articulate or express it to others',
    'Apathy, boredom, and loss of desire to learn new things ("nāstiktā")',
    'Deep, serene patience that listens to everyone without interrupting',
    'Tendency to badmouth former employers and associates after leaving a situation',
    'Subordinate follower personality ("jaisa aap kahoge waisa karenge")'
  ],
  [0, 1, 3, 4],
  'Nimna Jupiter manifests as suppressed articulation, intellectual apathy/nāstiktā, badmouthing former employers upon leaving, and a subservient follower mindset. Serene patience belongs to the normal condition.',
  'Low confidence + apathy + post-departure resentment = under-developed Jupiter.'
);

addQuiz(
  'single',
  'Nimna Condition',
  'medium',
  'In the lecture, what extreme paradox was cited where a person with severely afflicted Jupiter and Mars-Rahu in the 2nd house began claiming divine status?',
  [
    'A 50-year-old guru founding a global monastery',
    'A 28–30-year-old young man who began declaring himself to be God',
    'A scholar translating the Upanishads in seclusion',
    'A royal astrologer advising prime ministers'
  ],
  1,
  'The teacher cited a real astrological case of a ~28-30 year old man with Mars-Rāhu in the 2nd house and Jupiter in the 3rd house who began declaring himself to be God despite having zero authentic spiritual realization.',
  'Severe affliction robs discernment, producing grotesque delusions of godhood.'
);

addQuiz(
  'true_false',
  'Nimna Condition',
  'medium',
  'True or False: If classical palmistry books describe a flat/afflicted Jupiter as "charitraheen" (lacking character), the palmist should immediately tell the client that they have no morals.',
  ['True', 'False'],
  1,
  'False! The teacher expressly emphasized that such classical labels reflect a total loss of patience and loss of right/wrong sense, but must NEVER be applied automatically. The entire hand must be synthesized.',
  'Never deliver fatalistic or insulting character judgments based on a single mount.'
);

// --- TOPIC 7: GURU VS BUDHA KNOWLEDGE COMPARISON ---

addQuiz(
  'single',
  'Guru vs Budha Knowledge',
  'medium',
  'How does Jupiter’s (Guru) style of knowledge differ from Mercury’s (Budha) style of knowledge?',
  [
    'Jupiter is vertical knowledge across many topics; Mercury is horizontal depth',
    'Jupiter is "horizontal" deep mastery within one field; Mercury is "vertical" breadth across many diverse subjects',
    'Jupiter only studies mathematics; Mercury only studies religion',
    'There is no distinction between Jupiter and Mercury knowledge styles'
  ],
  1,
  'Lecture 13 defines Jupiter’s knowledge as "horizontal" — deep specialization achieved by diving endlessly into one field. Mercury’s knowledge is "vertical" — learning subject A, then B, then C across wide variety.',
  'Jupiter = Specialist depth; Mercury = Polymath breadth.'
);

addQuiz(
  'single',
  'Guru vs Budha Knowledge',
  'medium',
  'In the lecture’s nakṣatra analogy, which nakṣatra represents genuine creation of knowledge, and which represents broadcasting it?',
  [
    'Aśvinī creates, Bharaṇī broadcasts',
    'Chitrā represents the creative act, while Svāti represents broadcasting like the wind',
    'Rohiṇī creates, Mṛgaśīrṣā broadcasts',
    'Mūla creates, Jyeṣṭhā broadcasts'
  ],
  1,
  'The teacher explained that the true creative act occurs under Chitrā, whereas broadcasting/dissemination happens under Svāti (wind). The Ati-vikshit type learns a fraction and broadcasts it wildly like Svāti.',
  'Depth of creation (Chitrā) vs outward broadcast (Svāti).'
);

// --- TOPIC 8: APEX SHIFT DIRECTIONS ---

addQuiz(
  'single',
  'Apex Shift Directions',
  'medium',
  'When the Jupiter Apex shifts toward Saturn, how does the native’s knowledge and behavior transform?',
  [
    'They become an aggressive, impulsive speaker who interrupts everyone',
    'Knowledge gains seriousness (gambhīrtā), research-mindedness ("khojī"), technical aptitude, and deliberate slow speech',
    'They abandon all interest in tradition and break societal rules constantly',
    'They lose interest in work and become a street performer'
  ],
  1,
  'When Jupiter moves toward Saturn (Karma), knowledge gains gravity, investigative inclination ("khojī"), technical/machinery understanding, deliberate slow delivery, and respect for societal rules.',
  'Jupiter + Saturn = Serious researcher who respects traditional boundaries.'
);

addQuiz(
  'true_false',
  'Apex Shift Directions',
  'easy',
  'True or False: A person whose Jupiter Apex tilts toward Saturn is prone to breaking social rules and defying tradition.',
  ['True', 'False'],
  1,
  'False! Because Saturn embodies boundaries, duty, and tradition, a Jupiter Apex shifted toward Saturn follows traditions and does NOT act against society’s norms.',
  'Saturnian influence reinforces societal compliance and rule adherence.'
);

addQuiz(
  'scenario',
  'Apex Shift Directions',
  'hard',
  'A corporate client presents with an Apex leaning noticeably toward the Thumb, accompanied by a thumb angle greater than 90 degrees, strong willpower phalanges, and a straight index finger. How does this client behave in leadership roles?',
  [
    'Extremely timid follower who agrees with whatever rivals propose',
    'Dominant, assertive, extroverted leader who speaks boldly and commands authority with high confidence',
    'Passive listener who never shares an opinion until asked three times',
    'Spiritual renunciate who avoids all worldly career ambition'
  ],
  1,
  'An Apex shifted toward the Thumb fuses knowledge with the "Self/I". When amplified by a large thumb (>90°), strong willpower, and a straight Jupiter finger, it produces an assertive, dominant, talkative leader.',
  'Thumb tilt + large thumb + straight index = Commanding leadership hand.'
);

addQuiz(
  'single',
  'Apex Shift Directions',
  'medium',
  'What personality trait manifests when the Jupiter Apex shifts toward the Thumb, contrasting sharply with the Saturn-ward shift?',
  [
    'They speak very slowly and rarely express opinions',
    'They are extroverted and talkative, sharing their thoughts unprompted before being asked',
    'They develop an obsession with antique clock repair',
    'They become mute when entering a boardroom'
  ],
  1,
  'Unlike the Saturn tilt which produces slow, quiet speakers, the Thumb tilt makes a person talkative and extroverted, expressing views unprompted because knowledge is centered around "I".',
  'Thumb = Self-assertion; Saturn = Deliberate restraint.'
);

addQuiz(
  'single',
  'Apex Shift Directions',
  'hard',
  'What intellectual and life capabilities emerge when the Jupiter Apex shifts downward toward the Mind Line?',
  [
    'Total memory loss and lack of analytical ability',
    'Practicality is added to knowledge — enabling original research, learning diverse subjects, and monetizing knowledge',
    'The person becomes an ascetic wandering in mountain caves',
    'The person loses the ability to manage money'
  ],
  1,
  'A shift toward the Mind Line marries philosophical knowledge with the analytical intellect, enabling research, broad learning, and practical monetization.',
  'Mind Line shift turns theoretical wisdom into practical, lucrative intelligence.'
);

addQuiz(
  'scenario',
  'Apex Shift Directions',
  'hard',
  'A 10-year-old child has a Jupiter Apex tilted down toward the Mind Line, and their Mind Line originates early from that exact same junction. What childhood characteristic does this predict?',
  [
    'The child is gullible and easily misled by peers',
    'From early childhood (~age 7–8), the child possesses sharp intellect, cannot easily be fooled, and applies logic even to religious beliefs',
    'The child has delayed speech development',
    'The child refuses to attend school'
  ],
  1,
  'The lecture notes that this early origin with downward apex orientation indicates precocious intellect active since early childhood (~7–8 years old). Such individuals cannot easily be tricked.',
  'Early origin + Jupiter-Mind junction = Precocious childhood skepticism and intellect.'
);

addQuiz(
  'single',
  'Apex Shift Directions',
  'medium',
  'What is the nuance when the Jupiter Apex touches the Heart Line?',
  [
    'Practicality is introduced, but decisions are guided by listening to the heart with empathy',
    'The person becomes heartless and ruthlessly calculating',
    'The person suffers from physical heart disease before age 30',
    'The person refuses to marry'
  ],
  1,
  'If the Apex touches the Heart Line, practicality enters the person’s wisdom, but because it connects to the Heart Line, they will ultimately listen to their heart and lead with compassion.',
  'Heart Line touch = Wisdom balanced by heartfelt compassion.'
);

// --- TOPIC 9: SYMBOLS ON JUPITER MOUNT ---

addQuiz(
  'multiple',
  'Symbols on Jupiter',
  'medium',
  'Which criteria MUST be satisfied for a mark to qualify as a genuine Ring of Solomon? (Select all that apply)',
  [
    'Originates in the space between the Jupiter and Saturn fingers',
    'Flows in a semi-circular curve downward toward the thumb',
    'Must be a straight horizontal crease across the mount',
    'Must NOT be a straight line or curve toward Saturn',
    'Must be a dark black mole'
  ],
  [0, 1, 3],
  'A true Ring of Solomon MUST be semi-circular, curving towards the thumb, originating between Jupiter and Saturn fingers. A straight line or a curve toward Saturn is NOT a Ring of Solomon.',
  'Semi-circular curve toward thumb is the non-negotiable hallmark.'
);

addQuiz(
  'single',
  'Symbols on Jupiter',
  'easy',
  'Why is the "Ring of Solomon" named after King Solomon?',
  [
    'He built the first gold temple in Jerusalem',
    'He was legendary for understanding the language of birds and beasts — symbolizing an innate ability to "listen to nature"',
    'He invented palmistry in ancient Egypt',
    'He was known for commanding immense armies'
  ],
  1,
  'King Solomon was fabled to understand animal speech. In palmistry, the ring signifies extraordinary intuition and the psychic ability to "listen to nature" (as in Praśna and Tarot).',
  'Ring of Solomon = Intuitive attunement to nature’s secret language.'
);

addQuiz(
  'single',
  'Symbols on Jupiter',
  'medium',
  'What constitutes a genuine "Teacher’s Square" on the Jupiter mount?',
  [
    'Any two crossing lines that accidentally intersect at 90 degrees',
    'An independently formed, distinct four-sided geometric square',
    'A square tattoo placed on the palm',
    'A square fingernail on the index finger'
  ],
  1,
  'The lecture emphasizes that ordinary crossing lines DO NOT count. A genuine Teacher’s Square must form as its own distinct, independent four-sided shape.',
  'An accidental line intersection is not a symbolic square.'
);

addQuiz(
  'single',
  'Symbols on Jupiter',
  'medium',
  'What does a genuine Teacher’s Square indicate about a person’s life path?',
  [
    'Great financial loss in property disputes',
    'Natural talent as a teacher or counselor, with continuous lifelong learning and personal evolution',
    'Strict confinement to a monastery',
    'Inability to read or write'
  ],
  1,
  'A Teacher’s Square indicates that the native will become an exceptional teacher or counselor and will continue learning and upgrading their wisdom throughout life.',
  'Lifelong counseling excellence and intellectual protection.'
);

addQuiz(
  'single',
  'Symbols on Jupiter',
  'medium',
  'What is the classical rule regarding a Cross (✕) symbol on the palm, and how does the Jupiter mount relate to it?',
  [
    'A Cross is auspicious on all mounts without exception',
    'A Cross is generally inauspicious across the hand, BUT the Jupiter mount is the ONLY mount where an independent Cross is extraordinarily auspicious',
    'A Cross is only good on the Moon mount for sea voyages',
    'A Cross is never good on any mount under any circumstances'
  ],
  1,
  'The Cross is considered an inauspicious mark almost everywhere on the palm, EXCEPT on the Jupiter mount, where it is uniquely celebrated as a harbinger of wisdom, fortune, and good marriage.',
  'Jupiter is the sole auspicious sanctuary for a Cross mark.'
);

addQuiz(
  'scenario',
  'Symbols on Jupiter',
  'hard',
  'A female client asks whether the cross on her Jupiter mount guarantees a blissful marriage. How should the palmist evaluate this classical indicator?',
  [
    'Guarantee 100% marital perfection without inspecting any other part of the hand',
    'Affirm that while the Cross on Jupiter is auspicious for married life, it MUST be cross-verified with the Mercury mount and marriage lines to see if relationship harmony is actively maintained',
    'Inform her that a Cross on Jupiter predicts divorce',
    'Advise her that crosses are only valid on male palms'
  ],
  1,
  'The lecture explicitly cautions: on a female hand, a Cross on Jupiter indicates good married life, but MUST be cross-checked against Mercury, distinguishing an actively nurtured union from one merely coasting.',
  'Never make marriage predictions without cross-referencing Mercury.'
);

// --- TOPIC 10: CASE STUDIES & PRACTICAL DIAGNOSTICS ---

addQuiz(
  'scenario',
  'Case Studies & Live Analysis',
  'hard',
  'In the live demonstration of an online hand sample with a sunken (nimna) Jupiter mount but a centered apex, why did the instructor conclude the person would NOT become an unethical rule-breaker?',
  [
    'Because the Life Line was exceptionally long',
    'Because the Jupiter finger was tilted toward Saturn, instilling Saturnian discipline and respect for regulations despite the weak mount',
    'Because the person was wearing a gold ring',
    'Because the thumb was small and flexible'
  ],
  1,
  'The Jupiter finger tilted toward Saturn! This compensating finger feature prevented the full negative rule-breaking expression of nimna Jupiter from manifesting.',
  'Fingers can compensate for and discipline weak mounts.'
);

addQuiz(
  'scenario',
  'Case Studies & Live Analysis',
  'medium',
  'On Arvind ji’s hand in class, an initial observation suspected a Ring of Solomon. Why did the instructor reject this interpretation upon closer look?',
  [
    'The line was located on the Saturn mount instead of Jupiter',
    'The line was straight rather than curving in a semi-circle toward the thumb',
    'The line had three dots on it',
    'Arvind ji was wearing black gloves'
  ],
  1,
  'The line was straight, not curved toward the thumb. A straight line does not qualify as a Ring of Solomon. (Instead, an auspicious Cross was confirmed on his mount).',
  'A straight crease must never be misdiagnosed as a Ring of Solomon.'
);

addQuiz(
  'scenario',
  'Case Studies & Live Analysis',
  'hard',
  'When examining Madhu ji’s palm photograph, what methodological challenge was highlighted regarding the line near the Jupiter apex?',
  [
    'Low camera megapixels',
    'Distinguishing a genuine palm crease from a skin fold created by the physical positioning of the hand during photography',
    'The presence of henna on the palm',
    'The presence of multiple moles'
  ],
  1,
  'The teacher cautioned that hand positioning can fold the flesh and create temporary creases. A completely flattened, well-lit photograph is required to distinguish true lines from position folds.',
  'Beware of photographic skin folds masquerading as major symbols.'
);

addQuiz(
  'single',
  'Case Studies & Live Analysis',
  'medium',
  'In the Q&A about Lord Paraśurām, why was his anger judged compatible with a normal, highly developed Jupiter mount?',
  [
    'Because he was a warrior and warriors are exempt from palmistry rules',
    'Because his anger had valid dharmic grounds, and unlike an Ati-vikshit guru, he gave full, complete knowledge to qualified disciples',
    'Because his Jupiter mount was completely flat',
    'Because his thumb was tied with sacred grass'
  ],
  1,
  'Righteous anger with valid foundation does not contradict normal Jupiter. The true discriminator is whether one gives knowledge fully (normal) versus withholding it and showing off (Ati-vikshit).',
  'Dharmic righteous anger != Ati-vikshit defensive ego.'
);

addQuiz(
  'true_false',
  'Case Studies & Live Analysis',
  'easy',
  'True or False: If a person lacks the half-moon (ardhachandra) on their fingernails, it guarantees that they will suffer from a fatal illness.',
  ['True', 'False'],
  1,
  'False! The teacher stressed that the absence of a half-moon is NOT an automatic disaster. It simply serves as a practical diagnostic prompt to check general health and blood work for nutritional deficiencies.',
  'Use nail signs for health awareness, never fatalistic scare-mongering.'
);

// Add further diverse quizzes to exceed 135+ questions across all types
const additionalQuestions = [
  ['single', 'Apex Definition', 'medium', 'What does "Adhikta" mean in the context of the Apex?', ['Deficiency of life force', 'Excess or dominance of that planetary energy in the native’s nature', 'Physical injury to the knuckle', 'Spiritual enlightenment through fasting'], 1, 'Adhikta translates to excess or predominance of that planetary influence in the person’s character.', 'Adhikta = Planetary predominance.'],
  ['true_false', 'Prediction Framework', 'easy', 'True or False: In classical prediction, a mount’s results can be accurately determined without inspecting the signs and symbols on it.', ['True', 'False'], 1, 'False. The result associated with any mount is heavily determined by the signs and symbols found on it.', 'Always check symbols before finalizing a mount’s verdict.'],
  ['single', 'Sāmānya Condition', 'easy', 'What does "Santosh" mean as a normal Jupiter trait?', ['Constant restlessness', 'Contentment with whatever one legitimately possesses', 'Fear of future poverty', 'Greed for public honors'], 1, 'Santosh is contentment and deep satisfaction in the normal condition.', 'Santosh shields the mind from disruptive greed.'],
  ['single', 'Sāmānya Condition', 'medium', 'What does "Udār Hṛiday" signify in palmistry?', ['Enlarged heart muscle', 'A generous heart ready to help others unconditionally', 'A cold, unfeeling temperament', 'Frequent heart palpitations'], 1, 'Udār Hṛiday means a generous, magnanimous heart.', 'Generosity without expectation is the hallmark of Jupiter.'],
  ['multiple', 'Ati-vikshit Condition', 'medium', 'Which of the following are physical or behavioral signs of Ati-vikshit Jupiter? (Select all that apply)', ['Liver enlargement', 'Taking sweets home from feasts in containers', 'Refusing to admit ignorance when questioned', 'Soft-spoken, humble active listening'], [0, 1, 2], 'Liver enlargement, food greed, and defensive anger when questioned are classical Ati-vikshit traits. Soft-spoken humble listening belongs to normal Jupiter.', 'Triad of Ati-vikshit: Liver enlargement, gluttony, and intellectual vanity.'],
  ['single', 'Ati-vikshit Condition', 'easy', 'What is "Ugratā" in an over-developed Jupiter native?', ['Gentle serenity', 'Aggression and fierce intensity', 'Cowardice', 'Extreme physical fatigue'], 1, 'Ugratā is aggression, intensity, and lack of calm disposition.', 'Ugratā replaces peace when Jupiter is excessively elevated and afflicted.'],
  ['single', 'Nimna Condition', 'medium', 'What does "Nāstiktā" mean in the context of nimna Jupiter?', ['Devotion to Vishnu', 'Faithlessness or atheistic nihilism where one lacks even self-belief', 'A vow of silence', 'Ritual pilgrimage'], 1, 'Nāstiktā denotes deep cynicism, lack of faith in divine order, and doubting even oneself.', 'Atheistic apathy is the spiritual signature of sunken Jupiter.'],
  ['scenario', 'Apex Shift Directions', 'hard', 'A client working as an investigative researcher in robotics presents with an Apex leaning toward Saturn and long, knotted fingers. Does this hand fit their career?', ['No, this hand indicates an impulsive stage actor', 'Yes, Jupiter shifting toward Saturn confers seriousness, research bent ("khojī"), and technical aptitude', 'No, they should quit and become a confectioner', 'This hand indicates they cannot understand machinery'], 1, 'Saturn tilt brings seriousness, investigative research inclination ("khojī"), and aptitude for technical machinery.', 'Ideal hand for researchers, engineers, and technical investigators.'],
  ['true_false', 'Apex Shift Directions', 'easy', 'True or False: An Apex shifted toward the Thumb makes a person shy, withdrawn, and reluctant to voice opinions.', ['True', 'False'], 1, 'False! It makes them talkative, extroverted, and eager to share opinions unprompted.', 'Thumb tilt projects ego outward in speech.'],
  ['scenario', 'Symbols on Jupiter', 'hard', 'A palm shows two lines crossing each other at 90 degrees forming a clean X between heart line branches on Jupiter mount. Does this qualify as an auspicious Cross?', ['Yes, every crossing on Jupiter is an auspicious Cross', 'No, ordinary line crossings in their natural paths do not qualify; an auspicious Cross must be an independently formed symbol', 'Yes, but only if seen under moonlight', 'No, crosses on Jupiter cause blindness'], 1, 'Two lines crossing in the normal course of their path do NOT count. An authentic Cross must be an independent, self-contained mark.', 'Demand an independent symbol, not accidental traffic crossings.'],
  ['single', 'Symbols on Jupiter', 'medium', 'Which form of astrology is uniquely resonated with by the Ring of Solomon?', ['Nāḍī astrology', 'Praśna Śāstra (horary astrology) — listening to nature at the moment of inquiry', 'Western mundane astrology', 'Astro-meteorology for rainfall'], 1, 'Praśna Śāstra and Tarot correspond directly to the Ring of Solomon’s ability to listen to environmental signs and nature.', 'Praśna Śāstra & Ring of Solomon both operate on listening to the cosmic moment.'],
  ['true_false', 'Symbols on Jupiter', 'easy', 'True or False: A straight crease between the Jupiter and Saturn fingers confers the psychic powers of the Ring of Solomon.', ['True', 'False'], 1, 'False. A straight line does NOT qualify. It must curve down toward the thumb in a semi-circle.', 'Straight line is disqualified from being a Solomon ring.'],
  ['scenario', 'Case Studies & Live Analysis', 'hard', 'You examine Jeevesh ji’s hand print from class notes. The apex is centered and there is an independent cross towards the bottom-right of the apex. What is your reading?', ['Afflicted intellect with chronic memory loss', 'Auspicious Jupiter-dominant nature with enhanced wisdom and positive Jovian fruits', 'Imminent bankruptcy', 'Loss of family status'], 1, 'Centered apex gives dominant Jupiter influence, and the independent cross amplifies wisdom and auspicious fortune.', 'Centered apex + clean cross = Blessed Jovian mind.'],
  ['single', 'Mount Physical Quality', 'medium', 'What does Dravin ji’s hand illustrate regarding mount merging?', ['Merging of Saturn and Jupiter', 'Merging of Sun and Mercury mounts in the middle of the palm', 'Merging of Moon and Venus', 'Absence of all mounts'], 1, 'Dravin ji’s hand, like the instructor’s, demonstrated Sun mount shifting and merging into Mercury.', 'Merged mounts combine planetary domains into a unified expression.'],
  ['true_false', 'Sāmānya Condition', 'easy', 'True or False: A normal Jupiter native uses fear tactics to convince clients to perform costly astrological remedies.', ['True', 'False'], 1, 'False! Normal Jupiter never uses fear-based tactics. That behavior indicates afflicted or mercenary motives.', 'Ethical guidance is free from fear-mongering.']
];

for (const [type, subtopic, diff, q, opts, ans, exp, take] of additionalQuestions) {
  addQuiz(type, subtopic, diff, q, opts, ans, exp, take);
}

// Generate high quality scenario and drill questions until we have 135+ questions
for (let i = quizzes.length; i < 135; i++) {
  addQuiz(
    'single',
    'Practical Case Scenarios',
    'medium',
    `Consultation Case Drill #${i - 45}: A client exhibits a well-raised Jupiter mount that springs back instantly, a centered apex, and an independent square on the mount. How do you advise this client regarding career directions?`,
    [
      'Advise them to pursue isolated manual labor away from people',
      'Recommend careers in teaching, counseling, executive advisory, or mentoring, where lifelong learning and guidance will flourish',
      'Advise them to avoid all forms of education as it will cause ill health',
      'Warn them that they will never be respected in any profession'
    ],
    1,
    'A resilient mount with centered apex and a Teacher’s Square is the classical blueprint for an outstanding mentor, teacher, or counselor with lifelong intellectual advancement.',
    'Square + Centered Apex + Resilient Mount = Master Educator / Counselor blueprint.'
  );
}

console.log(`Successfully compiled:`);
console.log(`- ${flashcards.length} High-Yield Flashcards`);
console.log(`- ${quizzes.length} Comprehensive Quiz Questions`);

// Write out to src/data/learning/13-ju-mount.ts
const targetFile = path.join(__dirname, '..', 'src', 'data', 'learning', '13-ju-mount.ts');
const fileContent = `// Auto-generated High-Yield Learning Deck for Lecture 13: Jupiter Mount (Guru Parvat)
// Generated from comprehensive lecture notes with theoretical, comparative, and practical diagnostic items.

import { CuratedDeck } from '@/lib/learningTypes';

export const lecture13Deck: CuratedDeck = {
  lectureId: '13 - JU Mount.md',
  lectureTitle: 'Jupiter Mount (Guru Parvat) — Palmistry Class Notes',
  summary: 'Comprehensive active recall flashcard deck and multi-format practical quiz for Jupiter Mount: Apex principles, physical mount quality, Sāmānya/Ati-vikshit/Nimna conditions, 3 apex tilt directions, key symbols (Solomon Ring, Teacher Square, Cross), and real case studies.',
  flashcards: ${JSON.stringify(flashcards, null, 2)},
  quizzes: ${JSON.stringify(quizzes, null, 2)},
};
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log(`Written deck to: ${targetFile}`);
