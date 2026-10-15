const fs = require('fs');
const path = require('path');

// Comprehensive High-Yield Learning Deck Builder for Lecture 27
// Source: notes/27 - Aging.md
// Aging (Age Calculation) and Budha Rekhā (Mercury Line)
// Strict Quality Guidelines:
// - 100% Unique Questions & Flashcards (ZERO padding loops, ZERO cloned drills)
// - Accurate Sāmudrika Śāstra principles, formulas, case studies, and clinical takeaways

console.log('Building Lecture 27 high-yield Learning Deck...');

const flashcards = [];
const quizzes = [];

const NOTE_ID = '27 - Aging.md';
const NOTE_TITLE = 'Hasta Sāmudrika Śāstra – Aging (Age Calculation on Lines) and Budha Rekhā (Mercury Line)';

function addCard(category, tag, subtopic, front, back, tip) {
  flashcards.push({
    id: `aging-mercury-fc-${flashcards.length + 1}`,
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
    id: `aging-mercury-qz-${quizzes.length + 1}`,
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
// THEME 1: CLASSICAL AGING METHODS
// Old Indian (ṣaḍaṁśa), Cheiro (saptāṁśa), Three-line average
// ==========================================

addCard(
  'measurement',
  'ṢAḌAṀŚA PADDHATI (OLD INDIAN METHOD)',
  'Old Indian Aging Method',
  'What is the ancient Indian Ṣaḍaṁśa Paddhati (division by 6) for age calculation?',
  'An ancient Indian timing system where the curved Life Line is measured from its origin (thumb side = 0) to the middle of the wrist line (maṇibandha rekhā).\n\nThe total lifespan is assumed to be 70 to 72 years, divided into 12 equal segments of 6 years each (0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72).',
  '70-72 lifespan ÷ 6-year intervals = 12 parts'
);

addCard(
  'principle',
  'ANCIENT HEART LINE TIMING PARADOX',
  'Old Indian Aging Method',
  'Why did ancient Indian palmists historically use the Heart Line (Hṛdaya Rekhā) instead of the Life Line to calculate lifespan?',
  'Classical Indian masters reasoned that physical life immediately ceases the moment the heart stops beating ("if the heart stops working, life ends").\n\nTherefore, the Heart Line was originally treated as the primary vitality cord. The shift to prioritizing the Life Line for age determination arose later from extensive Western research.',
  'Ancient view: Heart stops = life ends; modern view: Life line measures physical vitality'
);

addCard(
  'rule',
  'DEŚA-KĀLA-PARISTHITI IN LIFESPAN',
  'Old Indian Aging Method',
  'Why must the assumed total lifespan in palmistry be adjusted according to Deśa-Kāla-Paristhiti (time, place, and circumstance)?',
  'Historical lifespans were lower due to high maternal mortality during childbirth, infectious diseases, and lack of modern medicine.\n\nWith improved healthcare, sanitation, and medical interventions, average life expectancy has risen. Palmistry scales must calibrate baseline longevity to the demographic context of the era.',
  'Calibrate baseline age (e.g. 70 vs 85) to historical and medical context'
);

addCard(
  'measurement',
  'SAPTĀṀŚA PADDHATI (CHEIRO METHOD)',
  'Cheiro Saptāṁśa Method',
  'What is Cheiro\'s Saptāṁśa Paddhati (division by 7) for measuring the Life Line?',
  'Cheiro\'s system assumes a total ideal lifespan of 98 to 100 years.\n\nA thread or paper is laid along the curve of the Life Line from origin (0) to the maṇibandha rekhā and divided into 14 equal parts of 7 years each (7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98).',
  '98 years ÷ 7-year blocks = 14 equal parts'
);

addCard(
  'warning',
  'CHEIRO 7-YEAR PREDICTION LIMIT',
  'Cheiro Saptāṁśa Method',
  'What critical warning did Cheiro establish regarding the maximum time horizon for palmistry predictions?',
  'Cheiro strictly advised never to predict more than 7 years into the future (and preferably even less).\n\nReason: The lines, mounts, and signs of the hand are not static; they continually transform, strengthen, or fade in response to mental focus, actions (karma), and lifestyle changes.',
  'Lines dynamically change: Never predict beyond a 7-year window'
);

addCard(
  'measurement',
  'THREE-LINE AVERAGE CALCULATION',
  'Three-Line Average Method',
  'How is total lifespan calculated using the Three-Line Average method?',
  '1. Take three lines: Life Line, Mind Line, and Heart Line (exclude the Fate Line).\n2. Assume the theoretical full length of each line equals 100 years.\n3. Estimate where each line terminates on its 100-year scale.\n4. Add the three estimated ages together.\n5. Divide the sum by 3 to derive the average predicted lifespan (e.g., 70 + 75 + 60 = 205 ÷ 3 ≈ 68–70 years).',
  '(Life + Heart + Mind) ÷ 3 on a 100-year scale'
);

addCard(
  'rule',
  'FATE LINE EXCLUSION IN LONGEVITY',
  'Three-Line Average Method',
  'Why is the Fate Line (Bhāgya Rekhā) deliberately omitted from the Three-Line Average longevity calculation?',
  'The Fate Line measures career engagement, worldly duties, and financial karmas, not constitutional biological vitality.\n\nA person can live a very long, healthy life with a faint or absent Fate Line, or experience early retirement while retaining full bodily vigor.',
  'Fate line tracks career/wealth flow, NOT biological vitality'
);

addCard(
  'scenario',
  'CALIBRATING AGE WITH A LIVE CLIENT',
  'Clinical Age Calibration',
  'How should a palmist calibrate age measurements when analyzing a living client\'s hand?',
  'Calibrate the scale against confirmed past biographical events:\n\nLocate an unambiguous past marker (such as a triangle for property acquisition or an influence line for marriage), ask the client the exact chronological age when that event occurred, and align the line\'s physical coordinate to that verified timestamp.',
  'Anchor the timeline to a confirmed past event (e.g., house purchase)'
);

// ==========================================
// THEME 2: CURRENT METHOD (30 AT MIDPOINT)
// Life Line, Fate Line, Halving Technique
// ==========================================

addCard(
  'rule',
  'CURRENT 30-MIDPOINT METHOD',
  'Current Class Method (Midpoint 30)',
  'How is the "30 at the Midpoint" method performed on the Life Line?',
  '1. Lay a thread or paper along the Life Line curve from origin (0) to the wrist line (maṇibandha).\n2. Fold the paper exactly in half.\n3. The exact center fold point is permanently designated as age 30.\n4. The remaining lower half represents age 30 to 75 (average lifespan), which is subdivided into successive halves to date later life events.',
  'Center fold of Life Line = fixed at age 30; second half = 30 to 75'
);

addCard(
  'measurement',
  'FATE LINE TIMING FROM WRIST',
  'Current Class Method (Midpoint 30)',
  'From what physical point is age always measured on the Fate Line, even if the line starts in the middle of the palm?',
  'Age on the Fate Line is ALWAYS measured from the wrist line (maṇibandha rekhā = age 0) up to Saturn Mount (age 75).\n\nThe exact midpoint corresponds to age 30. If the physical Fate Line only becomes visible at age 25 or 30, the lower blank space indicates delayed career direction, but the measurement baseline still starts at the wrist.',
  'Baseline is always maṇibandha = 0, center = 30, top = 75'
);

addCard(
  'warning',
  'FAINT OR ABSENT FATE LINE RULE',
  'Current Class Method (Midpoint 30)',
  'What must a palmist do if the client\'s Fate Line is extremely faint, broken, or not visible?',
  'Do NOT attempt to force an age calculation on a non-visible or faint Fate Line.\n\nInstead, transfer all event timing to the Life Line. The Life Line contains comprehensive records of life transitions, relocations, wealth rises, and career turning points.',
  'Never guess on faint Fate Lines; read all life transitions on Life Line'
);

// ==========================================
// THEME 3: HEART & MIND LINE AGING
// 18 + 6 formula, Method B
// ==========================================

addCard(
  'rule',
  'HEART LINE AGING (18 + 6 FORMULA)',
  'Heart Line Aging',
  'Explain Method A (the preferred 18 + 6 formula) for calculating age on the Heart Line.',
  'Starting from the outer percussion edge under the Mercury finger:\n- First active block = 18 years.\n- Next intervening gap = 6 years.\n- Progresses in alternating intervals: 18 + 6 + 18 + 6 + 18...\n\nIf the line terminates partway through an 18-year block, estimate the proportion (e.g., 14) and sum the total.',
  'Heart Line progression: 18 (active) + 6 (gap) + 18 + 6...'
);

addCard(
  'contrast',
  'HEART LINE METHOD A VS METHOD B',
  'Heart Line Aging',
  'Contrast Heart Line Aging Method A with Method B, and explain why Method A is clinically preferred.',
  'Method B assigns fixed ages under fingers: under Mercury = 16, under Sun = 36, under Saturn = 50, beyond = 50+.\n\nMethod A (18+6 formula) is clinically superior because Heart Line variations and emotional event markers are rarely identifiable beyond age 50; Method A provides granular timing for early and mid-life relationship developments.',
  'Method A provides precise early/mid-life increments; Method B is too broad'
);

addCard(
  'rule',
  'MIND LINE AGING PROTOCOL',
  'Mind Line Aging',
  'How should timing be determined on the Mind Line (Mastiṣka Rekhā)?',
  'Clinical rule: Mind Line age is generally NOT calculated independently because the Life Line provides the most accurate and reliable timing for all psychological and physical milestones.\n\nIf specifically required, apply the 18 + 6 formula starting from its point of origin (0 at the radial edge).',
  'Default to Life Line for dating; use 18 + 6 on Mind Line only if necessary'
);

// ==========================================
// THEME 4: BUDHA REKHĀ (MERCURY LINE)
// Health, Liver, Business, Healer Line
// ==========================================

addCard(
  'principle',
  'NATURE OF THE MERCURY LINE',
  'Mercury Line (Budha Rekhā)',
  'What is the fundamental medical and constitutional paradox of the Mercury Line (Budha Rekhā)?',
  'The Mercury Line is also known as the Health Line (Svāsthya Rekhā) or Liver Line.\n\nParadox: Its total absence is actually a sign of robust, resilient physical constitution. When present, it highlights digestive, gastric, or hepatic sensitivity requiring dietary discipline, even though it can indicate keen commercial acumen.',
  'Absence of Mercury line = robust health; Presence = digestive/liver sensitivity'
);

addCard(
  'contrast',
  'MERCURY LINE: BELOW VS ABOVE HEART LINE',
  'Mercury Line (Budha Rekhā)',
  'How do the clinical indications differ when the Mercury Line starts below the Heart Line versus when it begins strictly above it?',
  '1. Starts below Heart Line (deep in palm): Chronic physical health vulnerabilities, liver stress, and digestive disorders.\n\n2. Starts strictly ABOVE Heart Line: Indicates commercial success in later years and forms the "Healer Line" (medical intuition, psychological counselling, healing speech).',
  'Below Heart Line = health/liver trouble; Only above Heart Line = healer/business acumen'
);

addCard(
  'trait',
  'HEALER LINE & MERCURY VĀṆĪ',
  'Mercury Line (Budha Rekhā)',
  'Why is a Mercury Line located strictly above the Heart Line associated with healers, doctors, and counsellors?',
  'Mercury (Budha) is the cosmic significator of speech (vāṇī), intellect, and nervous communication.\n\nA clean vertical line high on Mercury Mount indicates the gift of restorative communication — individuals whose empathetic words relieve anxiety, resolve crises, and emotionally heal clients or patients.',
  'Mercury governs vāṇī: Speech that relieves distress and heals'
);

addCard(
  'symbol',
  'INTUITION LINE (PŪRVĀBHĀSA)',
  'Intuition Line',
  'What is the Intuition Line, where does it originate, and what does it indicate?',
  'A rare curved line originating on the Mount of Moon and traveling upward to the Mount of Mercury (or joining an existing Mercury Line).\n\nSignificance: Bestows pūrvābhāsa — sharp premonition, prophetic dreams, and the instinctive ability to sense upcoming occurrences before they physically manifest.',
  'Moon Mount to Mercury Mount = Intuition & premonition'
);

addCard(
  'warning',
  'ABSENCE OF INTUITION LINE',
  'Intuition Line',
  'Does the absence of a distinct Intuition Line prove that a client lacks intuitive faculties?',
  'No. Classical palmistry features multiple independent intuition markers (such as the Mystic Cross in the Rāhu plain, Solomon Ring on Jupiter, and deep Moon Mount lines).\n\nIntuition manifests through various planetary channels even without a dedicated Moon-to-Mercury line.',
  'Absence of intuition line ≠ lack of intuition; check other markers'
);

// ==========================================
// THEME 5: MERCURY MOUNT SIGNS & FORMATIONS
// Star, Cross, Circle, Grille, Money Triangle
// ==========================================

addCard(
  'symbol',
  'STAR ON MERCURY MOUNT',
  'Mercury Mount Signs',
  'Why is a Star considered an exception on the Mercury Mount compared to other palm locations?',
  'While a star is generally disruptive on most mounts (e.g., Saturn or Apollo), classical masters regard a star on Mercury Mount as highly auspicious.\n\nIt indicates brilliant eloquence, investigative research capability, scientific innovation, and persuasive diplomatic speech.',
  'Star on Mercury = Auspicious eloquence, scientific brilliance, research talent'
);

addCard(
  'symbol',
  'CROSS ON MERCURY MOUNT',
  'Mercury Mount Signs',
  'What are the negative manifestations of a Cross on the Mount of Mercury?',
  'A cross on Mercury Mount causes:\n1. Severe friction, betrayal, or financial disputes in business partnerships.\n2. Disruption to the Marriage Line (Vivāha Rekhā), causing misunderstandings, broken engagements, or marital strife.',
  'Cross on Mercury = Partnership disputes & marriage line damage'
);

addCard(
  'symbol',
  'CIRCLE VS MOLE ON MERCURY MOUNT',
  'Mercury Mount Signs',
  'How does a Circle differ from a Mole (Til) on the Mount of Mercury in its diagnostic meaning?',
  'A Circle (with clear healthy skin showing in its center) is a rare protective talisman that shields the person from serious illness.\n\nA solid black Mole (Til), by contrast, is severely inauspicious on Mercury, causing acute loss of public honour, scandalous loss of reputation (mān-sammāna), and financial deception.',
  'Circle = Protective shield against disease; Mole = Loss of honour/reputation'
);

addCard(
  'symbol',
  'JĀLĪ (GRILLE) ON MERCURY MOUNT',
  'Mercury Mount Signs',
  'What precise geometric criteria must be met before identifying a true Jālī (Grille) on the Mercury Mount?',
  'A true Jālī requires at least THREE clear vertical lines intersected by at least THREE clear horizontal lines of equal density.\n\nIf horizontal lines are faint or if there are fewer than three lines in either direction, it is not an active jālī. A true jālī damages commercial reputation and signals health instability.',
  'True Jālī requires at least 3×3 equally prominent intersecting lines'
);

addCard(
  'symbol',
  'SINGLE VERTICAL LINE ON MERCURY',
  'Wealth Signs on Mercury',
  'What is indicated by a SINGLE prominent vertical line standing alone on the Mount of Mercury?',
  'A single vertical line on Mercury Mount signifies sudden, unexpected monetary gain or windfall.\n\nNote: If two or more parallel vertical lines appear together, they transform into Healing Lines (medical/counselling empathy); only a single standalone line indicates sudden financial windfalls.',
  '1 vertical line = Sudden financial windfall; 2+ lines = Healing lines'
);

addCard(
  'symbol',
  'DHANA KĪ KOṬHĪ (MONEY TRIANGLE)',
  'Wealth Signs on Mercury',
  'Which three lines form the "Dhana kī Koṭhī" (Money Treasury Triangle), and what determines its financial strength?',
  'Formed by the intersection of three lines: Head Line (Mastiṣka), Fate Line (Bhāgya), and Mercury Line (Budha).\n\nStrength: If the interior of the triangle is clean and unbroken, money accumulates securely. If cross bars or island cuts clutter the interior, expenses will consistently exceed earnings.',
  'Head + Fate + Mercury lines; clean interior = wealth accumulation'
);

addCard(
  'warning',
  'EXTENDED MARRIAGE LINE CUTTING SUN LINE',
  'Marriage Line Afflictions',
  'What occurs when a Marriage Line extends excessively across the palm and cuts the Sun Line (Sūrya Rekhā)?',
  'An extended Marriage Line cutting the Sun Line signifies severe public scandal, loss of prestige, and legal/financial ruin caused by a spouse or a woman in the household.\n\nIn a male\'s hand, it specifically points to humiliation or defamation connected to his wife or female relative.',
  'Marriage line cutting Sun line = Public disgrace/ruin through a woman'
);

// ==========================================
// THEME 6: HEART TO MIND CONNECTING LINES
// Semi-simian vs emotional vs enemy lines
// ==========================================

addCard(
  'contrast',
  'CONNECTING LINES: HEART TO MIND VS MIND TO HEART',
  'Connecting Lines',
  'How do the psychological interpretations differ between a branch descending from Heart to Mind versus ascending from Mind to Heart?',
  '1. Heart Line descending to Mind Line: Emotional vulnerability, emotional heartbreak, and domestic family distress overpowering practical judgment.\n\n2. Mind Line ascending to Heart Line (rare): Practical intellect governing emotion, where the individual remains rational yet communicates with conscious empathy and warmth.',
  'Heart to Mind = Emotional vulnerability/heartbreak; Mind to Heart = Rationality with empathy'
);

addCard(
  'warning',
  'LOWER MARS ENEMY LINES (ŚATRU REKHĀ)',
  'Connecting Lines',
  'How can a palmist identify whether a line crossing between Heart and Mind lines is an Enemy Line (Śatru Rekhā)?',
  'Trace the origin back to the Lower Mars plain (near thumb base / Rāhu area).\n\nIf the line emerges from Lower Mars, starts faint, and turns darker as it cuts across the principal lines, it is a classic Śatru Rekhā, signifying external enmity, severe litigation, or family discord.',
  'Origin in Lower Mars crossing principal lines = Śatru Rekhā (enemy line)'
);

// ==========================================
// THEME 7: CLINICAL CASE STUDIES
// Case 1 (Arvind ji's Uncle) & Case 2 (Harishchandra ji's Father)
// ==========================================

addCard(
  'scenario',
  'CASE 1: ARVIND JI\'S UNCLE — HAND TYPE',
  'Case Studies',
  'In Case 1 (Arvind ji\'s uncle, b. 1956, ~70 yrs, retailer), what did his Earthy Hand type reveal about his psychological disposition?',
  'Square palm combined with short fingers defines an Earthy Hand.\n\nPsychological trait: Practical, stubborn, and emotionally introverted. Even during major health crises (bypass in 2017, pacemaker in 2024), he kept his feelings to himself and never shared internal distress.',
  'Earthy hand (square + short fingers) = Stubborn, stoic, emotionally private'
);

addCard(
  'scenario',
  'CASE 1: FATE LINE FROM LIFE LINE',
  'Case Studies',
  'What was indicated by Arvind ji\'s uncle having his Fate Line originate directly out of his Life Line?',
  'A Fate Line emerging from the Life Line indicates career inextricably bound to family duties.\n\nIt proved that he entered the family business from youth and took on the heavy paternal responsibility of supporting and anchoring the joint family.',
  'Fate line emerging from Life line = Family business & paternal responsibility'
);

addCard(
  'scenario',
  'CASE 1: SUN FINGER LONGER THAN JUPITER',
  'Case Studies',
  'What did the finger proportion (Sun finger longer than Jupiter finger) indicate in Case 1?',
  'When the Sun (Apollo) finger exceeds the Jupiter finger, the person insists on living strictly on their own terms.\n\nCombined with a long, set-apart Mercury finger, it gave him the daring courage to take bold investment risks and dispense business advice even to direct trade competitors.',
  'Sun > Jupiter = Independent, lives on own terms, bold commercial initiative'
);

addCard(
  'scenario',
  'CASE 1: TWO SUN LINES JOINED',
  'Case Studies',
  'What did the two joined Sun Lines reveal regarding the timing of public recognition in Case 1?',
  'One clear Sun line joined by a secondary impression demonstrated that fame and local respect did not wait until his 40s or 50s.\n\nHe gained widespread recognition and trust in his community and sector starting from his teenage school and college days.',
  'Joined Sun lines = Prominence and local reputation beginning in teenage years'
);

addCard(
  'scenario',
  'CASE 2: HARISHCHANDRA JI\'S FATHER — LIFE LINE SPLIT',
  'Case Studies',
  'In Case 2 (Harishchandra ji\'s father, age 57, pharmacy owner), how was the parallel line beside his mid-Life line break diagnosed?',
  'The parallel outward line at age ~30 was NOT a supportive sister line; it was an outward EXTENSION of the Life Line.\n\nClinical reading: Represents a major relocation, lifestyle upgrade, or business expansion. The client confirmed that around age 30, his father significantly diversified and launched new commercial enterprises.',
  'Mid-life line break with outward parallel = Business expansion & lifestyle upgrade'
);

addCard(
  'scenario',
  'CASE 2: PARALLEL BRANCH BESIDE FATE LINE AT 50',
  'Case Studies',
  'In Case 2, what event was timed by a parallel line running alongside the Fate Line and joining it around age 50?',
  'The line indicated the launch of a major secondary enterprise alongside his primary pharmacy.\n\nThe teacher accurately timed that around age 50 (7–8 years prior to consultation), he diversified into real estate/property work while maintaining his medicine shop.',
  'Secondary parallel to Fate line joining at 50 = Diversification into property'
);

addCard(
  'scenario',
  'CASE 2: MARS ENEMY LINE CUTTING LIFE LINE',
  'Case Studies',
  'What practical clinical correlation did the teacher provide for an enemy line cutting the Life Line from the Mars side in Case 2?',
  'The teacher noted from decades of consultation experience that an enemy line originating from the inner Mars sector cutting the Life Line frequently signals acute conflict or financial betrayal involving a younger brother or close business partner.',
  'Mars-side cut across Life line = Conflict with younger brother or business partner'
);

addCard(
  'scenario',
  'CASE 2: CROSS AT START OF LIFE LINE',
  'Case Studies',
  'What is the standard clinical interpretation of a cross located at the very start of the Life Line (as seen in Case 2)?',
  'A cross at the commencement of the Life Line indicates severe childhood difficulties, family economic hardship, or poor health during the first 8 to 10 years of life.',
  'Cross at Life line origin = Family struggle/hardship in first 8-10 years'
);

// ==========================================
// QUIZ QUESTIONS (Single, Multiple, True/False, Scenario)
// ==========================================

addQuiz(
  'single',
  'Old Indian Aging Method',
  'easy',
  'In the classical Indian Ṣaḍaṁśa Paddhati (division by 6), what total lifespan is assumed, and into how many equal segments is the Life Line divided?',
  [
    '100 years divided into 10 segments of 10 years each',
    '70 to 72 years divided into 12 segments of 6 years each',
    '98 years divided into 14 segments of 7 years each',
    '84 years divided into 7 segments of 12 years each'
  ],
  1,
  'The Ṣaḍaṁśa Paddhati takes a total age of 70 to 72 years and divides the curved Life Line into 12 equal parts of 6 years each (0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72).',
  'Ṣaḍaṁśa = 70-72 lifespan ÷ 6-year intervals = 12 parts.'
);

addQuiz(
  'true_false',
  'Old Indian Aging Method',
  'medium',
  'Ancient Indian palmists originally used the Heart Line (Hṛdaya Rekhā) as their primary life line because they believed life terminates the moment the heart stops beating.',
  [
    'True',
    'False'
  ],
  0,
  'True. Classical Indian palmists reasoned that life ends when the heart stops functioning, hence they used the Heart Line for longevity. The shift to using the Life Line for timing came later through Western empirical studies.',
  'Ancient Indian masters measured longevity on the Heart Line before the Life Line gained dominance.'
);

addQuiz(
  'single',
  'Cheiro Saptāṁśa Method',
  'easy',
  'What total lifespan and division interval does Cheiro\'s Saptāṁśa Paddhati use along the Life Line?',
  [
    '72 years divided by 6 into 12 parts',
    '98 years divided by 7 into 14 parts',
    '100 years divided by 10 into 10 parts',
    '80 years divided by 4 into 20 parts'
  ],
  1,
  'Cheiro\'s Saptāṁśa Paddhati takes 98 years (approximately 98–100) and divides the line into 14 equal parts of 7 years each (the "table of seven").',
  'Cheiro: 98 years ÷ 7 = 14 equal segments.'
);

addQuiz(
  'single',
  'Cheiro Saptāṁśa Method',
  'medium',
  'What professional rule did Cheiro establish regarding the maximum time limit for making palmistry predictions?',
  [
    'Never predict more than 15 years ahead',
    'Never predict more than 7 years ahead',
    'Always predict up to age 75 regardless of age',
    'Predictions are fixed for an entire lifetime'
  ],
  1,
  'Cheiro strictly instructed never to give predictions more than 7 years ahead (and preferably less) because hand lines continuously transform, strengthen, or fade in response to mental focus and life changes.',
  'Cap predictions at 7 years maximum because palm lines continuously evolve.'
);

addQuiz(
  'multiple',
  'Three-Line Average Method',
  'medium',
  'Which lines are included in the Three-Line Average longevity calculation? (Select all that apply)',
  [
    'Life Line (Jīvana Rekhā)',
    'Heart Line (Hṛdaya Rekhā)',
    'Mind Line (Mastiṣka Rekhā)',
    'Fate Line (Bhāgya Rekhā)',
    'Sun Line (Sūrya Rekhā)'
  ],
  [0, 1, 2],
  'The Three-Line Average calculation sums the estimated lifespans from the Life Line, Heart Line, and Mind Line (each measured on a 100-year theoretical scale) and divides by 3. The Fate Line is deliberately excluded.',
  'Three-line average = (Life + Heart + Mind) ÷ 3. Fate line is excluded.'
);

addQuiz(
  'scenario',
  'Three-Line Average Method',
  'medium',
  'A palmist assesses a hand using the Three-Line Average method. On a 100-year scale, the Life Line ends at 70, the Heart Line ends at 75, and the Mind Line ends at 60. What is the calculated average lifespan?',
  [
    '62 to 64 years',
    '68 to 70 years',
    '75 to 78 years',
    '82 to 85 years'
  ],
  1,
  'Calculation: 70 (Life) + 75 (Heart) + 60 (Mind) = 205. Dividing by 3 gives 205 ÷ 3 = 68.33 years, which is reported as "68 to about 70 years".',
  'Sum estimated lengths on 100-scale and divide by 3: 205 ÷ 3 ≈ 68–70.',
  'Client consultation: Life line terminates at 70%, Heart line at 75%, Mind line at 60%.'
);

addQuiz(
  'single',
  'Current Class Method (Midpoint 30)',
  'easy',
  'In the current method taught in class, what chronological age is fixed at the exact physical midpoint of the Life Line when folded in half?',
  [
    'Age 24',
    'Age 30',
    'Age 35',
    'Age 40'
  ],
  1,
  'In the current class method, folding the paper along the Life Line from origin to wrist establishes the exact center point as age 30 ("fixed").',
  'Exact physical midpoint of Life Line = fixed at age 30.'
);

addQuiz(
  'single',
  'Current Class Method (Midpoint 30)',
  'medium',
  'When aging the Fate Line in the current method, where does the 0-year measurement baseline begin?',
  [
    'At the point where the Fate Line physically appears on the palm',
    'At the wrist line (maṇibandha rekhā), regardless of where the line starts',
    'At the intersection with the Head Line (age 35)',
    'At the Upper Mars mount'
  ],
  1,
  'The Fate Line\'s age is always measured from the maṇibandha rekhā (age 0) up to Saturn Mount (age 75), with the center fold being age 30. Even if the visible line starts higher up, the scale starts from the wrist.',
  'Fate line age measurement always originates at the maṇibandha rekhā.'
);

addQuiz(
  'true_false',
  'Current Class Method (Midpoint 30)',
  'easy',
  'If a client\'s Fate Line is completely faint or invisible, the palmist should abandon aging the Fate Line and calculate all life events on the Life Line.',
  [
    'True',
    'False'
  ],
  0,
  'True. The teacher explicitly instructs that if the Fate Line cannot be clearly seen, do not calculate its age. Instead, observe life events on the Life Line, which provides the most comprehensive timing.',
  'Never guess on invisible Fate Lines; read all life transitions on the Life Line.'
);

addQuiz(
  'single',
  'Heart Line Aging',
  'medium',
  'Under Method A (the preferred Heart Line aging formula), how are the age blocks sequenced starting from the outer palm edge?',
  [
    '10 + 10 + 10 + 10...',
    '18 + 6 + 18 + 6 + 18...',
    '7 + 7 + 7 + 7...',
    '16 + 20 + 14 + 10...'
  ],
  1,
  'Heart Line Method A starts with 18 years from origin, followed by a 6-year gap, then 18 years, then 6 years (18 + 6 + 18 + 6 + 18...) until the line ends.',
  'Heart Line timing formula: 18 (active) + 6 (gap) alternating.'
);

addQuiz(
  'single',
  'Heart Line Aging',
  'medium',
  'Why is Method A (18+6 formula) considered clinically superior to Method B (16/36/50 finger landmarks) on the Heart Line?',
  [
    'Because Method B requires complex astrological chart conversions',
    'Because Heart Line data and event markers are rarely identifiable beyond age 50',
    'Because Method A was invented by Parāśara Muni',
    'Because Method B only works on left hands'
  ],
  1,
  'The teacher explains that Method A is better because you generally find legible Heart Line event data only up to about age 50; beyond age 50, distinct markers are rarely found.',
  'Method A provides precise early-to-midlife timing where Heart Line data is most active.'
);

addQuiz(
  'single',
  'Mercury Line (Budha Rekhā)',
  'easy',
  'What is the clinical consensus regarding the presence versus absence of the Mercury Line (Health/Liver Line)?',
  [
    'The line is essential; anyone lacking it suffers from severe physical debility',
    'It is beneficial if the line is absent; having it indicates digestive and liver vulnerability',
    'The line only appears in hands of billionaires and has no health connection',
    'The line indicates heart valve defects exclusively'
  ],
  1,
  'The teacher emphasizes that the Mercury Line is not present in every hand — and "it is good that it is not": having it indicates health problems, particularly liver and digestive sensitivities.',
  'Absence of Mercury line = robust constitution; Presence = digestive/liver caution.'
);

addQuiz(
  'single',
  'Mercury Line (Budha Rekhā)',
  'medium',
  'What is the critical difference between a Mercury Line starting BELOW the Heart Line versus one starting strictly ABOVE the Heart Line?',
  [
    'Below Heart Line = foreign travel; Above Heart Line = domestic property',
    'Below Heart Line = chronic health/liver issues; Above Heart Line = healer line & late business success',
    'Below Heart Line = artistic fame; Above Heart Line = severe criminal litigation',
    'Below Heart Line = sudden windfall; Above Heart Line = poverty'
  ],
  1,
  'Starting below Heart Line indicates chronic health and liver difficulties. Starting strictly above Heart Line indicates late business acumen and forms the "Healer Line" seen in doctors, therapists, and counsellors.',
  'Below Heart line = health problems; Above Heart line only = healer line & business success.'
);

addQuiz(
  'single',
  'Mercury Line (Budha Rekhā)',
  'medium',
  'Why is a Mercury Line located high on the Mercury Mount associated with doctors, therapists, and counsellors (Healer Line)?',
  [
    'Because Mercury rules surgical steel and bone marrow',
    'Because Mercury governs speech (vāṇī), granting the power to heal and comfort through words',
    'Because Mercury controls physical blood pressure and circulation',
    'Because Mercury indicates inheritance from maternal uncles'
  ],
  1,
  'Mercury represents speech (vāṇī). A strong healer line high on Mercury Mount indicates individuals whose spoken words soothe anxiety, uplift the spirit, and remove distress.',
  'Mercury rules speech (vāṇī): the Healer Line heals through restorative communication.'
);

addQuiz(
  'single',
  'Intuition Line',
  'easy',
  'Where does the classic Intuition Line (pūrvābhāsa) originate and terminate?',
  [
    'Starts on Venus Mount and goes to Jupiter Mount',
    'Starts on Moon Mount and goes to Mercury Mount',
    'Starts on Saturn Mount and goes to Sun Mount',
    'Starts at the thumb tip and goes to Mars Mount'
  ],
  1,
  'A line originating on the Mount of Moon and traveling toward the Mount of Mercury is the classic Intuition Line, granting premonition (pūrvābhāsa).',
  'Moon Mount to Mercury Mount = Intuition line.'
);

addQuiz(
  'single',
  'Mercury Mount Signs',
  'medium',
  'How is a Star on the Mercury Mount interpreted, contrasting with its usual effect on other mounts?',
  [
    'Extremely destructive, causing paralysis',
    'Auspicious, indicating eloquent speech, inventive research talent, and sharp communication',
    'A sign of sudden bankruptcy and loss of speech',
    'Neutral, having no effect on Mercury'
  ],
  1,
  'While a star is considered inauspicious on most mounts, on the Mercury Mount it is regarded favorably, indicating a clever speaker, deep researcher, and persuasive orator.',
  'Star on Mercury = Clever speaker, researcher, and eloquent orator.'
);

addQuiz(
  'single',
  'Mercury Mount Signs',
  'medium',
  'What does a Cross on the Mount of Mercury specifically disrupt?',
  [
    'Long-distance foreign air travel',
    'Business partnerships and the Marriage Line (Vivāha Rekhā)',
    'Spinal column and bone density',
    'Agricultural land acquisition'
  ],
  1,
  'A cross on Mercury Mount is inauspicious, causing severe disputes in business partnerships and disruption to the Marriage Line.',
  'Cross on Mercury = Partnership disputes & marriage discord.'
);

addQuiz(
  'single',
  'Mercury Mount Signs',
  'hard',
  'How does a Circle differ from a solid Mole (Til) on the Mount of Mercury?',
  [
    'Circle causes blindness; Mole grants psychic visions',
    'Circle (with skin showing in center) protects from illness; Mole causes severe loss of honour and public reputation',
    'Circle signifies poverty; Mole signifies immense ancestral wealth',
    'Both produce identical negative effects'
  ],
  1,
  'A true circle (with skin visible in the middle) is a protective formation that shields against illness. A solid black mole (til) is severely damaging, causing humiliation and loss of public honour (mān-sammāna).',
  'Circle = Protective shield against disease; Mole = Loss of honour/reputation.'
);

addQuiz(
  'multiple',
  'Mercury Mount Signs',
  'medium',
  'Which of the following conditions are required to classify a formation on the Mercury Mount as an active Jālī (Grille)? (Select all that apply)',
  [
    'At least three clear vertical lines',
    'At least three clear horizontal lines',
    'Vertical and horizontal lines of equal prominence',
    'A single vertical line cut by one diagonal line',
    'Must be located on the third phalange of the thumb'
  ],
  [0, 1, 2],
  'A true Jālī on Mercury requires at least 3 vertical and 3 horizontal lines intersecting with equal strength. If horizontal lines are light or fewer than 3, it is not a fully formed jālī.',
  'Active Jālī requires at least 3×3 equally prominent intersecting lines.'
);

addQuiz(
  'single',
  'Wealth Signs on Mercury',
  'medium',
  'What does a SINGLE standalone vertical line on the Mount of Mercury signify?',
  [
    'Chronic bronchitis and lung disease',
    'Sudden monetary gain and financial windfall',
    'Severe dispute with government authorities',
    'Renunciation of family life'
  ],
  1,
  'A single standalone straight vertical line on the Mercury Mount indicates sudden money gain. If there are multiple vertical lines, they transform into healing lines.',
  'Single vertical line on Mercury = Sudden unexpected financial windfall.'
);

addQuiz(
  'multiple',
  'Wealth Signs on Mercury',
  'medium',
  'Which three lines form the "Dhana kī Koṭhī" (Money Treasury Triangle)? (Select all that apply)',
  [
    'Fate Line (Bhāgya Rekhā)',
    'Head/Mind Line (Mastiṣka Rekhā)',
    'Mercury Line (Budha Rekhā / Health Line)',
    'Girdle of Venus',
    'Heart Line'
  ],
  [0, 1, 2],
  'The Money Treasury Triangle (Dhana kī Koṭhī) is formed by the intersection of the Fate Line, Mind Line, and Mercury Line. A clean triangle preserves savings; internal cross lines cause expenses to exceed earnings.',
  'Money Triangle = Fate Line + Mind Line + Mercury Line.'
);

addQuiz(
  'single',
  'Marriage Line Afflictions',
  'hard',
  'If a Marriage Line extends across the upper palm and cuts through the Sun Line (Sūrya Rekhā), what does it indicate?',
  [
    'A royal marriage with a foreign dignitary',
    'Severe loss of honour, public disgrace, or financial ruin caused by a wife or female relative',
    'Sudden rise in political power after marriage',
    'Birth of twin sons'
  ],
  1,
  'When a marriage line cuts past its normal boundary and slices through the Sun Line, it portends acute humiliation, public scandal, or financial ruin caused by a wife or another woman in the household.',
  'Marriage line cutting Sun line = Public scandal and ruin through a woman.'
);

addQuiz(
  'single',
  'Connecting Lines',
  'medium',
  'When a line runs from the Heart Line down to the Mind Line, what psychological tendency does it create?',
  [
    'Emotional heartbreak, family distress, and emotions overpowering logical reasoning',
    'Absolute cold, unfeeling mathematical genius',
    'Extreme athletic aggression',
    'Total loss of memory'
  ],
  0,
  'A branch running from Heart down to Mind indicates emotional vulnerability, heartbreak, and personal or family distress distorting clear, rational decision-making.',
  'Heart descending to Mind = Emotional vulnerability and heartbreak clouding judgment.'
);

addQuiz(
  'single',
  'Connecting Lines',
  'hard',
  'What is indicated when a line originates in the Lower Mars plain (near thumb) and cuts across the principal lines toward the upper palm?',
  [
    'A divine blessing line granting instant spiritual enlightenment',
    'An Enemy Line (Śatru Rekhā) that causes severe disruption and conflict',
    'A royal insignia indicating government honors',
    'A travel line indicating oceanic voyages'
  ],
  1,
  'Lines rising from Lower Mars and cutting principal lines are classified as Enemy Lines (Śatru Rekhā); they bring active enmity, legal hurdles, and domestic disruptions.',
  'Line from Lower Mars crossing principal lines = Śatru Rekhā (enemy line).'
);

addQuiz(
  'scenario',
  'Case Studies',
  'medium',
  'In Case 1 (Arvind ji\'s uncle, b. 1956, ~70 yrs), his palm was square with short fingers, defining an Earthy Hand. How did this manifest during his major heart bypass (2017) and pacemaker (2024) surgeries?',
  [
    'He panicked publicly and sought constant emotional reassurance from everyone',
    'He remained stubborn, stoic, kept his emotions to himself, and refused to share his pain',
    'He immediately gave away all his business assets and retired to the forest',
    'He became excessively talkative and emotional'
  ],
  1,
  'Earthy hands (square palm + short fingers) produce practical, stubborn individuals who endure hardship in silence. Despite major bypass surgery and a pacemaker, he kept his suffering completely to himself.',
  'Earthy hand = Stoic, stubborn, deeply private with emotions.',
  'Case 1: Retailer uncle with square palm, short fingers, bypass surgery in 2017, pacemaker in 2024.'
);

addQuiz(
  'scenario',
  'Case Studies',
  'medium',
  'In Case 1, the client\'s Fate Line originated directly out of his Life Line. What verified biographical fact did this explain?',
  [
    'He lived in a foreign country for 40 years',
    'He joined the family retail business and took on heavy paternal family responsibility',
    'He won a government lottery at age 18',
    'He had no career until after age 60'
  ],
  1,
  'A Fate Line growing out of the Life Line ties career directly to family duties. Arvind ji confirmed that his uncle joined the family shop early in life and functioned as a pillar of paternal responsibility.',
  'Fate Line emerging from Life Line = Family business and paternal duty.',
  'Case 1: Retail shop owner whose career line is joined to the life line at origin.'
);

addQuiz(
  'scenario',
  'Case Studies',
  'hard',
  'In Case 1, Arvind ji\'s uncle had a Sun finger longer than his Jupiter finger, along with a long, set-apart Mercury finger and a Healer Line. How did this manifest in his retail trade?',
  [
    'He was timid and followed all conventional trade union rules strictly',
    'He lived on his own terms, took bold investment risks, and generously gave profitable advice even to competitors',
    'He closed his shop and refused to talk to customers',
    'He only invested in government bonds'
  ],
  1,
  'Sun finger > Jupiter gave independence; separated Mercury gave bold commercial audacity; the Healer Line gave influential vāṇī. He boldly advised customers and competitors alike on investments.',
  'Sun > Jupiter + strong Mercury = Bold independence and advisory gift.',
  'Case 1: Retailer who advises competitors despite his nephew\'s warnings.'
);

addQuiz(
  'scenario',
  'Case Studies',
  'hard',
  'In Case 2 (Harishchandra ji\'s father, age 57, pharmacy owner), his Life Line stopped at age ~30, and a parallel line continued outward beside it. How did the teacher correctly diagnose this formation?',
  [
    'As imminent physical death narrowly averted by a miracle',
    'As an outward extension representing a major business expansion, relocation, or lifestyle upgrade around age 30',
    'As an inauspicious break causing permanent paralysis',
    'As a monastic initiation into sannyāsa'
  ],
  1,
  'The teacher clarified that the parallel line was not a sister line or fatal break, but an outward extension of the Life Line. It marked a major expansion where the father opened multiple new commercial enterprises around age 30.',
  'Outward parallel continuation of Life Line = Business expansion and lifestyle upgrade.',
  'Case 2: 57-year-old pharmacist whose Life Line stops at 30 and continues outward in parallel.'
);

addQuiz(
  'scenario',
  'Case Studies',
  'medium',
  'In Case 2, the teacher noticed a secondary line running beside the Fate Line and merging into it around age 50. What verified life event corresponded to this timing?',
  [
    'He sold his pharmacy and retired',
    'Around age 50 (7–8 years ago), he diversified into a secondary property business alongside his medicine shop',
    'He migrated to Canada permanently',
    'He experienced a sudden loss of speech'
  ],
  1,
  'The teacher correctly dated that around age 50, he undertook a secondary line of work. The son confirmed his father started a real estate/property business alongside his existing pharmacy.',
  'Parallel branch joining Fate line at 50 = Diversification into property business.',
  'Case 2: Pharmacist who added real estate business 7-8 years prior (at age ~50).'
);

addQuiz(
  'scenario',
  'Case Studies',
  'medium',
  'In Case 2, an enemy line cut through the Life Line from the Mars sector. Based on clinical experience, what specific interpersonal conflict did the teacher associate with this cut?',
  [
    'Conflict or financial friction with a younger brother or business partner',
    'Dispute with a foreign university professor',
    'A robbery by unknown bandits',
    'Conflict with maternal grandparents'
  ],
  0,
  'The teacher shared from direct practical consultation experience that a Mars-side line cutting the Life Line often indicates severe conflict or betrayal involving a younger brother or close business partner.',
  'Mars-side enemy cut = Conflict with younger brother or partner.',
  'Case 2: Pharmacy owner with horizontal Mars line slicing across the Life Line.'
);

addQuiz(
  'single',
  'Mind Line Aging',
  'medium',
  'Why do master palmists avoid doing separate age calculations on the Mind Line (Mastiṣka Rekhā)?',
  [
    'Because the Mind Line moves backwards in time',
    'Because the Life Line provides the most comprehensive and clinically accurate timing for life events',
    'Because the Mind Line disappears after age 40 in most hands',
    'Because ancient texts forbid measuring intellectual capacity'
  ],
  1,
  'The teacher states that aging is generally not calculated on the Mind Line because all primary life timing is best obtained on the Life Line. The Life Line remains the benchmark for physical and psychological milestones.',
  'Default all primary timing to the Life Line; Mind Line is rarely timed separately.'
);

addQuiz(
  'true_false',
  'Intuition Line',
  'easy',
  'If a client does not possess a visible Intuition Line from Moon to Mercury, the palmist must conclude the client has no intuitive or psychic capability.',
  [
    'True',
    'False'
  ],
  1,
  'False. The teacher explicitly emphasizes that clients lacking a Moon-to-Mercury intuition line can still possess powerful intuition through other markers (such as the Mystic Cross or Solomon Ring).',
  'Never deny intuition solely based on the absence of a dedicated intuition line.'
);

addQuiz(
  'single',
  'Current Class Method (Midpoint 30)',
  'medium',
  'In the current class method, after establishing age 30 at the Life Line midpoint, what is taken as the baseline average age for the end of the line before iterative halving?',
  [
    'Age 60',
    'Age 70 to 75',
    'Age 98',
    'Age 120'
  ],
  1,
  'The second half of the Life Line runs from age 30 to approximately 75 (adjusted to 70–75 in India by deśa-kāla), which is then subdivided by successive halving.',
  'Second half of Life Line spans from age 30 to ~75.'
);

// ==========================================
// OUTPUT COMPILATION
// ==========================================

const outputContent = `import { CuratedDeck } from '@/lib/learningTypes';

export const lecture27Deck: CuratedDeck = {
  lectureId: '${NOTE_ID}',
  lectureTitle: '${NOTE_TITLE}',
  summary: 'Comprehensive mastery deck for Lecture 27 covering classical aging methods (Ṣaḍaṁśa division by 6, Cheiro Saptāṁśa division by 7, Three-Line Average), the current 30-midpoint method, 18+6 Heart/Mind line formulas, Budha Rekhā (Mercury/Health/Liver line, Healer line, Intuition line), Mercury Mount signs (Star, Cross, Circle, Grille, Money Triangle), and detailed clinical case studies (Arvind ji\\'s uncle & Harishchandra ji\\'s father).',
  flashcards: ${JSON.stringify(flashcards, null, 2)},
  quizzes: ${JSON.stringify(quizzes, null, 2)},
};
`;

const outputPath = path.join(__dirname, '../src/data/learning/27-aging-mercury-line.ts');
fs.writeFileSync(outputPath, outputContent, 'utf8');

console.log('Successfully compiled for Note 27:');
console.log(`- ${flashcards.length} High-Yield Flashcards (100% Unique)`);
console.log(`- ${quizzes.length} Comprehensive Quiz Questions (100% Unique)`);
console.log(`Written deck to: ${outputPath}`);
