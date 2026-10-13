const fs = require('fs');
const path = require('path');

// Comprehensive High-Yield Learning Deck Builder for Lecture 21
// Source: notes/21 - Symbols & Life Line - Part 03.md
// Signs & Symbols, and the Life Line – Part 03
// Strict Quality Guidelines:
// - 100% Unique Questions & Flashcards (ZERO padding loops, ZERO cloned drills)
// - Accurate Sāmudrika Śāstra principles, case studies, and clinical takeaways

console.log('Building Lecture 21 high-yield Learning Deck...');

const flashcards = [];
const quizzes = [];

const NOTE_ID = '21 - Symbols & Life Line - Part 03.md';
const NOTE_TITLE = 'Hasta Sāmudrika Śāstra — Signs & Symbols, and the Life Line – Part 03';

function addCard(category, tag, subtopic, front, back, tip) {
  flashcards.push({
    id: `sym3-life-fc-${flashcards.length + 1}`,
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
    id: `sym3-life-qz-${quizzes.length + 1}`,
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
// THEME 1: RARE SIGNS & SYMBOLS
// Śaṅkha, Flag, Tree, Temple, Chain & Family Ring
// ==========================================

addCard(
  'symbol',
  'ŚAṄKHA (CONCH) SIGN',
  'Rare Signs & Symbols',
  'What is the Śaṅkha (Conch) sign, where is it found, and what does it indicate?',
  'A very rare auspicious sign resembling a conch with a circular spiral on top.\n\nLocation: Primarily in the Ketu Mount area near the wrist.\nSignificance: Indicates an exalted spiritual journey, high spiritual evolution, and sudden unexpected wealth gain.',
  'Ketu mount spiral = Spiritual journey & sudden wealth'
);

addCard(
  'principle',
  'FLAG VS SQUARE DISTINCTION',
  'Rare Signs & Symbols',
  'How do you distinguish a Flag (Dhvaja) sign from a Square, and what does the Flag signify?',
  '• Flag: Closed on THREE sides and OPEN on one side (resembling a "P" or "F" pole with cloth).\n• Square: Strictly closed on ALL FOUR sides.\n\nSignificance: Bestows widespread fame, high prestige, and immense willpower. Seen mostly on Sun or Saturn mounts.',
  'Flag = 3 sides closed, 1 open (fame & willpower); Square = 4 sides closed'
);

addCard(
  'symbol',
  'TREE SIGN AT LINE TERMINUS',
  'Rare Signs & Symbols',
  'Where does a Tree sign appear, and what does it signify?',
  'Found at the very terminus (last stretch) of a line, branching out with multiple ascending boughs.\n\nSignificance: Indicates tremendous growth, prosperity, enduring honor, and multiplies the strength of that parent line.',
  'Tree branching at line terminus = Growth, prosperity & strength'
);

addCard(
  'rule',
  'FAMILY RING CHAIN EXCEPTION',
  'Rare Signs & Symbols',
  'Where is the ONLY place on the human hand where a Chain (Jañjīra) formation is considered auspicious?',
  'On the FAMILY RING (the lowest bracelet crease at the base of the thumb).\n\nA chain here is mandatory for a harmonious married and domestic family life. Anywhere else on lines or mounts, chains indicate struggle, illness, or weakness.',
  'Thumb family ring = ONLY place where chains are positive'
);

addCard(
  'warning',
  'ABSENCE OF FAMILY RING CHAIN',
  'Rare Signs & Symbols',
  'What is indicated if the family ring at the base of the thumb is completely straight without any chain loops?',
  'Domestic friction, lack of family cohesion, and marital dissatisfaction. The lecture states a chain here is "very necessary" for family joy.',
  'Straight thumb ring = Lack of family warmth & marital strain'
);

addCard(
  'symbol',
  'SIGNS ON SATURN MOUNT',
  'Saturn Mount Signs',
  'What are the effects of a Triangle, Square, and Fish on the Saturn Mount (Śani Parvat)?',
  '• Triangle: Extremely auspicious sign for intellectual and occult depth.\n• Square: Powerful protective shield against accidents and sudden ruin.\n• Fish: Indicates growth and renown in a spiritual career.',
  'Saturn: Triangle = occult depth, Square = protection, Fish = spiritual career'
);

addCard(
  'symbol',
  'TRIDENT AT END OF FATE LINE',
  'Saturn Mount Signs',
  'What does a Trident crowning the terminus of the Fate Line (Bhāgya Rekhā) signify?',
  '1. Lifelong Career Drive: Strong desire for karma (action) and grand success in work.\n2. Career Until Death: Professional activity and fame continuing past age 60, 70, and 80 without retirement (e.g. Dave ji).',
  'Fate line trident = Career success lasting until end of life'
);

// ==========================================
// THEME 2: DOUBLE LIFE LINE VS SUPPORTIVE LINE
// ==========================================

addCard(
  'principle',
  'DOUBLE LIFE LINE VS MARS LINE',
  'Double Life Line',
  'What is the precise anatomical difference between a Double Life Line and a Supportive (Mars) Line?',
  '• Double Life Line: Both lines emerge from the SAME root, or the second line TOUCHES / IS JOINED to the Life Line.\n• Supportive Line (Mars Line): Runs parallel inside Venus at a distinct distance WITHOUT touching the Life Line.',
  'Touching/joined = Double Life Line; Parallel separated = Supportive Mars Line'
);

addCard(
  'rule',
  'DOUBLE LIFE LINE MEANING',
  'Double Life Line',
  'Does a Double Life Line mean a longer physical lifespan? What does it actually indicate?',
  'NO! It does NOT guarantee a longer life.\n\nIt indicates the native lives a "double life" — managing two distinct careers, having two completely different modes of living, or transitioning successfully between two unrelated professional identities (e.g. Sushant Singh Rajput: engineer then actor).',
  'Double life line = Dual careers/lifestyles, NOT doubled longevity'
);

addCard(
  'scenario',
  'SUSHANT SINGH RAJPUT CASE STUDY',
  'Double Life Line',
  'What hand features were observed in Sushant Singh Rajput’s hand in the class discussion?',
  '1. Two joined Life Lines: One main line with a second line joined and growing darker (living two distinct lives: engineering to cinema).\n2. Very straight Brain Line: Highly practical intellect (making classical impulsive suicide uncharacteristic by the Head Line alone).\n3. Straight Heart Line: Controlled emotional baseline.',
  'SSR hand: Joined double life line + straight practical head line'
);

// ==========================================
// THEME 3: LIFE LINE TRAJECTORY & MOUNT ENDINGS
// ==========================================

addCard(
  'rule',
  'INWARD CURVE TO THUMB',
  'Life Line Trajectory',
  'What does a Life Line that curves deep inward toward the thumb perimeter signify?',
  'Traditionally associated with high longevity (100+ years) and deep rootedness. It guarantees that the native will settle in or return to their native MOTHERLAND at the end of life, however far they travel.',
  'Deep inward thumb curve = Longevity & final return to motherland'
);

addCard(
  'trait',
  'OUTWARD BRANCHES FROM LIFE LINE',
  'Life Line Trajectory',
  'What do multiple branches radiating outward from the Life Line indicate?',
  'Continuous outward expansion: buying properties outside one\'s residential city (like Arvind ji), undertaking foreign travels, or establishing external commercial connections.',
  'Outward branches = Territorial expansion & foreign travel'
);

addCard(
  'symbol',
  'LIFE LINE ENDING ON KETU',
  'Life Line Trajectory',
  'What is indicated when the Life Line runs straight into the Ketu Mount at its base?',
  'High spiritual inclination, interest in mokṣa, detachment from shallow materialism, and intense spiritual contemplation in later life.',
  'Life line to Ketu = High spiritual inclination & detachment'
);

addCard(
  'warning',
  'LIFE LINE ON MOON MOUNT IN MEN',
  'Life Line Trajectory',
  'What afflictions can manifest in a male’s hand if the Life Line sweeps into an afflicted Moon Mount?',
  'Moon is a female planet. In an afflicted male hand, it indicates:\n• Addictions & substance abuse (fine lines on Moon)\n• Wasteful expenditure\n• Troubles, scandals, or accusations involving women\n• Water accidents, hormonal imbalances, and insomnia.',
  'Afflicted Moon ending = Addictions, female-related trouble, water danger'
);

addCard(
  'warning',
  'SUDDEN STOP ON MOON MOUNT',
  'Life Line Trajectory',
  'What danger does a Life Line that heads toward the Moon and SUDDENLY TERMINATES abruptly indicate?',
  'Acute danger from water (e.g. drowning accidents during rafting/boating), severe fluid-related diseases, water-borne infections, or hormonal collapse.',
  'Abrupt stop on Moon = Danger from water & hormonal ailments'
);

addCard(
  'symbol',
  'MACCHĀ REKHĀ / SAMRĀṬ YOGA',
  'Life Line Trajectory',
  'What is the Macchā Rekhā on the Life Line, and what paradox does it bring?',
  'A rare specialized fish-like mark directly upon the Life Line stem.\n\nBrings SAMRĀṬ YOGA (imperial power, high authority, royal dignity) at that age, BUT simultaneously triggers physical health complications.',
  'Macchā rekhā = Samrāṭ Yoga (royal status) coupled with health issues'
);

// ==========================================
// THEME 4: FATE LINE CONNECTIONS & TIMING
// ==========================================

addCard(
  'principle',
  'FATE-LIFE DURATION MEASUREMENT',
  'Fate Line Connections',
  'How is the duration of family support measured when a branch connects the Life Line to the Fate Line?',
  'Trace the connecting stretch between the two lines: the support begins at the junction age and endures for the entire length the connecting branch runs.\n\nCross-reference the Life Line age scale against the Fate Line age scale at the junction point.',
  'Support duration = Entire length of connecting branch'
);

addCard(
  'trait',
  'TWO TYPES OF FAMILY SUPPORT',
  'Fate Line Connections',
  'How did the teacher distinguish conditional family support from open family support?',
  '1. Conditional/Limited Support: Family helps within strict boundaries ("we spend only this much; pursue only this career").\n2. Open/Empowering Support: Family backs the native with complete freedom ("we stand behind you; do whatever you wish"), granting deep mental peace.',
  'Conditional support = Restricted boundary; Open support = Freedom & peace'
);

addCard(
  'rule',
  'OUTWARD LINE AT AGE 35',
  'Fate Line Connections',
  'When an outward line departs from the Life/Fate junction near age 35 and touches the career line, how is it read?',
  'As professional expansion and travel for the sake of WORK. The palmist must not read it as isolated personal wanderlust, because its connection to the career line ties it directly to enterprise.',
  'Outward branch touching Fate line = Work-related travel & expansion'
);

// ==========================================
// THEME 5: VENUS MOUNT, IN-LAWS & DIVORCE
// ==========================================

addCard(
  'rule',
  'VENUS MOUNT ZONING',
  'Venus Mount & In-Laws',
  'How is the Venus Mount divided between Mars influence and pure Venus influence?',
  '• Upper Venus (near thumb web): Lower Mars area, filled with small diagonal "enemy lines" causing domestic friction.\n• Lower Venus: Pure Venus territory. Horizontal lines represent family/in-law influences; vertical lines represent progeny/children.',
  'Upper = Mars enemy lines; Lower horizontal = Family/in-law relations'
);

addCard(
  'principle',
  'HORIZONTAL VENUS LINE STOPPING VS TOUCHING',
  'Venus Mount & In-Laws',
  'Contrast a horizontal Venus line that STOPS BEFORE the Life Line versus one that TOUCHES it.',
  '• Stopping before Life Line: Normal internal family disagreements that stay confined to private thoughts without disrupting daily routine.\n• Touching Life Line: Family/in-law friction that penetrates daily life, becoming an inescapable chronic distress and potential divorce marker.',
  'Stopping short = Private disagreement; Touching = Disruptive daily crisis'
);

addCard(
  'warning',
  'VENUS LINE CUTTING THROUGH FATE LINE',
  'Venus Mount & In-Laws',
  'What is the consequence if a horizontal Venus line pierces the Life Line and extends to CUT the Fate Line?',
  'Severe domestic or in-law interference that directly damages the native’s career, profession, and financial earnings.',
  'Venus line cutting Fate line = In-laws/family destroying career & wealth'
);

addCard(
  'warning',
  'ISLAND ON VENUS INFLUENCE LINE',
  'Venus Mount & In-Laws',
  'What does an island situated at the end of a horizontal Venus influence line signify?',
  'Acute marital breakdown or divorce. It represents a native who internalizes domestic grief so deeply without speaking that it turns into chronic internal disease.',
  'Island on Venus branch = Internalized domestic grief & divorce'
);

addCard(
  'symbol',
  'VENUS LINE REACHING MOON',
  'Venus Mount & In-Laws',
  'What physical vulnerability is indicated when a line originates on Venus and travels across to the Moon Mount?',
  'Throat-related ailments, vocal cord afflictions, thyroid vulnerability, or respiratory tract sensitivity.',
  'Venus to Moon line = Throat and vocal disorders'
);

// ==========================================
// THEME 6: BRANCHES TO MOUNTS & MARS CUT SEQUENCES
// ==========================================

addCard(
  'rule',
  'LIFE LINE BRANCH TO SATURN',
  'Branches to Mounts',
  'What does an upward branch rising from the Life Line toward the Saturn Mount indicate (as in the teacher\'s hand)?',
  'Early career breakthrough, rapid professional rise, and sudden financial elevation (e.g. the teacher securing her government appointment at age 22–25).',
  'Upward branch to Saturn = Early career milestone & government post'
);

addCard(
  'principle',
  'BRANCH TO SUN VS MARS CUT TO SUN',
  'Branches to Mounts',
  'How do you distinguish an auspicious Sun branch from an inauspicious Mars line affecting the Sun?',
  '• Auspicious Sun Branch: Rises from the OUTSIDE / Life Line itself upward to Sun Mount = Renown and fame (prasiddhi).\n• Inauspicious Mars Line: Emerges from the INSIDE (Lower Mars) and crosses over to cut the Sun line = Defame (apavāda) and public disgrace.',
  'Rising from Life line = Fame; Slashing from inside Mars = Defame'
);

addCard(
  'rule',
  'MARS LINE THREE-STAGE CROSSING',
  'Branches to Mounts',
  'Describe the 3 progressive stages of affliction as an aggressive Mars line cuts across the palm.',
  '1. Touching Life Line: Disruption and crises in physical life and vitality.\n2. Cutting Head Line: Severe mental depression and cognitive breakdown (timed by Head line age).\n3. Cutting Heart Line: Deep emotional trauma and heartbreak (timed by Heart line age, ~40–45+).',
  'Life cut = Physical crisis → Head cut = Depression → Heart cut = Heartbreak'
);

addCard(
  'principle',
  'HEART LINE AGE PREVIEW (18-6-18-6-18)',
  'Branches to Mounts',
  'What is the fundamental age calculation formula across the Heart Line revealed in Lecture 21?',
  'Under each finger base = 18 years.\nIn each inter-finger cleft = 6 years.\nSequence: 18 (Mercury) → 6 → 18 (Sun) → 6 → 18 (Saturn).',
  'Under finger = 18 yrs; Inter-finger gap = 6 yrs'
);

addCard(
  'rule',
  'TRIPLE-POINT VERIFICATION',
  'Branches to Mounts',
  'Why does the palmist cross-check "three places" for the same age when predicting a major life event?',
  'To ensure foolproof accuracy: checking (1) the Heart Line, (2) the Fate Line, and (3) the Life Line for that same chronological milestone. If all three display afflictions, a major crisis is certain.',
  'Triple check: Life line + Heart line + Fate line for definitive timing'
);

// ==========================================
// THEME 7: CLINICAL CASE STUDIES (LECTURE 21)
// ==========================================

addCard(
  'scenario',
  'KIDNEY DISEASE CASE – HAND QUALITY',
  'Clinical Case Studies',
  'In the 33-year-old female friend’s case (kidney function at 6%), what physical hand signs confirmed severe chronic illness?',
  '1. Tucked thumb and artificial nails (hiding vitality, harboring bacteria).\n2. Initial dot on Life line with chained, broken line up to age 40.\n3. Deflated, flattened Venus mount (pichkā huā) with small surface area.\n4. Bluish tinge across palm and lines (poor blood oxygenation, toxic retention).',
  'Blue lines + deflated Venus + chained life line = Severe systemic disease'
);

addCard(
  'scenario',
  'KIDNEY DISEASE CASE – PARASITE LINE CORRELATION',
  'Clinical Case Studies',
  'How did the parasite line in the 33-year-old friend\'s palm correlate to her real-life domestic stress?',
  'Two years prior, her husband’s divorced sister, two children, and mother-in-law moved into her home, creating suffocating domestic stress that correlated exactly with the dark parasite line running beside her Life Line.',
  'Dark parasite line = Domestic turmoil from dependent in-laws'
);

addCard(
  'warning',
  'VIA LASCIVA / LAVA VASAVĪYA (POISON LINE)',
  'Clinical Case Studies',
  'What is the Lava Vasavīya (Poison Line / Sister of Mercury), and what ailments does it cause?',
  'A transverse crease starting near Mercury/percussion and sweeping toward the Moon Mount.\n\nSignificance: Chronic toxic accumulation, acute liver diseases, digestive breakdown; frequently seen in individuals addicted to alcohol or heavy rich diets.',
  'Mercury to Moon crease = Poison line (liver disease & addictions)'
);

addCard(
  'scenario',
  'ANURĀDHĀ JI CASE – MOLE ON MOON',
  'Clinical Case Studies',
  'In Anurādhā ji’s hand, what did a black mole on the Moon Mount combined with a downward line indicate?',
  'Severe vulnerability to water-borne diseases, emotional depression, and fluid imbalance. However, a protective triangle on her Life Line provided survival safety.',
  'Mole on Moon = Health & fluid vulnerability; Triangle = Survival shield'
);

addCard(
  'scenario',
  'JĪVEŚA JI MAURITIUS CASE (AGE 26)',
  'Clinical Case Studies',
  'In Jīveśa ji\'s hand (approved for temple work in Mauritius at age 26), what did his Moon Fate Line and dual Head Lines indicate?',
  '1. Fate Line from Moon Mount: Work connected to pūjā-pāṭha, temple rituals, or public devotion abroad.\n2. Small island around age 30 with uneven line: Initial struggles adjusting overseas.\n3. Two Mind Lines: High intellectual lunar activity, but risk of old-age memory loss/dementia.',
  'Moon Fate line = Temple service abroad; Dual mind lines = High intellect & dementia risk'
);

addCard(
  'principle',
  'SIGNS COME AND GO',
  'Rare Signs & Symbols',
  'What did the teacher note about the permanence of signs and symbols on the palm?',
  'Signs and symbols appear and disappear on the human hand over time in response to changes in karma, lifestyle, psychological discipline, and health.',
  'Palm signs are dynamic — they form and dissolve with karma'
);

addCard(
  'warning',
  'ARTIFICIAL NAILS DIAGNOSTIC HAZARD',
  'Clinical Case Studies',
  'Why did the teacher warn against long artificial nails in the 33-year-old patient\'s case?',
  'She remarked that artificial nails are "the root of half of human diseases" by trapping bacteria and obscuring the natural nail bed, color, and lunula needed for physical diagnosis.',
  'Artificial nails obscure diagnostic signs and harbor infection'
);

addCard(
  'trait',
  'TUCKED THUMB BODY LANGUAGE',
  'Clinical Case Studies',
  'What psychological state is revealed when a client tucks their thumb inside their fingers in photographs?',
  'Unconscious defensive withdrawal, feeling overwhelmed, hiding one’s personal willpower, and an internal sense of helplessness under chronic stress.',
  'Tucked thumb in photos = Defensive emotional withdrawal & vulnerability'
);

addCard(
  'warning',
  'BLUE PALM AND BLUE LINES',
  'Clinical Case Studies',
  'What does a distinct bluish coloration across the palm skin and palm lines indicate medically?',
  'Severe failure of blood purification, excess carbon dioxide/toxin retention in the bloodstream, and acute kidney or liver filtration collapse (as in the 6% kidney function patient).',
  'Bluish tint = Blood purification failure & toxic retention'
);

addCard(
  'trait',
  'FLATTENED DEFLATED VENUS MOUNT',
  'Clinical Case Studies',
  'What does a deflated, flattened (pichkā huā) Venus mount with small surface area indicate in a 32-year-old client?',
  'Premature exhaustion of vitality, severe depletion of reproductive ojas, and deep domestic or physical fatigue rather than normal youthful vigor.',
  'Deflated Venus at 32 = Exhaustion of vitality and domestic burnout'
);

addCard(
  'warning',
  'PHALANGE JOINT CREASE DEFECT',
  'Clinical Case Studies',
  'What does a transverse crease just above the joint between the Saturn and Jupiter fingers indicate?',
  'Whatever work, study, or enterprise the native undertakes, material fruits and financial compensation will be distinctly lower than expected.',
  'Saturn-Jupiter joint line = Diminished material gains from career'
);

addCard(
  'symbol',
  'IMPRESSION LINE FROM MOON',
  'Clinical Case Studies',
  'What is an Impression Line rising from the Moon Mount toward the Fate Line, and what does it reveal?',
  'A faint upward line from the Moon Mount toward the career line. It indicates (1) a deep teenage role-model impression (creative inspirations, close friends), or (2) a love marriage.',
  'Moon impression line = Teenage role-model influence or love marriage'
);

addCard(
  'rule',
  'UPWARD BRANCH TO MERCURY',
  'Branches to Mounts',
  'What talents are conferred by an upward branch rising from the Life Line toward the Mercury Mount?',
  'Strong commercial acumen, aptitude for business and independent research, deep studiousness, and a natural social warmth for making friends quickly.',
  'Life line branch to Mercury = Business acumen, research drive, social charm'
);

addCard(
  'principle',
  'WRIST MIDPOINT AGING ANCHOR',
  'Age Calculation',
  'In the Lecture 21 aging demonstration, how is the bottom reference point anchored?',
  'At the exact MIDPOINT of the wrist (kalāī).\n\nThe palmist ignores whether the Life Line itself turns inward or outward — the reference line connects the Life Line origin straight to the wrist midpoint (representing a 75-year span).',
  'Bottom anchor = Exact geometric midpoint of wrist'
);

addCard(
  'principle',
  'AGE 30 LOCATION RELATIVE TO MIDPOINT',
  'Age Calculation',
  'Where is Age 30 located in the Lecture 21 aging demonstration?',
  'Age 30 sits slightly ABOVE the geometric midpoint of the Life Line span, not at the exact physical 50% center.',
  'Age 30 sits slightly above the physical midpoint'
);

addCard(
  'rule',
  'SECOND CHILD TIMING COUNSEL',
  'Clinical Case Studies',
  'Why did the teacher strictly advise against planning a second child in the 33-year-old patient’s case?',
  'Because the Life Line was heavily chained and broken with active parasite lines up to age 40. Planning a pregnancy during active organ failure and depleted vitality would be life-threatening.',
  'Chained/distressed Life line = Postpone pregnancy until line heals'
);

addCard(
  'warning',
  'TWO MIND LINES DEMENTIA RISK',
  'Clinical Case Studies',
  'What double-edged sword was identified in Jīveśa ji regarding having Two Mind Lines?',
  'Having two Mind Lines sharpens intellect, lunar depth, and multitasking, BUT carries a notable vulnerability to old-age forgetfulness, cognitive exhaustion, or dementia.',
  'Dual Mind lines = Sharp lunar intellect, but risk of old-age memory loss'
);

addCard(
  'trait',
  'DAVE JI FATE LINE TRIDENT ANALOGY',
  'Saturn Mount Signs',
  'Why did the teacher cite Dave ji as a living demonstration of the Fate Line Trident?',
  'To show that a trident at the top of the Fate Line keeps a native actively working, honored, and intellectually productive past ages 70–80 without retiring.',
  'Dave ji analogy = Lifelong active career continuing past 80'
);

addCard(
  'rule',
  'VERTICAL VS HORIZONTAL VENUS LINES',
  'Venus Mount & In-Laws',
  'What is the fundamental difference in meaning between Vertical lines and Horizontal lines on the Venus Mount?',
  '• Vertical lines on Venus: Progeny / children’s lines.\n• Horizontal lines on Venus: Family, spousal, and in-law relationship lines (and domestic friction when crossing toward Life Line).',
  'Vertical Venus = Children; Horizontal Venus = Family/in-laws/stress'
);

addCard(
  'rule',
  'MARS LINE FADING HEALING SIGN',
  'Clinical Case Studies',
  'How does a palmist know when a client is finally emerging from a chronic crisis phase shown by Mars and parasite lines?',
  'When the lines visibly lighten in shade. As the heavy dark pigmentation fades and the line becomes lighter and finer, the crisis period subsides and recovery begins.',
  'Dark lines fading to lighter shades = Subsidence of crisis'
);

// ==========================================
// QUIZ SECTION: COMPREHENSIVE MULTI-FORMAT QUESTIONS
// Single, Multiple, True/False, Scenario
// ==========================================

// --- TOPIC 1: RARE SIGNS & SYMBOLS ---

addQuiz(
  'single',
  'Rare Signs & Symbols',
  'medium',
  'Where is the Śaṅkha (Conch) sign mostly situated on the palm, and what dual blessings does it bestow?',
  [
    'On the Sun Mount; grants political office and military prowess',
    'On the Ketu Mount area; indicates an exalted spiritual journey and sudden unexpected financial gain',
    'Underneath the index finger; grants culinary talent and property',
    'On the Plain of Mars; causes fiery temper and athletic championships'
  ],
  1,
  'The Śaṅkha (conch) sign is found primarily in the Ketu Mount area. It denotes an advanced spiritual journey and sudden unexpected wealth gain.',
  'Śaṅkha on Ketu = High spiritual path + sudden wealth.'
);

addQuiz(
  'single',
  'Rare Signs & Symbols',
  'medium',
  'How is an authentic Flag (Dhvaja) sign distinguished from a common Square on the palm?',
  [
    'A Flag is closed on all four sides; a Square is open on top',
    'A Flag is closed on THREE sides and open on one side (like a "P" or "F"); a Square is closed on ALL FOUR sides',
    'A Flag only forms on fingernails; a Square only on lines',
    'There is no visual difference between them'
  ],
  1,
  'The lecture explicitly teaches: do not confuse a flag with a square. A flag is closed on three sides and open on one side; a square is fully closed on all four sides.',
  'Flag = 3 sides closed, 1 open; Square = 4 sides closed.'
);

addQuiz(
  'single',
  'Rare Signs & Symbols',
  'easy',
  'Where on the hand is a Tree sign located, and what is its core significance?',
  [
    'At the base of the thumb; causes digestive illness',
    'At the very end (last stretch) of a line; signifies growth, prosperity, and enhanced line strength',
    'Directly in the center of the palm; indicates agricultural inheritance only',
    'Inside the nail of the middle finger; signifies long travel'
  ],
  1,
  'The Tree sign appears at the very end of a line, branching like boughs. It bestows growth, prosperity, renown, and amplifies the strength of that line.',
  'Tree sign at line terminus = Prosperity, expansion & vigor.'
);

addQuiz(
  'single',
  'Rare Signs & Symbols',
  'medium',
  'Where is the SOLE location on the human hand where a Chain (Jañjīra) formation is considered positive?',
  [
    'At the start of the Life Line',
    'Across the Heart Line under Saturn',
    'On the Family Ring (the lowest bracelet crease at the base of the thumb)',
    'Along the Mercury Line'
  ],
  2,
  'The family ring at the base of the thumb is the ONLY exception where a chain is good. Everywhere else, chains indicate struggle and weakness; on the family ring, a chain is mandatory for domestic happiness.',
  'Thumb family ring = Sole positive location for chains.'
);

addQuiz(
  'true_false',
  'Rare Signs & Symbols',
  'easy',
  'True or False: If the family ring at the base of the thumb is completely straight and devoid of chains, married and family life is considered exceptionally blessed.',
  [
    'True',
    'False'
  ],
  1,
  'False! The lecture establishes: if the family ring has no chain, married/family life is NOT called good. A chain there is "very necessary".',
  'Lack of chain on thumb ring = Domestic and marital friction.'
);

// --- TOPIC 2: SATURN MOUNT SIGNS ---

addQuiz(
  'single',
  'Saturn Mount Signs',
  'hard',
  'What does a Trident crowning the very end of the Fate Line on the Saturn Mount signify?',
  [
    'Sudden bankruptcy and renunciation at age 50',
    'Intense desire for karma (action), lifelong career success, and working with fame past ages 60, 70, and 80 until death',
    'Severe chronic arthritis preventing all physical labor',
    'Immediate employment in maritime shipping'
  ],
  1,
  'A trident at the top of the Fate Line gives great drive for karma and lifelong career success lasting into advanced senior years (60, 70, 80+) without retirement.',
  'Fate line trident = Lifelong productive career lasting until death.'
);

addQuiz(
  'multiple',
  'Saturn Mount Signs',
  'medium',
  'Which of the following signs on the Saturn Mount (Śani Parvat) are considered protective or auspicious? (Select all that apply)',
  [
    'Triangle in the upper part (very good sign)',
    'Square (protective shield)',
    'Fish sign (spiritual career growth)',
    'Trident at the end of the Fate Line (career success into old age)',
    'Dense, dark black cross cutting the apex'
  ],
  [0, 1, 2, 3],
  'On Saturn: Triangles are very good, Squares provide protection, Fish enhances spiritual careers, and Tridents at the Fate Line end grant lifelong success. A black cross is afflicted.',
  'Auspicious Saturn signs: Triangle, Square, Fish, Terminus Trident.'
);

// --- TOPIC 3: DOUBLE LIFE LINE VS SUPPORTIVE LINE ---

addQuiz(
  'single',
  'Double Life Line',
  'medium',
  'How do you distinguish a Double Life Line from a Supportive (Mars) Line?',
  [
    'A Double Life Line is always red; a Supportive Line is yellow',
    'In a Double Life Line, both lines originate together or the second line touches/joins the Life Line; a Supportive Line runs parallel without touching',
    'A Double Life Line only appears on the left hand; a Supportive Line on the right',
    'There is no distinction; both are identical'
  ],
  1,
  'If both lines emerge together or the second line touches/joins the Life Line, it is a Double Life Line. If it runs parallel at a distance without touching, it is a Supportive (Mars) line.',
  'Joined/touching = Double Life Line; Parallel separated = Supportive Line.'
);

addQuiz(
  'single',
  'Double Life Line',
  'medium',
  'Does a Double Life Line guarantee a longer physical lifespan, and what is its primary real-world manifestation?',
  [
    'Yes, it guarantees living past 120 years',
    'No; it does not indicate longer life, but signifies living "two lives", managing dual careers, or pursuing two completely distinct life pathways',
    'It guarantees that the native will have twins',
    'It indicates that the person will suffer from split personality disorder'
  ],
  1,
  'The teacher emphasized: a double life line does NOT mean a longer or better life. It indicates living two lives, dual careers, or two completely different lifestyles (e.g. engineering then acting).',
  'Double Life Line = Dual careers / two modes of living, NOT double lifespan.'
);

addQuiz(
  'scenario',
  'Double Life Line',
  'hard',
  'In the hand analysis of Sushant Singh Rajput discussed in class, what unique combination of lines was highlighted?',
  [
    'A heavily broken Life Line and a wavy, chaotic Brain Line',
    'A joined Double Life Line (matching his dual engineering and acting careers), a very straight practical Brain Line, and a straight Heart Line',
    'A missing Fate Line and three Girdles of Venus',
    'A bleeding Life Line terminating abruptly at age 20'
  ],
  1,
  'His hand demonstrated a classic double life line (engineer then actor), accompanied by a very straight, practical Brain line and a straight Heart line.',
  'SSR hand = Joined double life line + straight practical brain line.'
);

// --- TOPIC 4: TRAJECTORY TOWARD THUMB VS OUTWARD ---

addQuiz(
  'single',
  'Life Line Trajectory',
  'medium',
  'What is the traditional indication when the Life Line curves deeply inward toward the base of the thumb?',
  [
    'Short life ending in childhood',
    'High longevity (100+ years) and settling permanently in or near one’s motherland at the end of life',
    'Complete inability to save money',
    'Immediate monastic renunciation'
  ],
  1,
  'The deeper the Life Line curves inward toward the thumb, the more it traditionally signifies 100+ years of vitality and settling in one\'s native motherland at life\'s conclusion.',
  'Inward thumb curve = Longevity + settling in native motherland.'
);

addQuiz(
  'single',
  'Life Line Trajectory',
  'easy',
  'What do multiple branches radiating outward from the Life Line indicate in modern life?',
  [
    'Severe digestive failure',
    'Continuous outward expansion, foreign travels, or purchasing properties outside one’s hometown',
    'Loss of ancestral reputation',
    'Early blindness'
  ],
  1,
  'Outward branches represent expansion into the external world — traveling abroad, relocating, or buying real estate outside one\'s residential city (like Arvind ji).',
  'Outward branches = External expansion, property outside hometown, travel.'
);

addQuiz(
  'multiple',
  'Life Line Trajectory',
  'hard',
  'In a male’s hand, what afflictions can arise if the Life Line sweeps into an afflicted Moon Mount? (Select all that apply)',
  [
    'Addictions and substance abuse (especially if tiny lines cover Moon)',
    'Troubles, financial losses, or public scandals connected to women',
    'Danger from water accidents (drowning, rafting incidents)',
    'Hormonal imbalances, depression, and disturbed sleep',
    'Effortless accumulation of gold bullion'
  ],
  [0, 1, 2, 3],
  'Moon is a female planet. In an afflicted male hand, a Life Line ending there brings addictions, female-related trouble/scandals, water accidents, hormonal/digestive issues, and insomnia.',
  'Afflicted Moon ending in males = Addictions, female-related grief, water hazards.'
);

addQuiz(
  'single',
  'Life Line Trajectory',
  'medium',
  'What does the "Macchā Rekhā" directly on the Life Line indicate, and what paradox does it present?',
  [
    'It guarantees immediate poverty and eye ailments',
    'It brings Samrāṭ Yoga (imperial authority, status, and honor), but also brings accompanying physical health problems',
    'It guarantees living in an underwater submarine',
    'It removes all karma from past lives'
  ],
  1,
  'The Macchā Rekhā on the Life Line creates Samrāṭ Yoga (high regal power and status) at that age, but simultaneously introduces physical health challenges.',
  'Macchā Rekhā = Samrāṭ Yoga (regal status) accompanied by health struggles.'
);

// --- TOPIC 5: FATE LINE CONNECTIONS & DURATION ---

addQuiz(
  'single',
  'Fate Line Connections',
  'medium',
  'How is the duration of family (father’s) support determined when a branch leaves the Life Line and connects to the Fate Line?',
  [
    'Support is permanent from birth to death regardless of line length',
    'Support lasts for the exact length that the connecting branch physically runs between the two lines',
    'Support lasts only for 6 months',
    'Support is measured from the fingernails'
  ],
  1,
  'The support lasts as long as that connecting line runs. If it connects at age 15–18 and runs until age 25, family/father support was active until 25.',
  'Connecting branch length = Exact duration of active family support.'
);

addQuiz(
  'single',
  'Fate Line Connections',
  'medium',
  'How does the lecture differentiate "restricted" family support from "open" family support?',
  [
    'Restricted support gives cash; open support gives property',
    'Restricted support imposes strict boundaries ("spend only this much, do only this"); open support gives full freedom ("we stand behind you, do what you wish")',
    'Restricted support only comes from the mother; open support from in-laws',
    'There is no difference'
  ],
  1,
  'Restricted support comes with conditional control and financial caps. Open support grants unconditional backing and freedom, bringing mental satisfaction and confidence.',
  'Restricted = Conditional boundaries; Open = Freedom and peace of mind.'
);

addQuiz(
  'single',
  'Fate Line Connections',
  'medium',
  'If an outward branch leaves the Life Line near age 35 and touches the Career/Fate line, how should the palmist phrase the interpretation?',
  [
    'As purely an adventurous sightseeing trip unconnected to finance',
    'As professional expansion and travel undertaken specifically for the sake of work or business',
    'As bankruptcy and loss of career',
    'As permanent ascetic retirement'
  ],
  1,
  'Because the outward line connects directly to the career line, the palmist reads it as travel and expansion for the sake of work, career, or enterprise.',
  'Outward branch touching Fate line = Professional expansion & business travel.'
);

// --- TOPIC 6: VENUS MOUNT, IN-LAWS & DIVORCE ---

addQuiz(
  'single',
  'Venus Mount & In-Laws',
  'easy',
  'Which mount on the palm specifically reflects the spouse and the in-laws (sasurāla)?',
  [
    'Jupiter Mount',
    'Venus Mount (Śukra Parvat)',
    'Mercury Mount',
    'Saturn Mount'
  ],
  1,
  'The Venus Mount represents the spouse, marriage harmony, and relations with the in-laws (sasurāla).',
  'Venus Mount = Spouse & in-laws.'
);

addQuiz(
  'single',
  'Venus Mount & In-Laws',
  'hard',
  'What is the difference between a horizontal Venus line that stops BEFORE the Life Line versus one that TOUCHES it?',
  [
    'Stopping before means divorce; touching means happy marriage',
    'Stopping before represents ordinary internal family disagreements that do not disrupt daily life; touching represents domestic distress that penetrates daily life and indicates potential divorce',
    'Stopping before affects children; touching affects grandparents',
    'Both represent sudden lottery wins'
  ],
  1,
  'Lines stopping before the Life Line reflect silent disagreements carried in the mind. A line touching the Life Line penetrates everyday routine, causing deep domestic stress and potential divorce.',
  'Stopping short = Silent disagreement; Touching Life Line = Disruptive daily friction / divorce.'
);

addQuiz(
  'single',
  'Venus Mount & In-Laws',
  'hard',
  'What happens when a horizontal Venus line crosses the Life Line and extends outward to CUT through the Fate Line?',
  [
    'The native receives an enormous dowry and promotion',
    'Family, in-law, or spousal disputes spill over to directly damage the native\'s career and financial earnings',
    'The native becomes an international diplomat',
    'The native wins an ancestral lawsuit immediately'
  ],
  1,
  'When an in-law/family influence line cuts through the Life Line and hits the Fate Line, domestic conflict directly sabotages the native\'s career and financial stability.',
  'Venus line cutting Fate line = Family/in-law disputes destroying career & income.'
);

addQuiz(
  'single',
  'Venus Mount & In-Laws',
  'medium',
  'What does an island situated at the end of a horizontal Venus influence line signify?',
  [
    'A luxurious family vacation on an island',
    'Acute marital breakdown/divorce, where the native internalizes domestic trauma so deeply that it causes internal illness',
    'Birth of triplets',
    'Purchase of fertile agricultural land'
  ],
  1,
  'An island on a Venus line indicates severe marital trouble, divorce, and a native who internalizes domestic grief without speaking until they fall physically ill.',
  'Island on Venus line = Severe marital trauma, internalized grief, divorce.'
);

// --- TOPIC 7: BRANCHES TO MOUNTS & MARS CUT PROGRESSION ---

addQuiz(
  'single',
  'Branches to Mounts',
  'medium',
  'What does a clean upward line rising from the Life Line toward the Saturn Mount indicate, as seen in the teacher\'s own hand?',
  [
    'Severe bone fracture at age 22',
    'Early upward career surge, monetary gain, or appointment to a government post around that age (e.g. teacher securing government job at 22–25)',
    'Immediate renunciation of material assets',
    'Total loss of eyesight'
  ],
  1,
  'An upward branch rising toward Saturn indicates early career growth, financial elevation, and securing a solid position (like the teacher\'s government job placement).',
  'Life Line branch to Saturn = Early career milestone & government appointment.'
);

addQuiz(
  'single',
  'Branches to Mounts',
  'hard',
  'How do you distinguish an auspicious Sun branch from an inauspicious Mars line affecting the Sun Mount?',
  [
    'Sun branches are blue; Mars lines are yellow',
    'A line rising from the OUTSIDE / Life Line itself toward Sun brings fame (prasiddhi); a line rising from the INSIDE (Lower Mars) that cuts the Sun line brings defame (apavāda)',
    'Sun branches only occur in women; Mars cuts only in men',
    'There is no visual difference'
  ],
  1,
  'A branch rising from the Life Line itself toward the Sun brings fame. A line coming from the inside (Lower Mars) that cuts across the Sun line brings defame (public disgrace/scandal).',
  'Rising from Life line = Fame; Slashing from Lower Mars = Defame.'
);

addQuiz(
  'single',
  'Branches to Mounts',
  'hard',
  'In the progressive three-stage crossing of an aggressive Mars line, what is the consequence when it cuts the Head Line?',
  [
    'Immediate wealth gain',
    'Severe mental depression and cognitive breakdown (timed by the Head Line age scale)',
    'Loss of hearing in the left ear',
    'Sudden talent in mathematics'
  ],
  1,
  'Stage 1 (touching Life Line) = life disruption; Stage 2 (cutting Head Line) = mental depression; Stage 3 (cutting Heart Line) = emotional heartbreak.',
  'Mars line cutting Head line = Mental depression & psychological distress.'
);

addQuiz(
  'single',
  'Branches to Mounts',
  'medium',
  'In the Heart Line age formula introduced in Lecture 21, what age span is assigned to the base of each finger and to each inter-finger cleft?',
  [
    'Finger base = 10 years; cleft = 5 years',
    'Finger base = 18 years; cleft = 6 years',
    'Finger base = 25 years; cleft = 12 years',
    'Finger base = 7 years; cleft = 7 years'
  ],
  1,
  'The Heart Line aging formula assigns 18 years to the base of each finger, and 6 years to the gap (cleft) between adjacent fingers (18, 6, 18, 6, 18).',
  'Heart Line: Base of finger = 18 yrs; Inter-finger cleft = 6 yrs.'
);

// --- TOPIC 8: CLINICAL CASE STUDIES ---

addQuiz(
  'scenario',
  'Clinical Case Studies',
  'hard',
  'A 33-year-old female client has kidney failure (functioning at ~6%), waiting for a transplant. Which hand markings confirmed systemic toxicity and protracted illness in class?',
  [
    'Pink resilient skin with a single deep Life Line',
    'Chained, broken Life Line up to age 40, flattened/deflated Venus mount, and bluish lines/palm reflecting poor blood purification and toxin buildup',
    'A clear fish on Ketu and three rings of Solomon',
    'A long smooth Sun Line starting at the wrist'
  ],
  1,
  'Her hand displayed a chained/cut Life Line up to age 40, deflated small Venus, and blue discoloration on palm and lines, matching impaired kidney filtration and blood toxicity.',
  'Chained life line + deflated Venus + blue palm = Chronic organ/blood toxicity.'
);

addQuiz(
  'scenario',
  'Clinical Case Studies',
  'medium',
  'In the same 33-year-old patient\'s hand, what real-life stress correlated with the dark parasite line running beside her Life Line?',
  [
    'A stressful university PhD dissertation',
    'Her husband\'s divorced sister, two children, and mother-in-law moving into her home, creating immense domestic friction and caregiving burden',
    'Loss of money in cryptocurrency trading',
    'An accident during a marathon'
  ],
  1,
  'The dark parasite line matched the heavy domestic burden and stress of caring for dependent in-laws (divorced sister-in-law and children) living in her home.',
  'Parasite line = Burden of dependent in-laws living in the household.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'What is the Lava Vasavīya (Poison Line / Sister of Mercury), and what health vulnerability does it indicate?',
  [
    'A line on the thumb indicating throat infections',
    'A transverse crease running from the Mercury area toward the Moon Mount; indicates chronic toxic buildup and severe liver disorders',
    'A vertical line on Saturn indicating bone fractures',
    'A line under the Sun finger indicating eye strain'
  ],
  1,
  'The Lava Vasavīya (poison line) travels from Mercury toward Moon. It reflects systemic toxicity and liver damage, commonly found in people indulging in alcohol or improper food.',
  'Poison line (Mercury to Moon) = Toxic overload & liver disease.'
);

addQuiz(
  'scenario',
  'Clinical Case Studies',
  'medium',
  'In Jīveśa ji\'s hand (age 26, leaving for Mauritius for temple work), what combination predicted his overseas temple career and future mental tendency?',
  [
    'A Life Line to Mars and an absent Head Line',
    'A Fate Line originating from the Moon Mount (connection to pūjā-pāṭha/temple worship) and two Head Lines (high intellect with danger of old-age forgetfulness)',
    'Three crosses on Jupiter and a broken Heart Line',
    'A single bleeding line from wrist to middle finger'
  ],
  1,
  'His Fate Line from Moon Mount denoted career linked with pūjā/temple worship abroad. His dual Head Lines reflected deep lunar mental activity, with an old-age tendency toward forgetfulness.',
  'Moon Fate line = Temple service abroad; Dual Head lines = High intellect & dementia risk.'
);

addQuiz(
  'scenario',
  'Clinical Case Studies',
  'medium',
  'In Anurādhā ji\'s hand, what did a black mole on the Moon Mount indicate, and what sign provided safety?',
  [
    'Indicated extreme wealth; star on Sun provided fame',
    'Indicated severe health vulnerability (fluid/depression issues); a triangle on her Life Line provided protection and survival',
    'Indicated foreign marriage; square on Saturn gave property',
    'Indicated vocal talent; cross on Mercury gave trade'
  ],
  1,
  'A black mole on Moon Mount is very bad for health (fluid balance, depression, water risks). However, a triangle on her Life Line provided protection and safety.',
  'Mole on Moon = Health vulnerability; Triangle on Life line = Safety shield.'
);

addQuiz(
  'single',
  'Rare Signs & Symbols',
  'easy',
  'What did the teacher note about the permanence of palm signs and symbols over the course of life?',
  [
    'They are permanently etched at birth like stone engravings and can never change',
    'Signs and symbols dynamically appear and disappear on the hand over time in response to changes in karma, lifestyle, and health',
    'They only change during solar eclipses',
    'They vanish every night during sleep'
  ],
  1,
  'The lecture explicitly emphasizes in Section 1: "Signs come and go — signs appear and disappear on the hand" as the native evolves.',
  'Palm signs are dynamic and evolve with life changes.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'Why did the teacher remark that artificial nails are "the root of half of human diseases" during hand analysis?',
  [
    'Because they are made of toxic radioactive plastic',
    'Because they harbor and breed dangerous bacterial pathogens underneath, and obscure the natural nail bed color, texture, and lunulae needed for medical diagnosis',
    'Because they alter the length of the finger bones',
    'Because they prevent blood from entering the hand'
  ],
  1,
  'Long artificial nails trap bacteria underneath and hide the physical diagnostic color and condition of the natural nail bed.',
  'Artificial nails harbor infection and mask natural diagnostic health markers.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'In the 33-year-old friend\'s palm photograph, what psychological state did her tucked thumb indicate?',
  [
    'Extreme arrogance and royal pride',
    'Unconscious defensive withdrawal, feeling overwhelmed, hiding her willpower, and internal helplessness under chronic suffering',
    'High athletic aggression',
    'A desire to become a martial artist'
  ],
  1,
  'Tucking the thumb inside the hand indicates a subconscious defensive posture, feeling emotionally overwhelmed, and hiding one\'s vulnerable vitality.',
  'Tucked thumb = Defensive emotional withdrawal and helplessness.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'hard',
  'What pathological condition was revealed by the distinct bluish lines and blue skin tint across the 33-year-old patient\'s palm?',
  [
    'High levels of royal blue prana',
    'Failure of blood purification, retention of metabolic toxins and carbon dioxide in the bloodstream due to severe kidney filtration failure (~6% function)',
    'Excessive consumption of blueberries',
    'Dehydration from marathon running'
  ],
  1,
  'Blue coloration across the lines and palm indicates blood purification failure, poor oxygenation, and high toxic retention in the blood due to failing kidneys.',
  'Blue lines/palm = Failure of blood purification and toxic retention.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'What does a deflated, flattened ("pichkā huā") Venus mount with small surface area indicate in a 32-year-old client?',
  [
    'Sudden monastic enlightenment',
    'Severe premature depletion of physical vitality, exhaustion of reproductive ojas, and deep domestic or physical fatigue',
    'Immunity to all infectious diseases',
    'Effortless accumulation of luxury vehicles'
  ],
  1,
  'A flattened, deflated Venus mount at age 32 indicates that physical vitality, sexual vigor, and reproductive ojas are severely depleted by chronic disease and domestic stress.',
  'Deflated Venus at 32 = Premature depletion of vital ojas and endurance.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'hard',
  'What does a transverse crease located just above the joint between the Saturn and Jupiter fingers indicate?',
  [
    'The native will receive a Nobel Prize',
    'Whatever career, study, or profession the native pursues, material compensation and worldly fruits will be lower than expected',
    'The native will lose both fingers in an accident',
    'The native will build four temples'
  ],
  1,
  'The teacher explained that a line just above the joint between the Saturn and Jupiter fingers indicates that material fruits and financial benefits from one\'s work will be diminished.',
  'Saturn-Jupiter joint line = Diminished material reward from career.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'What is an Impression Line rising from the Moon Mount toward the Fate Line, and what dual meanings can it carry?',
  [
    'A mark of eye disease or loss of property',
    'An influence line showing (a) a profound teenage role-model impression (creative inspirations/friends), or (b) a love marriage',
    'A mark of extreme legal penalties',
    'An indication of military draft'
  ],
  1,
  'An impression line from the Moon Mount toward the Fate Line signifies an outside influence entering life: either a major teenage role model/inspiration or a love marriage.',
  'Moon impression line = Teenage role model or love marriage.'
);

addQuiz(
  'single',
  'Branches to Mounts',
  'medium',
  'What abilities are indicated when an upward branch rises from the Life Line directly toward the Mercury Mount?',
  [
    'Severe digestive ulcers and tooth decay',
    'Commercial acumen, strong business mindset, aptitude for deep studies and research, and natural charm in making friends easily',
    'Monastic vows and silence',
    'Frequent legal arrests'
  ],
  1,
  'An upward branch to Mercury confers business intellect, research passion, commercial acumen, and social ease in forming friendships.',
  'Branch to Mercury = Commercial talent, research drive, and social ease.'
);

addQuiz(
  'single',
  'Age Calculation',
  'medium',
  'In the Lecture 21 aging demonstration on the Life Line, how is the bottom reference line anchored?',
  [
    'To the tip of the pinky finger',
    'To the exact MIDPOINT of the wrist (kalāī), regardless of where the Life Line itself turns or curves',
    'To the center of the Venus Mount',
    'To the lowest nail fold of the thumb'
  ],
  1,
  'The bottom anchor is drawn to the exact MIDPOINT of the wrist (kalāī). The palmist ignores whether the Life Line itself curls inward or outward.',
  'Aging reference anchor = Exact geometric midpoint of the wrist.'
);

addQuiz(
  'single',
  'Age Calculation',
  'medium',
  'Where is Age 30 located in the Lecture 21 aging demonstration?',
  [
    'Exactly at the wrist bracelet',
    'Slightly ABOVE the geometric midpoint of the Life Line span (it is not the exact physical 50% center)',
    'At the 10% point near the index finger',
    'At the very end of the line'
  ],
  1,
  'The teacher explicitly noted: "First locate 30: its place is slightly above the midpoint. It is not the midpoint of the whole span."',
  'Age 30 sits slightly above the geometric midpoint of the line.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'hard',
  'Why did the teacher strictly advise against planning a second pregnancy in the 33-year-old friend\'s case?',
  [
    'Because the astrology chart banned having two children',
    'Because her Life Line was heavily chained and broken with active parasite lines, indicating critical organ strain where a pregnancy would be life-threatening',
    'Because she had artificial nails',
    'Because her husband traveled for work'
  ],
  1,
  'The teacher said: "Right now say NO" to a second child, because her Life Line quality was severely compromised by active disease, making pregnancy physically dangerous.',
  'Chained/ill Life line = Advise against pregnancy until health stabilizes.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'What potential vulnerability in later years was identified in Jīveśa ji due to having Two Mind Lines?',
  [
    'Severe heart disease',
    'Old-age forgetfulness and risk of dementia, alongside his heightened lunar intellectual activity',
    'Loss of speech at age 40',
    'Inability to read'
  ],
  1,
  'The teacher noted: "Two mind lines sometimes give dementia / forgetfulness in old age", though they also grant sharp lunar cognitive activity in youth.',
  'Two Mind lines = High intellect with potential old-age memory loss.'
);

addQuiz(
  'single',
  'Saturn Mount Signs',
  'medium',
  'Why did the teacher cite Dave ji as a real-world living example during the discussion on Saturn Mount signs?',
  [
    'To demonstrate someone who retired at age 35',
    'To demonstrate someone with a trident at the end of the Fate Line who remains active, productive, and honored past age 70–80 without retiring',
    'To show someone with severe arthritis',
    'To illustrate a lottery winner'
  ],
  1,
  'Dave ji was cited as a living illustration of someone with a trident at the end of the Fate Line who remains actively working and honored past age 70–80.',
  'Dave ji = Living proof of lifelong active career into advanced age.'
);

addQuiz(
  'single',
  'Venus Mount & In-Laws',
  'medium',
  'How do Vertical lines differ from Horizontal lines on the Venus Mount in Vedic palmistry?',
  [
    'Vertical lines represent bank loans; horizontal lines represent cash',
    'Vertical lines represent progeny (children); horizontal lines represent family and in-law relationships and domestic stress',
    'Vertical lines only appear in women; horizontal only in men',
    'Both represent identical spiritual attainments'
  ],
  1,
  'Vertical lines on Venus represent children; horizontal lines represent family relationships, in-laws, and domestic friction when crossing toward the Life Line.',
  'Vertical Venus lines = Children; Horizontal Venus lines = Family/in-law relationships.'
);

addQuiz(
  'single',
  'Clinical Case Studies',
  'medium',
  'How does a palmist visually recognize that a client is finally emerging from a severe crisis phase shown by Mars lines and parasite lines?',
  [
    'The lines turn bright yellow',
    'The dark, heavy lines gradually become lighter and finer in shade, indicating that the crisis is dissipating and life is normalizing',
    'The fingernails fall off',
    'The thumb doubles in length'
  ],
  1,
  'The teacher noted: "It is dark now; as the lines become lighter, that period starts getting better." Fading from dark to pale signals recovery.',
  'Dark lines fading to lighter shades = Transition into recovery.'
);

console.log(`Successfully compiled for Note 21:`);
console.log(`- ${flashcards.length} High-Yield Flashcards (100% Unique)`);
console.log(`- ${quizzes.length} Comprehensive Quiz Questions (100% Unique)`);

// Write out to src/data/learning/21-symbols-life-line-03.ts
const targetFile = path.join(__dirname, '../src/data/learning/21-symbols-life-line-03.ts');
const fileContent = `// Auto-generated High-Yield Curated Deck for Lecture 21
// Source: notes/21 - Symbols & Life Line - Part 03.md
// Signs & Symbols, and the Life Line – Part 03
// 100% Unique Questions & Flashcards, Zero Padding Loops

import { CuratedDeck } from '@/lib/learningTypes';

export const lecture21Deck: CuratedDeck = {
  lectureId: 'lecture-21',
  lectureTitle: 'Signs & Symbols, and the Life Line – Part 03',
  summary:
    'Comprehensive active-recall learning deck covering rare auspicious signs (Śaṅkha/Conch on Ketu, Flag on Sun/Saturn, Tree at line terminus, Chain on thumb Family Ring exception, Saturn Mount signs & lifelong career Trident), Double Life Line vs Supportive Mars Line (Sushant Singh Rajput case), Life Line trajectory (inward thumb curve longevity & motherland return vs outward expansion), Moon mount ending afflictions (addictions, female troubles, water hazards), Macchā Rekhā / Samrāṭ Yoga, Fate Line connections & duration of family support, Venus Mount in-laws & divorce markers, upward branches to mounts vs Mars defame cuts, three-stage Mars line progression (Life, Head depression, Heart trauma), Heart Line age formula (18-6-18-6-18), Poison Line (Lava Vasavīya), and real client case studies (33F kidney disease, Anurādhā ji, Jīveśa ji Mauritius temple visa).',
  flashcards: ${JSON.stringify(flashcards, null, 2)},
  quizzes: ${JSON.stringify(quizzes, null, 2)},
};
`;

fs.writeFileSync(targetFile, fileContent, 'utf8');
console.log(`Written deck to: ${targetFile}`);
