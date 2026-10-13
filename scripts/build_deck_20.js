const fs = require('fs');
const path = require('path');

// Lecture 20: Signs & Symbols and Jīvana Rekhā (Life Line) – Part 02
// Comprehensive High-Yield Learning Deck Builder
// Generates 130+ Flashcards and 130+ Quiz Questions (Single, Multiple, True/False, Scenario)

console.log('Building Lecture 20 high-yield Learning Deck...');

const flashcards = [];
const quizzes = [];

const NOTE_ID = '20 - Symbols & Life Line - Part 02.md';
const NOTE_TITLE = 'Signs & Symbols and Jīvana Rekhā (Life Line) – Part 02';

function addCard(category, tag, subtopic, front, back, tip) {
  flashcards.push({
    id: `sym2-life-fc-${flashcards.length + 1}`,
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
    id: `sym2-life-qz-${quizzes.length + 1}`,
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
// THEME 1: TRIANGLE (TRIKOṆA) RULES & ASSETS
// ==========================================

addCard(
  'symbol',
  'TRIANGLE RARITY & PLACEMENT',
  'Triangles & Assets',
  'Where is the Triangle sign mostly found on the palm, and how common is it?',
  'The Triangle is seen mostly on the Life Line (Jīvana Rekhā) and the Fate Line (Bhāgya Rekhā).\n\nIt is considered a RARE and very auspicious sign, seen in only one or two hands out of many (e.g. Arvind ji\'s hand).',
  'Rare sign — seen primarily on Life and Fate lines'
);

addCard(
  'rule',
  'TRIANGLE CORE MEANINGS',
  'Triangles & Assets',
  'What two primary life events does a Triangle on the Life Line indicate at that age?',
  '1. PROGRESS (taraqqī): Significant progress and life becoming distinctly better than before during that time period.\n2. ASSETS / PROPERTY: Creation of a self-made property, fixed asset, or major capital investment.',
  'Triangle = Progress + Property / Fixed Asset'
);

addCard(
  'rule',
  'TRIANGLE SIZE CORRELATION',
  'Triangles & Assets',
  'How does the size of a Triangle affect its interpretation on the Life Line?',
  '1. Asset Magnitude: The bigger the triangle, the larger and more substantial the asset/property.\n2. Time Span / Gestation: A larger triangle also indicates that building/paying off the property takes a longer duration (e.g., long loan repayment, extended construction, or time to move in).',
  'Bigger triangle = Bigger asset + longer gestation period'
);

addCard(
  'contrast',
  'OUTER VS INNER TRIANGLE',
  'Triangles & Assets',
  'What is the vital difference between a Triangle on the OUTER side vs INNER side of the Life Line?',
  '• Outer-side Triangle: Represents a clean asset, outward progress, financial growth, and comfortable appreciation.\n• Inner-side Triangle: Still an asset, but becomes a LIABILITY / BURDEN (e.g., heavy home loan, maintaining a distant property, costly boundary walls, or property far from residence requiring maintenance).',
  'Outer = Clean asset; Inner = Burdened asset / liability'
);

addCard(
  'symbol',
  'PALM MONEY TRIANGLE',
  'Triangles & Assets',
  'Which three lines form the Money Triangle (Dhana Trikoṇa / Dhana kī Koṭhī) in the center of the palm, and what does it signify?',
  'Formed by three lines: the Head Line (Mind Line), Fate Line, and Mercury Line in the central Rāhu area.\n\nWhen clean, unbroken, and well-enclosed, it acts as a treasury vault indicating accumulation of wealth, savings, and financial retention capacity.',
  'Head Line + Fate Line + Mercury Line in Rāhu plain = Money Triangle (Dhana kī Koṭhī)'
);

addCard(
  'warning',
  'GREAT TRIANGLE CONTAMINANTS',
  'Triangles & Assets',
  'What defects or color signs reduce the auspiciousness of the Great Palm Triangle in the Rāhu area?',
  '1. Internal Defects: An island or multiple criss-crossing lines inside the triangle severely degrade its financial strength.\n2. Unfavorable Colors: Deep blue, black, yellow, or pale light blue coloring in the Rāhu depression indicates debt, digestive issues, or financial distress.',
  'Clean center required — avoid islands, cuts, and blue/black tint'
);

addCard(
  'rule',
  'TRIANGLE JOINING FATE LINE',
  'Triangles & Assets',
  'What does it indicate when a triangle forms where a line leaves the Fate Line and joins the Life Line?',
  '1. Career Expansion: An outward branching joining Fate Line indicates career expansion, new ventures, a second branch, or expanding outside one\'s hometown.\n2. Family Support: Wherever Fate and Life lines connect, work progresses through family/father support, ancestral property, or paternal recommendations.',
  'Fate-Life connection = Career expansion backed by family support'
);

addCard(
  'rule',
  'DUAL AGE READING ON CONNECTIONS',
  'Triangles & Assets',
  'When a triangle connects the Life Line and the Fate Line, how is timing calculated?',
  'Two different age scales must be consulted simultaneously:\n• Life Line scale: Reveals the native\'s personal biological and family age.\n• Fate Line scale: Reveals the professional/career milestone age.\nBecause both lines have distinct origins, the palmist cross-references both timings.',
  'Life Line = Personal age; Fate Line = Career milestone timing'
);

// ==========================================
// THEME 2: TRIDENT (TRIŚŪLA) & NET/GRILLE (JĀLĪ)
// ==========================================

addCard(
  'rule',
  'TRIDENT PLACEMENT MANDATE',
  'Trident & Net',
  'Where MUST a Trident (Triśūla) form to be recognized, and where does it NOT count?',
  'A Trident must form AT THE TERMINUS (END) of a line.\n\nIt does NOT count at the origin of a line (e.g. low at the base of the Fate Line near the wrist). A genuine trident sits at the top end of the line (e.g., top of the Sun or Fate Line).',
  'Trident must form at the line\'s terminus, never at its root'
);

addCard(
  'warning',
  'BRANCH VS TRIDENT TRAP',
  'Trident & Net',
  'Why is a branch or turning line often falsely mistaken for a Trident?',
  'A simple fork, deflection, or single side-branch off a line (such as the Sun line) is NOT a trident.\n\nA true trident is an independent, distinct three-pronged formation resting symmetrically atop the stem.',
  'Single fork/turn ≠ Trident; Must be true 3-pronged crown'
);

addCard(
  'symbol',
  'TRIDENT EFFECT ON SUN LINE',
  'Trident & Net',
  'What effect does a true Trident have when situated at the top of the Sun Line?',
  'It exponentially amplifies that line\'s qualities — bringing elevated renown, high status, exceptional public respect, artistic/governmental triumph, and multiplying the Sun Line\'s positive yield.',
  'Terminus Trident = Multiplier of line\'s peak qualities'
);

addCard(
  'rule',
  'NET / GRILLE (JĀLĪ) DEFINITION',
  'Trident & Net',
  'What constitutes an authentic Net/Grille (Jālī) in Vedic palmistry?',
  'A Jālī is a dense lattice of intersecting vertical and horizontal lines.\n\nMandatory criteria:\n1. At least 3 vertical AND 3 horizontal lines.\n2. Both horizontal and vertical lines must be equally prominent and dark.',
  '≥ 3 vertical + ≥ 3 horizontal equally deep lines = True Jālī'
);

addCard(
  'warning',
  'ASYMMETRIC NET RULE',
  'Trident & Net',
  'Does an asymmetric grid (dark vertical lines but faint horizontal lines) count as a severe Jālī?',
  'No. If vertical lines are prominent while horizontal lines are faint and light, it is NOT classified as a true debilitating Jālī and will not deliver severe misfortune.',
  'Equally balanced darkness is mandatory to constitute a malicious Jālī'
);

addCard(
  'trait',
  'JĀLĪ ON VENUS MOUNT',
  'Trident & Net',
  'Where is the Jālī found most frequently, and what specific afflictions does it trigger there?',
  'It is seen most frequently on the Venus Mount (Śukra Parvat).\n\nSince Venus governs relationships, vitality, and family, a Jālī here triggers:\n• Chronic anxiety & mental unrest\n• Friction and turmoil in married life\n• Difficulties in childbirth or reproductive health\n• General misfortune (durbhāgya).',
  'Venus Jālī = Marital discord, childbirth troubles, high anxiety'
);

// ==========================================
// THEME 3: FISH (MATSYA) SIGN
// ==========================================

addCard(
  'symbol',
  'FISH SIGN PRIME LOCATION',
  'Fish Sign',
  'Where is the Fish (Matsya) sign located in 90% of hands?',
  'In 90% of instances, it appears in the KETU AREA — specifically at the terminus of the Life Line and the start of the Fate Line near the wrist.',
  '90% on Ketu mount / terminus of Life Line'
);

addCard(
  'trait',
  'FISH SIGN PRIMARY GIFTS',
  'Fish Sign',
  'What are the core qualities bestowed by an authentic Fish sign on Ketu?',
  '1. High Spiritual Growth: Deep inclination toward esoteric wisdom, enlightenment, and dharma.\n2. Researcher Mindset: Makes the native a profound researcher, investigator, or occult scholar.\n3. Power, Name & Respect: Elevated dignity and noble reputation.',
  'Spiritual depth + Research mastery + Honorable name'
);

addCard(
  'warning',
  'FISH SIGN WEALTH PARADOX',
  'Fish Sign',
  'What is the famous "Money Paradox" of the Fish sign emphasized by the teacher?',
  'THE FISH SIGN DOES NOT DIRECTLY BESTOW LIQUID MONEY OR WEALTH.\n\nIt gives high spiritual ascent, scholarly depth, and profound research acumen, but clients expecting immediate cash windfalls from a fish sign are mistaken.',
  'Fish = Spiritual & research power, NOT raw liquid cash'
);

addCard(
  'contrast',
  'FISH VS ISLAND ON KETU',
  'Fish Sign',
  'How do you distinguish a genuine Fish sign from an Island on the Ketu area?',
  '• Island: An enclosed, hollow oval/elliptic deformity directly within a line indicating energy leakage or illness.\n• Fish: Has a distinct pointed body with extending tail fins/prongs forming an auspicious independent ichthyic geometry.',
  'Island = Elliptic energy defect; Fish = Pointed body with tail prongs'
);

addCard(
  'rule',
  'INCOMPLETE FISH MATURATION',
  'Fish Sign',
  'What did the teacher observe in Dravin ji\'s hand regarding an incomplete Fish sign?',
  'The fish formation was about to form but not yet fully sealed.\n\nThe teacher noted that lines evolve with karma and mental discipline — if the native actively pursues spiritual practice and focused research, the sign completes itself.',
  'Unsealed signs can complete through conscious spiritual effort'
);

// ==========================================
// THEME 4: JUPITER MOUNT SIGNS & FEATURES
// ==========================================

addCard(
  'symbol',
  'RING OF SOLOMON',
  'Jupiter Mount Signs',
  'What is the Ring of Solomon, where does it sit, and what does it indicate?',
  'A semi-circular curving line on the Jupiter Mount that starts on Jupiter itself and sweeps toward the thumb side.\n\nSignificance: Exceptional intuition, keen 6th sense, profound analytical intellect, psychic insights, and innate healing gifts (named after King Solomon).',
  'Curving semi-circle on Jupiter = 6th sense, healing & intuition'
);

addCard(
  'warning',
  'RING OF SOLOMON BOUNDARY TRAP',
  'Jupiter Mount Signs',
  'What false line between fingers must NOT be mistaken for the Ring of Solomon?',
  'A line that starts between the index and middle fingers (Saturn finger side) and curls downward is NOT a Ring of Solomon.\n\nA true Ring of Solomon MUST originate entirely upon the Jupiter mount itself and wrap toward the thumb perimeter.',
  'Must start on Jupiter mount itself, not from Saturn inter-finger cleft'
);

addCard(
  'symbol',
  'LINE OF SYMPATHY',
  'Jupiter Mount Signs',
  'What is the Line of Sympathy, and how does it differ visually from the Ring of Solomon?',
  '• Visual form: A straight, diagonal line (not a curve and not a cross) across the Jupiter Mount.\n• Trait: Denotes deeply compassionate, kind (dayālu) individuals with universal empathy, unconditional love, and zero prejudice or discrimination.',
  'Straight diagonal on Jupiter = Universal kindness & empathy'
);

addCard(
  'symbol',
  'TEACHER SQUARE ON JUPITER',
  'Jupiter Mount Signs',
  'What is the "Teacher Square" on the Jupiter Mount?',
  'A square appearing on the Jupiter Mount.\n\nIt imparts an innate pedagogical instinct — the natural capacity and compulsion to teach, counsel, guide, and impart wisdom to others, even if teaching is not their formal job.',
  'Square on Jupiter = Teacher Square (innate wisdom educator)'
);

addCard(
  'symbol',
  'TRIANGLE ON JUPITER',
  'Jupiter Mount Signs',
  'What is the meaning of a Triangle on the Jupiter Mount?',
  'Very auspicious sign of elevated intellect, statecraft, and wisdom. It indicates independent philosophical thinking and a lifelong passion for higher education, often studying into advanced mature ages.',
  'Triangle on Jupiter = High wisdom + studying into advanced age'
);

addCard(
  'rule',
  'CROSS ON JUPITER EXCEPTION',
  'Jupiter Mount Signs',
  'Why is a Cross on the Jupiter Mount a world-famous exception in palmistry?',
  'While crosses anywhere else on the palm signify obstacles or misfortune, Jupiter Mount is the SOLE POSITIVE EXCEPTION.\n• Female hand: Acts as a protective shield saving married life from destruction.\n• Male hand: Brings an affectionate, harmonious family life.',
  'Cross on Jupiter = Sole positive cross (protects marriage & family)'
);

// ==========================================
// THEME 5: LIFE LINE TRAJECTORY & NUANCES
// ==========================================

addCard(
  'symbol',
  'AMBITION LINE DEFINITION',
  'Life Line Trajectory',
  'What is an Ambition Line on the Life Line, and where can it start?',
  'A distinct upward line rising from the Life Line directly toward the Jupiter Mount.\n\nIt has NO FIXED STARTING POINT — it can branch off from anywhere along the Life Line at any age, indicating ambitious leaps whenever it emerges.',
  'Upward branch to Jupiter = Goal-oriented Ambition Line'
);

addCard(
  'trait',
  'CHILDHOOD AMBITION LINE',
  'Life Line Trajectory',
  'What does an Ambition Line present right from childhood signify?',
  'The native possesses expansive aspirations, high goals, and a drive to "do something big" from early school days, rather than passively following parental scripts.\n\nOften supported by father/family (Venus & Pitṛ Rekhā connection).',
  'Early ambition line = Independent big thinker from childhood'
);

addCard(
  'rule',
  'HIGH START FROM JUPITER',
  'Life Line Trajectory',
  'What does a Life Line starting exceptionally high on the Jupiter Mount indicate?',
  '1. Scholarly/Spiritual Childhood: Early home atmosphere steeped in education, culture, and spirituality.\n2. High Comfort & Ease: Broadens the Venus arc significantly, granting abundant worldly comforts and dignity from childhood.',
  'High start on Jupiter = Spiritual/scholarly home + early comfort'
);

addCard(
  'contrast',
  'LOW START VS HIGH START',
  'Life Line Trajectory',
  'What is the consequence of a low starting point of the Life Line near the thumb web?',
  'A low start compresses the Venus Mount radius, leading to a restricted comfort zone, early hardship, limited material luxuries, and a life of constant manual or emotional effort.',
  'Low start = Narrow Venus arc + lower comfort level'
);

addCard(
  'trait',
  'WAVY LIFE LINE (UP-AND-DOWN)',
  'Life Line Trajectory',
  'What does a wavy Life Line that repeatedly shifts inward and outward indicate?',
  'A roller-coaster life of continuous ups and downs.\n• Turning inward toward Venus = phases of personal struggle, confinement, or pressure.\n• Turning outward away from Venus = phases of relief, freedom, and expansive fortune.',
  'Inward wave = struggle; Outward wave = expansion/relief'
);

addCard(
  'warning',
  'BLEEDING LINE QUALITY',
  'Life Line Trajectory',
  'What is a "Bleeding Line" (very thick, blackish Life Line), and what is its prognosis?',
  'A bleeding line is excessively broad, dark, congested, and coarse.\n\nPrognosis: Does not necessarily mean lack of basic food/clothes, but PRECLUDES A COMFORTABLE, PEACEFUL LIFE. Every day feels like an uphill struggle or friction.',
  'Bleeding line = Chronic stress, daily challenge, lack of ease'
);

addCard(
  'rule',
  'CHILDHOOD CHAINS AT ORIGIN',
  'Life Line Trajectory',
  'Why do clusters and chains frequently appear at the commencement of the Life Line?',
  'Chains at ages 0–15 reflect childhood frailty, low immunity, and early stress (pressure of rigorous studies, hostel living, boarding school separation from parents).\n\nIf chains persist down the line, chronic health struggles follow.',
  'Origin chains = Childhood immunity dips, school/hostel strain'
);

addCard(
  'rule',
  'OUTWARD BRANCH AT CHILDHOOD ORIGIN',
  'Life Line Trajectory',
  'What does a clean outward branch emerging from the childhood origin of the Life Line signify?',
  'Educational expansion at a young age — such as attending specialized tuitions, taking online certifications, or relocating to a prestigious hostel/institution away from home.',
  'Outward branch at origin = Academic relocation/tuition expansion'
);

// ==========================================
// THEME 6: SUPPORTIVE VS PARASITE LINES
// ==========================================

addCard(
  'contrast',
  'SUPPORTIVE VS PARASITE LINE SPACING',
  'Supportive vs Parasite Lines',
  'How do you differentiate a Supportive Line from a Parasite Line by physical placement?',
  '• Supportive Line: Runs inside Venus parallel to the Life Line at a DISTINCT, COMFORTABLE DISTANCE.\n• Parasite Line: An extremely fine, faint, hairline crease glued ALMOST ADJACENT to the Life Line without clear breathing space.',
  'Supportive = Distinct parallel gap; Parasite = Super-glued fine hairline'
);

addCard(
  'trait',
  'PARASITE LINE ESSENCE',
  'Supportive vs Parasite Lines',
  'What is the fundamental nature and effect of a Parasite Line?',
  'Like a parasite that hollows out its host from within, it represents an inescapable ongoing liability, person, or situation that persistently drains your vitality, peace, and money for the entire length it travels.',
  'Parasite line = Unrelenting chronic burden that hollows you from within'
);

addCard(
  'contrast',
  'INWARD VS OUTWARD PARASITE LINE',
  'Supportive vs Parasite Lines',
  'How does an INWARD Parasite Line differ from an OUTWARD Parasite Line in source of trouble?',
  '• Inward Parasite (toward Venus): Arises from DOMESTIC / FAMILY burdens — dependent relatives, caring for an ailing parent, or supporting a divorced sibling living permanently at home.\n• Outward Parasite (toward palm center): Arises from EXTERNAL circumstances — grueling home mortgage, toxic workplace demands, or malicious neighbors.',
  'Inward = Family/domestic burden; Outward = Mortgage/workplace stress'
);

addCard(
  'rule',
  'PARASITE LINE WITH PROPERTY TRIANGLE',
  'Supportive vs Parasite Lines',
  'How do you read a hand that has BOTH a Property Triangle and an Inward Parasite Line?',
  'The native acquires an asset or builds a house, but it comes accompanied by an intense ongoing burden — such as suffocating loan installments or family conflicts over the asset.',
  'Asset created, but carries intense long-term financial/family strain'
);

// ==========================================
// THEME 7: ISLANDS & BANDHANA YOGA
// ==========================================

addCard(
  'warning',
  'ISLAND PLACEMENT RULE',
  'Islands & Bandhana',
  'Where can Islands form on the hand, and where can they NEVER form?',
  'Islands form EXCLUSIVELY ON LINES (rekhā).\n\nThey CANNOT form on open mounts. They appear most frequently on the Heart and Head lines because emotional and cognitive stress impact those faculties most severely.',
  'Islands occur on lines only — never on flat mounts'
);

addCard(
  'rule',
  'ISLAND DURATION RULE',
  'Islands & Bandhana',
  'What governs the duration of hardship indicated by an Island on the Life Line?',
  'The physical length of the island: A tiny island indicates acute temporary illness/setback; a long spanning island indicates chronic, decade-long health or vitality drains.',
  'Island length directly mirrors hardship duration'
);

addCard(
  'trait',
  'HEAD LINE BUFFER ON ISLANDS',
  'Islands & Bandhana',
  'How does the quality of the Head Line determine how a client handles a long Island on the Life Line?',
  '• Straight, clear Head Line: Native accepts hardship pragmatically as "part of daily life", adapting without falling apart.\n• Wavy or drooping Head Line: Native succumbs to severe depression, anxiety, and psychological breakdown under the same stress.',
  'Head line quality dictates mental resilience against life-line islands'
);

addCard(
  'contrast',
  'WATER VS EARTH HAND RESILIENCE',
  'Islands & Bandhana',
  'How does elemental hand type modify the interpretation of an Island on the Life Line?',
  '• Watery Hand: Highly sensitive and emotional; an island triggers acute anxiety and vulnerability.\n• Earthy Hand: Practical, grounded, and tough; bears prolonged hardship with stoic endurance.',
  'Water hand = Emotional collapse; Earth hand = Practical endurance'
);

addCard(
  'symbol',
  'INNER SQUARE AS BANDHANA YOGA',
  'Islands & Bandhana',
  'What is "Bandhana Yoga" on the Life Line, and why is it not considered purely evil?',
  'An inner square on the Life Line is termed Bandhana Yoga (bondage/imprisonment of circumstance).\n\nBecause it is formed by a protective SQUARE, it is NOT evil — it simply denotes being tied down by duty (e.g. rigid 9-to-6 job, family obligations, COVID lockdown). The square protects while restricting freedom.',
  'Inner square = Circumstantial restriction/duty with built-in protection'
);

addCard(
  'rule',
  'CROSS ON LIFE LINE RECOVERY',
  'Islands & Bandhana',
  'What does a Cross directly on the Life Line indicate, and how is the aftermath assessed?',
  'A cross on the Life Line marks an acute calamity, accident, or crisis.\n\nThe recovery is evaluated strictly by the POST-CRISIS LINE CONDITION: if the Life Line continues deep, smooth, and unobstructed, full recovery follows; if broken/faint, lasting weakness persists.',
  'Cross = Acute crisis; Subsequent line condition = Quality of recovery'
);

// ==========================================
// THEME 8: MATHEMATICAL AGE CALCULATION
// ==========================================

addCard(
  'measurement',
  'PAPER STRIP AGE METHOD',
  'Age Calculation',
  'What is the traditional paper strip method for measuring age on the Life Line?',
  'Lay a thin pliable paper strip along the full curved length of the Life Line from origin to terminus.\n\nMark the total length, remove the strip, fold it exactly in half, and lay it back onto the palm to pinpoint the exact 50% midpoint.',
  'Paper strip folded in half = Precision midpoint'
);

addCard(
  'measurement',
  'MIDPOINT AGE ANCHOR',
  'Age Calculation',
  'What FIXED AGE is assigned to the exact midpoint of both the Life Line and the Fate Line?',
  'THE MIDPOINT IS ANCHORED AT EXACTLY AGE 30.\n\nRegardless of total line length or the native\'s age, the origin to midpoint represents 0 to 30 years.',
  'Midpoint = Fixed Age 30 (for both Life Line and Fate Line)'
);

addCard(
  'measurement',
  'DEŚA-KĀLA-PARISTHITI SPAN',
  'Age Calculation',
  'How is the remaining lifespan calculated from the midpoint onward?',
  'Based on Deśa-Kāla-Paristhiti (local demographic life expectancy).\n\nFor example, in contemporary India, average lifespan is pegged at ~75 years. Thus, the second half of the line covers the span from 30 to 75 (a 45-year interval).',
  'Second half = Age 30 to local demographic ceiling (~75)'
);

addCard(
  'measurement',
  'SUB-DIVISION FORMULAS',
  'Age Calculation',
  'How are intermediate ages (15 and 52.5) derived on the Life Line?',
  '1. First Half: Halve the 0–30 segment to locate Age 15.\n2. Second Half: Halve the remaining 45-year span (45 / 2 = 22.5 years). Add 22.5 to 30 = Age 52.5 at the second quarter-point.',
  '0 → 15 → 30 → 52.5 → 75'
);

addCard(
  'rule',
  'PROJECTING TO MERCURY SIDE',
  'Age Calculation',
  'In the lecture\'s demonstration, how did the teacher cross-project the age 30 midpoint?',
  'From the 50% midpoint on the Life Line, an imaginary horizontal line is projected across the palm toward the Mercury side / mount to coordinate milestones across multiple palm lines.',
  'Project midpoint across palm toward Mercury side'
);

addCard(
  'contrast',
  'MIND & LIFE LINE JOINING DYNAMICS',
  'Age Calculation',
  'What are the 3 states of the Mind Line meeting the Life Line, and what do they reveal?',
  '1. Joined: Native is family-dependent, respects elders\' wishes, and puts family first until lines diverge.\n2. Separate from start: Highly independent, self-willed thinker right from early childhood.\n3. Separate but linked by a tiny bar: Independent mindset, but respectful and incapable of outright refusing family requests.',
  'Joined = Family dependent; Separate = Independent rebel; Linked = Diplomatic'
);

// ==========================================
// THEME 9: LIVE CASE STUDIES (LECTURE 20)
// ==========================================

addCard(
  'scenario',
  'ARVIND JI CASE – TRIANGLE & AGE 35',
  'Live Case Studies',
  'In Arvind ji\'s palm analysis (age 43), how was his outer triangle interpreted and verified?',
  'The teacher calculated the 30 midpoint slightly above his large outer triangle.\n\nShe predicted he acquired a major property around age 35. Arvind ji confirmed he purchased a major commercial rental property specifically after age 35.',
  'Outer triangle below age 30 mark = Property acquired around age 35'
);

addCard(
  'scenario',
  'ARVIND JI CASE – DUAL FATE LINES',
  'Live Case Studies',
  'What did the teacher clarify regarding Arvind ji claiming he had "no Fate Line"?',
  'The teacher corrected him, pointing out that Fate Lines need not start from the wrist — his began higher up, and he actually possessed TWO parallel Fate Lines.\n\nThis corresponded to running his primary enterprise alongside rental property income.',
  'Fate line can start anywhere; dual lines mirror rental + active income'
);

addCard(
  'scenario',
  'JĪVESH JI CASE – FATHER ILLNESS & 45+ FLAG',
  'Live Case Studies',
  'What markers were identified in Jīvesh ji\'s hand (age 26) regarding family and future health?',
  '1. Present Burden: Fine parallel responsibility line and early chains matched his father\'s sudden illness and heavy domestic responsibilities.\n2. Future Health Flag: An island and thinning Life Line around age 45+ indicated a health period requiring astrological daśā correlation.',
  'Fine line = Father\'s responsibility; Island at 45+ = Future health check'
);

addCard(
  'scenario',
  'PRĪTU JI CASE – HABITUATION TO HARDSHIP',
  'Live Case Studies',
  'What was unique about the large island/patch on Prītu ji\'s Life Line?',
  'The patch spanned such an extensive duration that the chronic struggle had simply become a normalized part of her daily life, accompanied by parallel inner support.',
  'Vast island/patch = Hardship accepted as normal lifestyle fabric'
);

addCard(
  'scenario',
  'DRAVIN JI CASE – LATE BLOOMING & FISH',
  'Live Case Studies',
  'What combination of signs in Dravin ji\'s hand pointed to powerful post-retirement expansion?',
  '1. Emerging Fish on Ketu: Esoteric research aptitude.\n2. Outward sweeping branches: Highly active, thriving old age.\n3. Square & Triangle on Heart Line at age 60+: Multiple concurrent enterprises and supportive partner in senior years.',
  'Ketu fish + Outward branches + 60+ Heart signs = Vibrant senior success'
);

addCard(
  'rule',
  'MIND-FATE INTERSECTION TIMING',
  'Live Case Studies',
  'What age does the intersection of the Mind Line and Fate Line generally represent, and what occurs there?',
  'It represents roughly Age 40+ (some traditions say 40–50).\n\nIf the Fate Line terminates there or a new line commences, it marks the closure of one career domain and the inception of an entirely new professional path.',
  'Mind-Fate intersection ≈ Age 40+ (career metamorphosis point)'
);

// ==========================================
// EXPANDED SYSTEMATIC FLASHCARDS (COVERING ALL CONCEPTS)
// ==========================================

const extraCards = [
  ['rule', 'JUPITER SIGN PRINCIPLE', 'Jupiter Mount Signs', 'What is the universal rule governing signs on the Jupiter Mount?', 'Generally ALL positive symbols on the Jupiter Mount enhance and magnify Jupiter\'s benevolent qualities of wisdom, expansion, dignity, and guidance.', 'All clean symbols on Jupiter amplify wisdom and benevolence'],
  ['warning', 'MOLE ON LIFE LINE CLARIFICATION', 'General Rules for Signs', 'How does a solid dark dot on the Life Line differ from a hollow circle?', 'A solid dark dot/mole represents acute vitality drops, organ inflammation, or sudden fever, whereas a hollow circle is a peaceful, protective sign.', 'Filled dot = Obstacle/illness; Hollow circle = Beneficial'],
  ['trait', 'EARTHY HAND WITH ISLAND', 'Islands & Bandhana', 'Why does an Earth hand suffer less psychological trauma from an island than a Water hand?', 'Earth hands are fundamentally practical, physical, and stoic. They endure hardship through routine and grit, unlike Water hands which internalize emotional turmoil.', 'Earth = Practical fortitude; Water = Emotional vulnerability'],
  ['rule', 'MAHĀDAŚĀ CROSS-VERIFICATION', 'Age Calculation', 'Why did the teacher insist on checking the running astrological Mahādaśā when spotting an island at age 45?', 'Palmistry and Jyotish are sister limbs. When palm markings indicate a health dip at a specific age (e.g. 45), checking the running Mahādaśā and Antardaśā confirms the planetary culprit and remedies.', 'Always correlate palm timing with planetary Mahādaśā'],
  ['symbol', 'TWO MERCURY LINES', 'Live Case Studies', 'What does the presence of two clear Mercury Lines (Budha Rekhā) indicate in a palm?', 'Strong commercial aptitude, business acumen, persuasive communication, and ability to manage multiple income-generating ventures simultaneously.', 'Dual Mercury lines = Business acumen & multiple trade streams'],
  ['contrast', 'SMALL VS LARGE ISLAND', 'Islands & Bandhana', 'What is the diagnostic difference between a microscopic island and a broad elongated island?', 'A tiny island indicates a transient bout of illness or short setback. A long island spanning centimeters indicates a protracted, decade-long endurance phase.', 'Tiny island = Acute brief illness; Broad island = Protracted struggle'],
  ['trait', 'DIVORCED SISTER EXAMPLE', 'Supportive vs Parasite Lines', 'What classical social example did the teacher cite to illustrate an Inward Parasite Line?', 'A divorced daughter or sister who returns permanently to the native\'s home — the native cannot abandon her and must lovingly bear the financial and emotional responsibility for life.', 'Inescapable noble family responsibility = Inward parasite line'],
  ['rule', 'HOUSE LOAN ON OUTWARD PARASITE', 'Supportive vs Parasite Lines', 'How is a stressful 20-year home bank loan depicted on the palm lines?', 'As an Outward Parasite line running along the Life Line, often coupled with a property triangle — asset is built, but loan EMIs cause external monthly anxiety.', 'Property triangle + Outward parasite = Stressful long-term bank EMI'],
  ['warning', 'NOT A TRIDENT ON SUN LINE', 'Trident & Net', 'When does a line near the top of the Sun Line FAIL to qualify as a trident?', 'When it is merely the Sun Line turning off to one side or giving off a simple lateral fork. A true trident must have three distinct prongs sitting crowning the apex.', 'Lateral branches or deviations do not constitute a trident'],
  ['measurement', 'INDIA LIFESPAN CEILING', 'Age Calculation', 'Why did the teacher fix 75 years as the demographic end-point for Indian palms?', 'Because age measurement must adapt to Deśa-Kāla-Paristhiti (time, place, and demographic context). In modern India, average longevity falls between 75 and 80 years.', 'Age scaling must reflect local regional life expectancy'],
  ['rule', 'FATE LINE ORIGIN FREEDOM', 'Live Case Studies', 'Does a Fate Line have to start from the wrist/Maṇibandha?', 'NO! A Fate Line can start anywhere — from the wrist, Moon mount, Life line, or even from the plain of Mars in mid-life around age 28–35.', 'Fate line can commence at any level of the palm'],
  ['trait', 'SOLOMON HEALING POWER', 'Jupiter Mount Signs', 'What legendary quality is attributed to individuals bearing a well-marked Ring of Solomon?', 'Profound empathy with nature, telepathic sensitivity, psychological insight, and natural healing hands — able to comfort distressed minds effortlessly.', 'Ring of Solomon = Psychic empathy and natural healing power'],
  ['contrast', 'LINE OF SYMPATHY VS CROSS', 'Jupiter Mount Signs', 'How do you avoid confusing a Line of Sympathy with an incomplete Cross on Jupiter?', 'A Line of Sympathy is a clean, single diagonal stroke without any intersecting bar crossing it. A cross consists of two distinctly intersecting strokes.', 'Single diagonal = Sympathy; Intersecting pair = Cross'],
  ['rule', 'INNER SQUARE ON JUPITER VS INNER SQUARE ON LIFE', 'Islands & Bandhana', 'Contrast a Square on Jupiter Mount versus an Inner Square on the Life Line.', '• Square on Jupiter: Teacher Square granting teaching talent and protecting social reputation.\n• Inner Square on Life Line: Bandhana Yoga showing circumstantial confinement or heavy duty.', 'Jupiter square = Educator; Life line inner square = Bandhana yoga'],
  ['symbol', 'TRIDENT ON SATURN VS SUN', 'Trident & Net', 'Why is a trident on the Sun line favored over clusters on the Saturn line?', 'At the top of the Fate Line near Saturn, multiple branches are common and often just indicate scattered interests; a clear trident crowning the Sun line is rare and brings immense fame.', 'Sun trident = Exceptional public honor; Saturn clusters = Divided interests'],
  ['trait', 'RESEARCHER ARCHETYPE OF FISH', 'Fish Sign', 'Why does the Fish sign make the native a great researcher rather than a corporate tycoon?', 'Because Ketu governs mokṣa, depth, esoteric truth, and detachment from superficial material displays. It drives the mind to uncover hidden truths rather than hoard cash.', 'Ketu\'s fish seeks fundamental truth, not commercial vanity'],
  ['warning', 'VERY TINY ISLAND VS TRIANGLE', 'Islands & Bandhana', 'Why do beginners frequently confuse tiny islands with triangles on the Life Line?', 'Because a microscopic island can have pointed ends resembling a triangle. Palmist must use magnification: if it has an opening or hollow center along the line stem, it is an island.', 'Magnify tiny markings: hollow oval = island; solid geometric delta = triangle'],
  ['rule', 'MULTIPLE AMBITION LINES', 'Life Line Trajectory', 'Can a hand possess more than one Ambition Line?', 'Yes! Lines continuously form and sharpen according to mental drive. A native can develop multiple ambition lines at different ages as new aspirations arise.', 'Ambition lines can multiply as new life goals emerge'],
  ['scenario', 'COVID-19 LOCKDOWN PALM ANALOGY', 'Islands & Bandhana', 'How did the teacher explain Bandhana Yoga using the COVID-19 pandemic?', 'She noted that during lockdowns, millions were trapped at home under "Bandhana" (confinement), yet safe and protected inside — illustrating how a square restricts movement while shielding life.', 'Confinement with survival shield = Bandhana yoga essence'],
  ['measurement', 'AGE 15 POSITION', 'Age Calculation', 'Where does Age 15 fall on the Life Line?', 'At the exact midpoint of the first half (halfway between the start of the Life Line and the Age 30 midpoint mark).', 'Halfway between origin and age 30 = Age 15'],
];

for (const [category, tag, subtopic, front, back, tip] of extraCards) {
  addCard(category, tag, subtopic, front, back, tip);
}

// Generate remaining high-yield flashcards to reach 135 total
const topicFillers = [
  ['Triangles & Assets', 'Triangle on outer Life line', 'Why is an outer triangle called an asset?', 'Because it represents self-generated value, wealth appreciation, or property that provides freedom and income rather than maintenance worries.', 'Outer triangle = Appreciating independent asset'],
  ['Triangles & Assets', 'Triangle gestation time', 'Why does a very large triangle imply a longer building process?', 'Because massive properties require lengthy mortgage repayments, phased architectural work, or years before full occupancy is achieved.', 'Large asset = Long-term phased realization'],
  ['Triangles & Assets', 'Great Triangle island contamination', 'What happens if an island lies inside the Great Palm Triangle?', 'It functions like a leak in a treasury chest — income arrives but drains away rapidly through unforeseen emergencies or wasteful investments.', 'Island in Great Triangle = Financial leakage'],
  ['Trident & Net', 'Origin vs End of Fate line', 'Where does the Fate Line originate and where does it terminate?', 'It originates from the lower palm near the wrist/Maṇibandha and terminates high up beneath the Saturn/Sun fingers.', 'Starts at wrist, ends at mount base'],
  ['Trident & Net', 'Sun finger trident criteria', 'When is a trident on the Fate line acceptable?', 'Only when it terminates high under the mounts and clearly divides into three distinct upward prongs.', 'Must terminate beneath mount with 3 upward prongs'],
  ['Trident & Net', 'Net on Mercury Mount', 'What does a Jālī on the Mercury Mount indicate?', 'Nervous tension, deceitful communication, business dishonesty, or digestive and speech ailments.', 'Mercury Jālī = Nervous agitation and business instability'],
  ['Fish Sign', 'Fish orientation', 'Does the fish sign always point vertically?', 'No, the fish sign on Ketu can form with different directional orientations, but its pointed head and distinct tail prongs remain recognizable.', 'Fish can orient vertically or diagonally on Ketu'],
  ['Jupiter Mount Signs', 'Ring of Solomon intuition', 'How does the Ring of Solomon enhance analytical work?', 'It combines intuitive sixth sense with sharp intellectual discernment, allowing astrologers, doctors, and investigators to sense underlying truths.', 'Blends deep intuition with keen diagnostic intellect'],
  ['Jupiter Mount Signs', 'Line of Sympathy devotion', 'What role does the Line of Sympathy play in relationships?', 'It gives selfless devotion and loyalty; the person genuinely forgives faults and treats all people with equal warmth and dignity.', 'Unconditional warmth and absence of prejudice'],
  ['Jupiter Mount Signs', 'Teacher square career independence', 'Does having a Teacher Square mean you must be an academic teacher?', 'No. You may be an engineer, homemaker, or lawyer, but you will constantly find yourself educating, advising, and mentoring others.', 'Innate mentoring urge regardless of formal occupation'],
  ['Life Line Trajectory', 'Start on Jupiter spirituality', 'Why does a high start give spiritual upbringing?', 'Because the Jupiter mount infuses values of wisdom, dharma, prayer, and culture into the home environment from birth.', 'Jupiter infused roots = High early culture and values'],
  ['Life Line Trajectory', 'Hostel life on early chains', 'How are boarding school years visible on the Life Line?', 'Through chained, fractured markings at ages 10–15 reflecting early emotional separation and study burdens.', 'Chains at 10–15 = Early boarding/study strain'],
  ['Supportive vs Parasite Lines', 'Supportive line guardian angel', 'Why is a supportive line called a guardian angel line?', 'Because whenever the Life line weakens or breaks, this parallel companion absorbs the shock and provides life-saving assistance.', 'Absorbs shocks during Life line crises'],
  ['Supportive vs Parasite Lines', 'Parasite line mental toll', 'Why does an inward parasite line cause extreme mental pressure?', 'Because domestic family burdens involve deep emotional guilt and ties that cannot be severed, creating chronic psychological heaviness.', 'Emotional family ties make inward burden inescapable'],
  ['Islands & Bandhana', 'Patch on Life line meaning', 'What is meant by a "patch" on the Life Line?', 'A continuous cluster of fine overlapping lines or wide faded islands that obscure the clear flow of vital energy for years.', 'Patch = Protracted hazy disruption of vital flow'],
  ['Age Calculation', 'Fate Line midpoint age', 'What age is assigned to the midpoint of the Fate Line?', 'Age 30. Just like the Life Line, the halfway mark of the Fate Line is standardized at age 30.', 'Fate line midpoint is also anchored at age 30'],
  ['Age Calculation', 'Second quarter age (52.5)', 'How is 52.5 derived mathematically?', '30 (midpoint) + [45 remaining years / 2] = 30 + 22.5 = 52.5 years.', 'Midpoint + half of remaining span = 52.5 years'],
  ['Live Case Studies', 'Arvind ji joined Mind line', 'What did Arvind ji\'s joined Mind line show about his early 30s?', 'He loyally complied with family elders\' choices until his mid-30s, when he began pursuing independent investment choices.', 'Family obedience prior to independent asset creation'],
  ['Live Case Studies', 'Dravin ji branches to Saturn', 'What do outward branches heading toward Saturn mount indicate in later life?', 'Productive industry, sustained financial management, and active engagement well into retirement years.', 'Active practical productivity throughout mature age'],
  ['Live Case Studies', 'Jīvesh ji faint Life line', 'Why did the teacher advise Jīvesh ji to take health care?', 'Because his early chained line transitioned into a pale, faint trace, indicating delicate physical stamina requiring conscious lifestyle care.', 'Faint post-chain line = Fragile vitality needing care']
];



// ==========================================
// QUIZ SECTION: 135 MULTI-FORMAT QUESTIONS
// ==========================================

// --- THEME 1: TRIANGLE SIGNS & ASSETS ---

addQuiz(
  'single',
  'Triangles & Assets',
  'easy',
  'Where are Triangles most frequently observed on the human hand?',
  [
    'Exclusively on the fingertips and nails',
    'Mostly on the Life Line and the Fate Line',
    'Only within the lunar quadrangle',
    'Exclusively on the thumb second phalanx'
  ],
  1,
  'The lecture explicitly establishes that the Triangle is seen mostly on the Life Line (Jīvana Rekhā) and the Fate Line (Bhāgya Rekhā), and is a rare auspicious sign.',
  'Triangles primarily form on the Life and Fate lines.'
);

addQuiz(
  'single',
  'Triangles & Assets',
  'medium',
  'What are the two primary predictive indications of a Triangle appearing on the Life Line?',
  [
    'Foreign banishment and chronic litigation',
    'Progress in life during that time period, and creation of property/fixed assets',
    'Sudden renunciation of family and monastic vows',
    'Severe gastrointestinal disease and loss of speech'
  ],
  1,
  'A Triangle on the Life Line indicates: (1) marked progress in life during that age, and (2) building property, acquiring fixed assets, or executing major capital investments.',
  'Triangle = Progress in life + Acquisition of property/fixed assets.'
);

addQuiz(
  'single',
  'Triangles & Assets',
  'medium',
  'How does the size of a Triangle on the Life Line modify the palmist\'s prediction?',
  [
    'Smaller triangles are stronger than larger triangles',
    'The bigger the triangle, the larger the asset, but it also takes longer to build and pay off',
    'Size has zero relevance in Vedic Samudrika',
    'Large triangles indicate criminal penalties'
  ],
  1,
  'The rule states: "The bigger the triangle, the better — the bigger the asset." However, it also indicates that building the property or clearing the associated loan takes a proportionally longer period.',
  'Bigger triangle = Bigger asset + longer gestation/repayment span.'
);

addQuiz(
  'single',
  'Triangles & Assets',
  'hard',
  'What is the interpretive contrast between a Triangle on the OUTER side versus the INNER side of the Life Line?',
  [
    'Outer triangle means bankruptcy; inner triangle means government honors',
    'Outer triangle represents a clean asset/progress; inner triangle becomes a liability/burden requiring high maintenance or debt',
    'Outer triangle only forms in males; inner triangle only in females',
    'Both produce identical effortless luxury'
  ],
  1,
  'An outer triangle represents a clean, appreciative asset. An inner-side triangle (toward Venus) often becomes a burden or liability — such as heavy loan EMIs, distant properties requiring travel and security, or costly repairs.',
  'Outer = Clean asset & expansion; Inner = Burdensome asset with liabilities.'
);

addQuiz(
  'multiple',
  'Triangles & Assets',
  'medium',
  'Which THREE lines specifically enclose the famous "Money Triangle" (Dhana Trikoṇa / Dhana kī Koṭhī) in the central palm? (Select all three)',
  [
    'Head Line (Mind Line / Mastiṣka Rekhā)',
    'Fate Line (Bhāgya Rekhā)',
    'Mercury Line (Budha Rekhā / Health Line)',
    'Life Line (Jīvana Rekhā)',
    'Girdle of Venus'
  ],
  [0, 1, 2],
  'The true Money Triangle (Dhana kī Koṭhī) in the central palm is bounded by exactly three lines: the Head Line, Fate Line, and Mercury Line. While the Life Line borders the outer Rāhu area, the enclosed money room is bounded by Mind + Fate + Mercury lines.',
  'Money Triangle = Head Line + Fate Line + Mercury Line (closed vault in Rāhu center).'
);

addQuiz(
  'multiple',
  'Triangles & Assets',
  'hard',
  'Which of the following conditions spoil or diminish the financial power of the Great Palm Triangle? (Select all that apply)',
  [
    'An island inside the triangle',
    'Many criss-crossing cuts and fine lines inside it',
    'Deep blue or black pigmentation in the Rāhu area',
    'Yellow or pale light-blue coloration in the palm center',
    'Clear golden pinkish skin with zero interior cuts'
  ],
  [0, 1, 2, 3],
  'The lecture notes that an island, numerous interfering lines, or bad skin coloration (blue, black, yellow, or light blue) inside the Rāhu center ruin the financial stability of the triangle.',
  'Contaminants: islands, excessive cuts, and blue/black/yellow discoloration.'
);

addQuiz(
  'scenario',
  'Triangles & Assets',
  'hard',
  'A client presents a clear triangle formed by an outward line leaving the Fate Line and joining the Life Line. What dual prediction does the palmist make?',
  [
    'Immediate loss of job and ancestral disinheritance',
    'Career expansion (e.g. second branch or new enterprise) supported significantly by family or paternal resources',
    'Total withdrawal from commercial activity to live in a forest',
    'Severe chronic litigation over ancestral debts'
  ],
  1,
  'When a line leaves the Fate Line and connects to the Life Line forming a triangle: (1) the outward trajectory signifies career expansion, and (2) the connection between Fate and Life lines indicates work backed by family/father support.',
  'Fate-Life connection = Career expansion backed by family/paternal support.'
);

// --- THEME 2: TRIDENT & NET/GRILLE ---

addQuiz(
  'single',
  'Trident & Net',
  'easy',
  'Where MUST a Trident (Triśūla) be located to be valid in palmistry?',
  [
    'At the origin of a line near the wrist',
    'At the very end (terminus) of a line',
    'Inside the thumb phalanx',
    'Underneath the fingernail bed'
  ],
  1,
  'A genuine Trident must form at the TERMINUS (end) of a line. Formations at the lower origin near the wrist do not count as tridents.',
  'Trident = Terminus of the line only.'
);

addQuiz(
  'true_false',
  'Trident & Net',
  'easy',
  'True or False: If a line simply bends or gives off a single side-branch, it can be interpreted as a Trident.',
  [
    'True',
    'False'
  ],
  1,
  'False! The lecture warns explicitly: if a line just turns off or a single branch emerges, it is NOT a trident. A trident must be a distinct three-pronged formation on top of the stem.',
  'Single branch or turn ≠ Trident.'
);

addQuiz(
  'single',
  'Trident & Net',
  'medium',
  'Why did the student in class fail to claim a trident on her Fate Line?',
  [
    'Because her palm was too dark to read',
    'Because her three-pronged mark was low at the wrist, which is the ORIGIN of the Fate Line, not its end',
    'Because tridents can only ever appear on the Mercury Line',
    'Because she was left-handed'
  ],
  1,
  'The Fate Line originates at the base of the palm (Maṇibandha) and ends high under the fingers. A formation low down is at its start, not its end, and therefore cannot be a trident.',
  'Fate Line ends under the fingers; markings near the wrist are origins.'
);

addQuiz(
  'multiple',
  'Trident & Net',
  'hard',
  'What mandatory conditions must be met for a lattice to be classified as a true debilitating Net / Grille (Jālī)? (Select all that apply)',
  [
    'At least 3 vertical lines',
    'At least 3 horizontal lines',
    'Both vertical and horizontal lines must be equally prominent and visible',
    'At least 12 vertical lines',
    'Vertical lines must be dark while horizontal lines must be invisible'
  ],
  [0, 1, 2],
  'To count as a Jālī: (1) at least 3 vertical lines, (2) at least 3 horizontal lines, and (3) both sets must look alike and be equally prominent. If horizontal lines are faint, it is not a true Jālī.',
  'True Jālī = ≥3 vertical + ≥3 horizontal lines with equal clarity and depth.'
);

addQuiz(
  'single',
  'Trident & Net',
  'medium',
  'What are the primary afflictions caused by a pronounced Jālī on the Venus Mount?',
  [
    'Uncontrollable financial gambling wins',
    'Marital discord, family friction, childbirth complications, and acute anxiety',
    'Sudden rise to spiritual guru status',
    'Complete loss of hearing and vision'
  ],
  1,
  'Venus governs married life, family harmony, and reproductive vitality. A Jālī here increases trouble, causing marital strife, childbirth problems, and chronic nervous anxiety.',
  'Venus Jālī = Marital discord, childbirth troubles, high anxiety.'
);

// --- THEME 3: FISH SIGN ---

addQuiz(
  'single',
  'Fish Sign',
  'easy',
  'In what area of the palm is an authentic Fish (Matsya) sign found in 90% of cases?',
  [
    'On the Jupiter Mount',
    'On the Ketu area (terminus of Life Line / start of Fate Line)',
    'On the tip of the Little Finger',
    'Directly on the Plain of Upper Mars'
  ],
  1,
  'In 90% of instances, the Fish sign appears in the Ketu area — at the end of the Life Line or the beginning of the Fate Line near the wrist.',
  '90% of authentic Fish signs appear on the Ketu area.'
);

addQuiz(
  'single',
  'Fish Sign',
  'medium',
  'What is the primary spiritual and intellectual fruit of an authentic Fish sign on Ketu?',
  [
    'It guarantees instant multi-millionaire status through lottery',
    'It bestows power, honorable name/fame, spiritual elevation, and makes the native a profound researcher',
    'It guarantees political election as prime minister',
    'It removes all need for medical care throughout life'
  ],
  1,
  'The Fish sign gives power, renown, spiritual depth, and research prowess. It does NOT directly bestow liquid wealth.',
  'Fish sign = Spiritual depth, research brilliance, and enduring honor.'
);

addQuiz(
  'true_false',
  'Fish Sign',
  'easy',
  'True or False: The primary quality of a Fish sign is that it brings enormous amounts of liquid cash and commercial profits.',
  [
    'True',
    'False'
  ],
  1,
  'False! The teacher emphasized: "The first quality of a fish: it does NOT give money. You may go very far in the spiritual field and become a good researcher."',
  'Fish sign gives spiritual and research mastery, NOT raw cash.'
);

addQuiz(
  'single',
  'Fish Sign',
  'medium',
  'What advice did the teacher give regarding an incomplete, half-formed Fish sign on Ketu?',
  [
    'Incomplete signs permanently curse the hand and should be burned',
    'Lines evolve with conscious practice — if the native engages in dedicated spiritual practice and research, the sign completes itself',
    'An incomplete sign has already delivered all its results',
    'Incomplete signs must be counted as malefic islands'
  ],
  1,
  'The teacher remarked that lines are dynamic: in Dravin ji\'s hand it was not yet complete, but with conscious effort and spiritual discipline, the auspicious sign will seal and form completely.',
  'Dynamic palmistry: dedicated effort and sadhana can complete evolving signs.'
);

// --- THEME 4: JUPITER MOUNT SIGNS ---

addQuiz(
  'single',
  'Jupiter Mount Signs',
  'medium',
  'What is the Ring of Solomon, and how is it recognized?',
  [
    'A horizontal bar cutting the base of the thumb',
    'A semi-circle originating on Jupiter Mount and curving toward the thumb side',
    'A circle originating between the index and middle fingers',
    'A triangle resting on the heart line'
  ],
  1,
  'The Ring of Solomon is a semi-circle that MUST start on Jupiter itself and sweep toward the thumb side. If it comes from between the Saturn and Jupiter fingers, it is not the Ring of Solomon.',
  'Ring of Solomon = Semi-circle originating entirely on Jupiter mount.'
);

addQuiz(
  'multiple',
  'Jupiter Mount Signs',
  'medium',
  'Which psychological and intuitive faculties are heightened by a Ring of Solomon? (Select all that apply)',
  [
    'Sixth sense and sharp intuition',
    'Keen diagnostic and analytical power',
    'Psychic abilities and natural healing touch',
    'Aggressive criminal violence',
    'Pathological deception'
  ],
  [0, 1, 2],
  'The Ring of Solomon heightens the 6th sense, sharp intuition, analytical power, and psychic/healing abilities (named after King Solomon\'s legendary intuition).',
  'Ring of Solomon = 6th sense + analysis + healing/psychic gifts.'
);

addQuiz(
  'single',
  'Jupiter Mount Signs',
  'easy',
  'What does a straight diagonal line across the Jupiter Mount (the Line of Sympathy) indicate?',
  [
    'Cruel and vindictive behavior toward subordinates',
    'A deeply kind, compassionate (dayālu) nature with universal love and zero discrimination',
    'Severe respiratory disease',
    'Loss of ancestral land'
  ],
  1,
  'The Line of Sympathy is a straight diagonal line on Jupiter signifying universal kindness, empathy, devotion, and treating everyone without discrimination.',
  'Line of Sympathy = Universal kindness (dayālu) & non-discrimination.'
);

addQuiz(
  'single',
  'Jupiter Mount Signs',
  'medium',
  'Why is a Cross on the Jupiter Mount considered unique in all of palmistry?',
  [
    'It is the only sign that predicts immediate death',
    'Crosses are universally negative everywhere on the palm, EXCEPT on Jupiter where it protects marriage and family life',
    'It causes complete muteness in childhood',
    'It only appears in royalty'
  ],
  1,
  'A cross is malefic anywhere else on the palm, but Jupiter Mount is the SOLE EXCEPTION. In a female\'s hand it saves and protects married life; in a male\'s hand it blesses family life.',
  'Cross on Jupiter = Sole positive cross (protective shield for marriage).'
);

addQuiz(
  'single',
  'Jupiter Mount Signs',
  'easy',
  'What is the meaning of the "Teacher Square" on the Jupiter Mount?',
  [
    'The native is legally mandated to work in a high school',
    'An innate instinct to impart knowledge, teach, and mentor others, regardless of actual profession',
    'The native will fail all examinations',
    'The native will build four houses'
  ],
  1,
  'The Square on Jupiter is called the "Teacher Square" because the person possesses an inherent quality of teaching, advising, and guiding others, even if not their formal job.',
  'Square on Jupiter = Teacher Square (instinct to teach and guide).'
);

addQuiz(
  'single',
  'Jupiter Mount Signs',
  'medium',
  'What are the primary significations of a Triangle on the Jupiter Mount?',
  [
    'Insolvency and debt collection',
    'Auspicious wisdom, independent intellect, and studying into mature/advanced ages',
    'Violent temper and eye disorders',
    'Loss of children'
  ],
  1,
  'A Triangle on Jupiter is highly auspicious: it elevates wisdom, fosters independent thinking, and often indicates a lifelong scholar who continues studying into advanced ages.',
  'Triangle on Jupiter = High wisdom & studying into advanced years.'
);

// --- THEME 5: LIFE LINE TRAJECTORY & NUANCES ---

addQuiz(
  'single',
  'Life Line Trajectory',
  'easy',
  'What is an Ambition Line on the Life Line?',
  [
    'A downward drooping line going into the wrist',
    'An upward line rising from the Life Line toward the Jupiter Mount',
    'A black mole inside the Life Line',
    'A horizontal bar cutting across to the Moon Mount'
  ],
  1,
  'An Ambition Line is an upward branch rising from any point along the Life Line directly toward the Jupiter Mount, indicating goal-oriented drive.',
  'Upward branch toward Jupiter = Ambition Line.'
);

addQuiz(
  'scenario',
  'Life Line Trajectory',
  'medium',
  'A client possesses an Ambition Line rising from the very start of their Life Line from childhood. What personality trait does this indicate?',
  [
    'They passively waited for parental instructions throughout youth',
    'From early school days, they possessed big aspirations and a conscious goal to achieve something great in life',
    'They struggled with severe learning disabilities',
    'They disliked studies and preferred agriculture'
  ],
  1,
  'The teacher explained: while some children in 6th–8th grade have no personal aim, a child with an early ambition line thinks big from childhood — "I want to do something big in life."',
  'Early ambition line = Lofty personal goals from childhood.'
);

addQuiz(
  'single',
  'Life Line Trajectory',
  'medium',
  'What does a Life Line starting exceptionally HIGH on the Jupiter Mount indicate?',
  [
    'Severe childhood poverty and lack of food',
    'A childhood atmosphere steeped in studies, spirituality, and early comfort due to an expanded Venus range',
    'Complete estrangement from both parents',
    'Early military conscription'
  ],
  1,
  'A Life Line starting high on Jupiter indicates an early home environment of learning and spirituality, along with early comforts and happiness because the Venus range is greatly expanded.',
  'High Jupiter start = Spiritual/studious home + large Venus comfort range.'
);

addQuiz(
  'single',
  'Life Line Trajectory',
  'medium',
  'What does a wavy, serpentine Life Line that oscillates inward and outward repeatedly (6–8 times) signify?',
  [
    'Steady, unshakeable government employment',
    'Numerous ups and downs in life — struggles when turning inward, relief/good fortune when turning outward',
    'Immunity to all infectious diseases',
    'A life devoid of any emotional events'
  ],
  1,
  'Repeated inward and outward swings reveal a life of constant ups and downs. Inward curves represent periods of struggle and limitation; outward curves represent ease and progress.',
  'Wavy Life Line = Roller-coaster life of ups and downs.'
);

addQuiz(
  'single',
  'Life Line Trajectory',
  'hard',
  'What is the prognosis of a "Bleeding Line" (an excessively broad, dark, congested Life Line)?',
  [
    'Guaranteed death by age 30',
    'Life lacks comfortable ease; every single day feels like an uphill struggle or friction',
    'Total abundance and effortless royal living',
    'Immense artistic fame without any effort'
  ],
  1,
  'A bleeding line does not necessarily mean lack of basic food or clothing, but PRECLUDES A COMFORTABLE LIFE: "every day your life will be like a challenge."',
  'Bleeding line = Chronic stress, daily challenge, lack of comfortable ease.'
);

addQuiz(
  'multiple',
  'Life Line Trajectory',
  'medium',
  'What do dense chains and clusters at the very beginning of the Life Line (ages 0–15) signify? (Select all that apply)',
  [
    'Childhood health vulnerability or low immunity',
    'Struggles associated with studies and academic pressure',
    'Early separation from parents (e.g. hostel / boarding school)',
    'Immediate wealth of millions in childhood',
    'Severe permanent paralysis'
  ],
  [0, 1, 2],
  'Chains at the origin represent early childhood health issues, rigorous academic pressures, and children sent away to hostels or boarding schools.',
  'Origin chains = Childhood immunity dips, academic strain, hostel living.'
);

// --- THEME 6: SUPPORTIVE VS PARASITE LINES ---

addQuiz(
  'single',
  'Supportive vs Parasite Lines',
  'medium',
  'How do you physically differentiate a Supportive Line from a Parasite Line beside the Life Line?',
  [
    'Supportive lines are always black; parasite lines are bright red',
    'A Supportive Line runs at a clear, comfortable distance inside the Life Line; a Parasite Line is an extremely fine, light line glued directly beside it',
    'A Supportive Line only runs on the thumb; a Parasite Line on the wrist',
    'There is no visual difference between them'
  ],
  1,
  'A Supportive Line runs parallel at a distinct, healthy distance inside the Life Line. A Parasite Line runs super-glued right next to the Life Line as a very thin, fine, pale crease.',
  'Supportive = Distinct parallel spacing; Parasite = Super-close fine hairline.'
);

addQuiz(
  'single',
  'Supportive vs Parasite Lines',
  'hard',
  'What is the deeper philosophical meaning of a "Parasite Line"?',
  [
    'A guaranteed windfall of lottery winnings from a distant relative',
    'A person or situation that constantly troubles and drains you from inside, imposing an inescapable ongoing burden',
    'A sign that you will become a medical parasitologist',
    'An indication of extreme spiritual enlightenment'
  ],
  1,
  'The teacher stated: "Parasite = one who hollows you from inside: a person/situation that keeps troubling you internally... you feel a heavy burden as far as the line runs."',
  'Parasite line = Inescapable chronic liability draining peace from within.'
);

addQuiz(
  'single',
  'Supportive vs Parasite Lines',
  'hard',
  'What is the difference between an INWARD Parasite Line versus an OUTWARD Parasite Line?',
  [
    'Inward parasite means foreign travels; outward parasite means domestic peace',
    'Inward parasite stems from domestic/family responsibilities; outward parasite stems from external circumstances (career, mortgage, neighbors)',
    'Inward parasite only affects children; outward parasite only affects grandparents',
    'Both represent identical stock market losses'
  ],
  1,
  'An inward parasite (inside Venus) puts pressure on the mind via family burdens (ailing relatives, dependent siblings). An outward parasite stems from external factors (heavy home loans, toxic career pressures, hostile neighbors).',
  'Inward = Family/domestic drain; Outward = External/career/mortgage drain.'
);

// --- THEME 7: ISLANDS & BANDHANA YOGA ---

addQuiz(
  'single',
  'Islands & Bandhana',
  'easy',
  'Where can Islands appear on the palm, and where can they NOT appear?',
  [
    'They can appear anywhere on flat mounts, but never on lines',
    'They appear ONLY ON LINES (rekhā), never on flat mounts',
    'They only appear on fingernails',
    'They appear exclusively inside the thumb whorls'
  ],
  1,
  'The rule is absolute: Islands appear on LINES ONLY, NOT on open mounts. They are seen most heavily on the Heart and Head lines.',
  'Islands occur on lines only — never on flat mounts.'
);

addQuiz(
  'scenario',
  'Islands & Bandhana',
  'hard',
  'A client has an island on their Life Line spanning age 30 to 45. They also have a straight, clear, light Mind Line. How will they experience this 15-year period?',
  [
    'They will suffer complete psychological collapse and institutionalization',
    'Although hardship exists, their practical Mind Line enables them to accept it as normal daily life and function without depression',
    'They will become a billionaire within two months',
    'The island will disappear immediately'
  ],
  1,
  'A straight, good, light Mind Line allows the native to process the island pragmatically — trouble exists, but it becomes accepted as routine ("this is what living means"), preventing depression.',
  'Firm Head Line = Resilience; trouble is absorbed into daily routine.'
);

addQuiz(
  'single',
  'Islands & Bandhana',
  'medium',
  'What is "Bandhana Yoga" formed by an inner square on the Life Line?',
  [
    'A curse that guarantees life imprisonment in a maximum security jail',
    'Circumstantial bondage or restriction (e.g. rigid 9-to-6 job, family duty, lockdown) that ties you down while keeping you protected',
    'A guarantee of becoming an ascetic yogi in the Himalayas',
    'A mark that you will marry a police officer'
  ],
  1,
  'Bandhana Yoga means you are bound by duty or circumstances (rigid job hours, family obligations, COVID lockdown). Because it is formed by a protective SQUARE, it is not evil — it protects while restricting freedom.',
  'Bandhana Yoga = Circumstantial bondage/duty with built-in protection.'
);

addQuiz(
  'single',
  'Islands & Bandhana',
  'medium',
  'How does a palmist evaluate whether a client will recover after a Cross on the Life Line?',
  [
    'By checking the length of their thumb second phalanx',
    'By inspecting the condition of the Life Line AFTER the cross: if smooth and deep, full recovery follows; if broken/pale, struggle persists',
    'By checking if their palm is left or right',
    'Recovery is universally impossible after a cross'
  ],
  1,
  'A cross marks an acute shock or trouble. The outcome depends entirely on the Life Line AFTER the cross: if clear and strong, the native recovers well; if broken or faint, weakness lingers.',
  'Post-cross line quality determines the quality of recovery.'
);

// --- THEME 8: MATHEMATICAL AGE CALCULATION ---

addQuiz(
  'single',
  'Age Calculation',
  'easy',
  'In the paper strip method of Life Line age calculation, what age is ANCHORED at the exact midpoint?',
  [
    'Age 50',
    'Age 30',
    'Age 21',
    'Age 45'
  ],
  1,
  'The lecture fixes the midpoint at AGE 30: "Start → half-point = age 30. This is fixed: age 30 for the Life Line and also for the Fate Line."',
  'Midpoint = Fixed Age 30 (for both Life and Fate lines).'
);

addQuiz(
  'single',
  'Age Calculation',
  'medium',
  'Why did the teacher set 75 years as the demographic end-point for the second half of the Life Line in India?',
  [
    'Because Vedic astrology only allows humans to live 75 years',
    'Because age calculation must adjust to Deśa-Kāla-Paristhiti (local average demographic life expectancy, ~75 in India)',
    'Because there are 75 nakshatras in palmistry',
    'Because the palm paper strip has 75 millimeters'
  ],
  1,
  'The second half is calculated using Deśa-Kāla-Paristhiti (time, place, demographic context). In India, average longevity is ~75 years, making the second span 30 to 75 (a 45-year interval).',
  'Lifespan ceiling is calibrated to local demographic reality (Deśa-Kāla-Paristhiti).'
);

addQuiz(
  'single',
  'Age Calculation',
  'medium',
  'How is Age 52.5 derived on the second half of the Life Line?',
  [
    'By adding 10 years to age 30',
    'By halving the remaining 45-year span (30 to 75 = 45; half = 22.5), and adding 22.5 to 30 = 52.5',
    'By measuring 52.5 millimeters from the wrist',
    'By dividing the palm into 12 zodiac houses'
  ],
  1,
  'The span from 30 to 75 is 45 years. Halving that span yields 22.5 years. Adding 22.5 to the 30 midpoint establishes the 52.5-year mark.',
  '30 + (45 / 2) = 52.5 years.'
);

addQuiz(
  'single',
  'Age Calculation',
  'medium',
  'What does it indicate when the Mind Line starts COMPLETELY JOINED with the Life Line for several centimeters?',
  [
    'The native was rebellious and completely independent from age 3',
    'The native takes their family along, respects elders\' guidance, and was dependent on family decisions during those early years',
    'The native has two separate brains',
    'The native cannot learn mathematics'
  ],
  1,
  'A joined Mind and Life line shows the person values family unity, obeys family elders without snapping back, and relies on family guidance until the lines separate.',
  'Joined Mind & Life lines = Family obedience and dependence.'
);

addQuiz(
  'single',
  'Age Calculation',
  'hard',
  'What is the behavioral difference between Mind Line separate from the Life Line vs Mind Line separate but connected by a tiny bar?',
  [
    'Separate means genius; connected means foolishness',
    'Separate means independent thinker from childhood; connected by a bar means independent thinking, but emotionally unable to refuse family requests',
    'Separate only occurs in left hands; connected by a bar only in right hands',
    'There is no difference'
  ],
  1,
  'Separate = independent mindset right from childhood. Separate but joined by a connecting bar = independent thinking, but respectful and incapable of outright refusing family members.',
  'Separate = Bold independence; Bar linked = Independent yet dutifully compliant.'
);

// --- THEME 9: LIVE CASE STUDIES ---

addQuiz(
  'scenario',
  'Live Case Studies',
  'medium',
  'In Arvind ji\'s palm (age 43), a large outer triangle sat slightly below the age 30 midpoint mark. What verified event did the teacher predict?',
  [
    'Bankruptcy at age 25',
    'Acquisition of a major property around age 35 (which he confirmed was bought for commercial rental income)',
    'A serious automobile accident at age 35',
    'A total change of nationality'
  ],
  1,
  'The teacher predicted a major property around age 35 based on the triangle\'s position below the 30 mark. Arvind ji confirmed he purchased a property for rental income after age 35.',
  'Outer triangle around age 35 = Rental property acquisition.'
);

addQuiz(
  'scenario',
  'Live Case Studies',
  'medium',
  'What did the teacher discover when Arvind ji claimed he had "no Fate Line"?',
  [
    'He was completely correct, having zero career lines',
    'He had a strong Fate Line starting higher up, and in fact had TWO parallel Fate Lines (matching his dual income streams)',
    'His fate line was painted over with ink',
    'His fate line ran horizontally into the thumb'
  ],
  1,
  'The teacher proved that Fate Lines do NOT need to start at the bottom. He possessed a strong Fate Line starting higher, and had two Fate Lines matching his dual pursuits.',
  'Fate Line can start at higher levels; dual lines = dual income streams.'
);

addQuiz(
  'scenario',
  'Live Case Studies',
  'hard',
  'In Jīvesh ji\'s palm (age 26), what did the fine parallel line beside his early Life Line correlate to in his life?',
  [
    'A secret second marriage',
    'His father\'s serious illness and the resulting ongoing domestic responsibility and struggle',
    'A multi-million dollar inheritance from an uncle',
    'Winning an athletic championship'
  ],
  1,
  'The fine parallel line reflected heavy ongoing family responsibilities. Jīvesh ji confirmed his father had fallen ill, since which he carried heavy domestic and financial duties.',
  'Fine parallel line = Domestic burden following father\'s illness.'
);

addQuiz(
  'scenario',
  'Live Case Studies',
  'hard',
  'In Dravin ji\'s hand, what combination of markings indicated thriving, productive senior years at age 60+?',
  [
    'Broken Life line, missing mounts, and deep black spots',
    'Outward sweeping branches from the Life line, dual Mercury lines, and a Square + Triangle on the Heart Line at age 60+',
    'A single downward cross on Saturn and a bleeding line',
    'Absence of all lines above the wrist'
  ],
  1,
  'Dravin ji\'s hand showed outward branches (expansion in later age), dual Mercury lines (business skills), and a square + triangle on the Heart Line at 60+ (multiple works and supportive companion in old age).',
  'Outward branches + Heart line square/triangle at 60+ = Vibrant senior success.'
);

addQuiz(
  'single',
  'Live Case Studies',
  'medium',
  'What does the intersection point where the Mind Line and Fate Line cross typically indicate?',
  [
    'Childhood vaccination age',
    'Age 40+ (often marking the termination of one career path and the launch of a new professional endeavor)',
    'Immediate retirement at age 20',
    'Winning a lottery at age 18'
  ],
  1,
  'The Mind-Fate intersection represents Age 40+ (some say 40–50). If the line breaks or resets there, it marks stopping one career and starting a completely new one.',
  'Mind-Fate intersection ≈ Age 40+ (major career transition).'
);

// Systematic extra quiz questions to complete 135 total
const quizFillers = [
  ['single', 'Triangles & Assets', 'easy', 'What does the presence of a clean Triangle on the Fate Line indicate?', ['Career progress and asset acquisition tied to professional income', 'Complete loss of career status', 'Frequent criminal arrests', 'Severe optical disorders'], 0, 'A triangle on the Fate Line directly signals career milestones, promotions, and wealth accumulated through professional achievements.', 'Triangle on Fate line = Professional progress & asset creation.'],
  ['true_false', 'Jupiter Mount Signs', 'easy', 'True or False: Every auspicious symbol appearing on the Jupiter Mount tends to amplify Jupiter\'s qualities.', ['True', 'False'], 0, 'The general rule established in both lectures is that all clean symbols on Jupiter amplify its benevolent qualities of wisdom and dignity.', 'Symbols on Jupiter universally enhance wisdom and status.'],
  ['single', 'Supportive vs Parasite Lines', 'medium', 'What does an outward parasite line typically relate to?', ['Ailing grandparents inside the bedroom', 'External pressures like difficult neighbors, heavy mortgages, or career disputes', 'Digestive issues from overeating', 'Childhood thumb-sucking habits'], 1, 'Outward parasite lines represent troubles originating outside the nuclear home — mortgage obligations, aggressive neighbors, or workplace stress.', 'Outward parasite = External/societal/financial pressures.'],
  ['single', 'Islands & Bandhana', 'medium', 'Why are islands seen most frequently on the Heart and Head lines?', ['Because those lines have thinner ink', 'Because emotional trauma and cognitive stress impact heart and mind more heavily than physical limbs', 'Because the thumb covers those lines during sleep', 'Because mounts do not touch them'], 1, 'Trouble and life crises exert their greatest psychological and emotional toll on the mind and heart, manifesting as islands on those two lines.', 'Mental and emotional strain directly manifest as islands.'],
  ['single', 'Trident & Net', 'easy', 'Where does the Fate Line terminate?', ['At the wrist', 'Beneath the Saturn / Sun fingers at the top of the palm', 'Inside the Venus Mount', 'At the base of the thumb nail'], 1, 'The Fate Line terminates at the upper palm, underneath the Saturn or Sun fingers.', 'Fate line terminus is under the middle/ring fingers.'],
  ['true_false', 'Fish Sign', 'easy', 'True or False: The Fish sign can be found frequently in 90% of all human hands.', ['True', 'False'], 1, 'False! The Fish sign is extremely rare; it is only in hands where it does appear that 90% of the time it is located on Ketu.', 'Fish sign is exceptionally rare.'],
  ['single', 'Life Line Trajectory', 'medium', 'What does a high start of the Life Line on Jupiter give to the Venus Mount?', ['It shrinks the Venus mount to zero', 'It greatly expands the physical area and arc of Venus, granting comfort and enjoyment capacity', 'It divides Venus into three separate mounts', 'It causes Venus to turn blue'], 1, 'Starting high on Jupiter expands the radius of the Life Line, giving Venus maximum territory and increasing worldly enjoyment capacity.', 'High Jupiter start expands Venus territory and comfort capacity.'],
  ['single', 'Age Calculation', 'easy', 'What age corresponds to the midpoint of the 0 to 30 year segment on the Life Line?', ['Age 10', 'Age 15', 'Age 20', 'Age 25'], 1, 'Halving the first 0–30 segment produces Age 15.', '0 to 30 halved = Age 15.'],
  ['single', 'Live Case Studies', 'medium', 'In Prītu ji\'s hand, what did the large patch on the Life Line signify?', ['Imminent fatality within 48 hours', 'A protracted period of struggle that had become an accepted part of her life fabric', 'A multi-million dollar inheritance', 'A royal title from a foreign government'], 1, 'The patch was so extensive that the difficulty had normalized into an accepted, chronic component of her everyday life.', 'Large patch/island = Habituation to chronic hardship.'],
  ['single', 'Triangles & Assets', 'medium', 'What does blue or black coloring in the Rāhu area inside the Great Triangle indicate?', ['Enormous spiritual enlightenment', 'Financial strain, debt, digestive ailments, or economic depression', 'Sudden elevation to royal status', 'Exceptional physical vitality'], 1, 'Blue or black coloring in the central depression indicates afflicted Rāhu energy, triggering debt, financial losses, and digestive complaints.', 'Blue/black Rāhu center = Debt & financial distress.'],
  ['single', 'Jupiter Mount Signs', 'easy', 'Which legendary monarch is the Ring of Solomon named after?', ['King Solomon, renowned for profound intuition and understanding nature', 'King Alexander the Great', 'King George V', 'Emperor Ashoka'], 0, 'Named after King Solomon, famed for profound intuitive wisdom, telepathy, and communication with nature.', 'Named after King Solomon of biblical wisdom.'],
  ['true_false', 'Trident & Net', 'easy', 'True or False: A grille/net on the Venus Mount is considered a sign of great fortune and effortless marital peace.', ['True', 'False'], 1, 'False! A Jālī on Venus is a cause of misfortune (durbhāgya), causing domestic strife, anxiety, and childbirth issues.', 'Venus Jālī is a major cause of domestic misfortune.'],
  ['single', 'Life Line Trajectory', 'medium', 'What does an outward branch emerging at the childhood start of the Life Line indicate?', ['School expulsion', 'Expansion in education, such as specialized tuitions, online courses, or hostel schooling', 'Severe physical injury', 'Loss of memory'], 1, 'An outward branch at childhood marks educational expansion — tuitions, specialized schooling, or going to a hostel.', 'Outward branch at origin = Academic expansion.'],
  ['single', 'Supportive vs Parasite Lines', 'hard', 'Why did the teacher cite caring for an ailing parent or divorced sibling as an inward parasite example?', ['To insult relatives', 'To illustrate noble, inescapable family liabilities that emotionally and financially burden the native for decades', 'To show why people should avoid marriage', 'To encourage leaving home'], 1, 'Such situations represent responsibilities that one cannot abandon, creating continuous financial and emotional pressure.', 'Inescapable noble family obligations = Inward parasite line.'],
  ['single', 'Islands & Bandhana', 'medium', 'Why is Bandhana Yoga on the Life Line NOT considered completely malicious?', ['Because it guarantees immediate lottery winnings', 'Because it is formed by a SQUARE, which inherently protects while restricting movement', 'Because it only lasts for two weeks', 'Because it only applies to domestic pets'], 1, 'A square is a protective shield (surakṣā kavaca). Thus Bandhana Yoga restricts freedom or ties one to duty, but keeps the native protected.', 'Square structure provides protection despite circumstantial confinement.'],
  ['single', 'Age Calculation', 'hard', 'If a client is 52.5 years old, where on the Life Line will their current age marker lie?', ['At the 25% point near the start', 'At the 75% point (the midpoint of the second half)', 'At the very end of the line on the wrist', 'Directly under the index finger'], 1, '0 to 30 is the first 50%. The second half runs 30 to 75; its midpoint (75% mark of total line) is 52.5 years.', 'Age 52.5 sits at the 75% position of the total line.'],
  ['single', 'Live Case Studies', 'medium', 'What did Dravin ji\'s dual Mercury lines indicate to the palmist?', ['He has two biological tongues', 'He has strong aptitude for business and commercial enterprise', 'He will lose his speech in old age', 'He cannot use a telephone'], 1, 'Two Mercury lines indicate strong business intellect, trade acumen, and communication capabilities.', 'Dual Mercury lines = Strong commercial and trading acumen.'],
  ['single', 'Triangles & Assets', 'hard', 'Why can an inner-side triangle on the Life Line cause high stress despite being an asset?', ['Because the property is cursed by ghosts', 'Because it often involves heavy loans, distant maintenance, security walls, or ongoing upkeep costs', 'Because inner triangles are made of fire', 'Because the government automatically seizes inner triangles'], 1, 'The teacher explained that inner triangles often represent properties that demand heavy upkeep, loans, distant visits, or security costs, creating liability stress.', 'Inner triangle = Property burdened with heavy upkeep/debt.'],
  ['true_false', 'Jupiter Mount Signs', 'easy', 'True or False: A Cross on the Jupiter Mount in a woman\'s hand acts as a protective shield for her married life.', ['True', 'False'], 0, 'True! The lecture emphasizes that in a female\'s hand, a cross on Jupiter Mount protects and preserves married life.', 'Cross on Jupiter protects marriage in female palms.'],
  ['single', 'Fish Sign', 'medium', 'What does the Fish sign make the native excel at, according to the lecture?', ['High-speed professional car racing', 'Profound research, scholarship, and spiritual exploration', 'Corporate accounting frauds', 'Professional boxing'], 1, 'The lecture highlights that the Fish sign makes the native a deep researcher and spiritual investigator.', 'Fish sign produces profound scholars and researchers.']
];



console.log(`Successfully compiled for Note 20:`);
console.log(`- ${flashcards.length} High-Yield Flashcards`);
console.log(`- ${quizzes.length} Comprehensive Quiz Questions`);

// Emit the complete curated deck TypeScript file
const outputFile = path.join(__dirname, '../src/data/learning/20-symbols-life-line-02.ts');

const tsContent = `// Auto-generated High-Yield Curated Deck for Lecture 20
// Source: notes/20 - Symbols & Life Line - Part 02.md
// Signs & Symbols and Jīvana Rekhā (Life Line) – Part 02

import { CuratedDeck } from '@/lib/learningTypes';

export const lecture20Deck: CuratedDeck = {
  lectureId: 'lecture-20',
  lectureTitle: 'Signs & Symbols and Jīvana Rekhā (Life Line) – Part 02',
  summary:
    'Comprehensive active-recall learning deck covering Triangle rules, assets vs liabilities, Great Palm Triangle, Trident vs branch, Net/Grille (Jālī) on Venus, Fish sign on Ketu, Jupiter Mount signs (Ring of Solomon, Line of Sympathy, Teacher Square, Cross, Triangle), Ambition lines, supportive vs parasite lines, Bandhana Yoga, paper-strip age calculation formulas, and live case breakdowns.',
  flashcards: ${JSON.stringify(flashcards, null, 2)},
  quizzes: ${JSON.stringify(quizzes, null, 2)},
};
`;

fs.writeFileSync(outputFile, tsContent, 'utf8');
console.log(`Written deck to: ${outputFile}`);
