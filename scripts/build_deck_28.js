const fs = require('fs');
const path = require('path');

// Comprehensive High-Yield Learning Deck Builder for Lecture 28
// Source: notes/28 - Marriage Line.md
// Vivāha Rekhā (Marriage Line) — Class Notes
// Strict Quality Guidelines:
// - 100% Unique Questions & Flashcards (ZERO padding loops, ZERO cloned drills)
// - Accurate Sāmudrika Śāstra principles, formulas, case studies, and clinical takeaways

console.log('Building Lecture 28 high-yield Learning Deck...');

const flashcards = [];
const quizzes = [];

const NOTE_ID = '28 - Marriage Line.md';
const NOTE_TITLE = 'Hasta Sāmudrika Śāstra – Vivāha Rekhā (Marriage Line) & Finger/Mount Nuances';

function addCard(category, tag, subtopic, front, back, tip) {
  flashcards.push({
    id: `marriage-fc-${flashcards.length + 1}`,
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
    id: `marriage-qz-${quizzes.length + 1}`,
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
// THEME 1: ANATOMY & GENERAL PRINCIPLES OF VIVĀHA REKHĀ
// Location, Direction, Deśa-Kāla-Paristhiti, Ethics
// ==========================================

addCard(
  'rule',
  'LOCATION & DIRECTION OF VIVĀHA REKHĀ',
  'Anatomy of Marriage Line',
  'Where is the Vivāha Rekhā (Marriage Line) located, and in which direction does it travel?',
  'Location: Situated on the Mount of Mercury (Budha Parvata) between the Heart Line and the base joint line (sandhi rekhā) of the little finger.\n\nDirection: It enters from the outer percussion edge of the palm and travels inward toward the center of the palm. Also known classically as the Śīla-guṇa Rekhā.',
  'Enters inward from the outer percussion edge on the Mercury mount'
);

addCard(
  'principle',
  'DEŚA-KĀLA-PARISTHITI & THE MARRIAGE LINE',
  'General Principles',
  'Why must the Vivāha Rekhā be understood through Deśa-Kāla-Paristhiti rather than as a strict legal contract line?',
  'Classically, the line represents mental, emotional, and physical bonding rather than a formal legal registry.\n\nIn modern contexts, it reflects deep emotional attachments, long-term live-in partnerships, and committed bonds. Societal definitions of marriage evolve, but the palm records emotional and psychological integration.',
  'Represents deep emotional & physical bonding, adapting to modern relationship contexts'
);

addCard(
  'warning',
  'ETHICAL PROHIBITION ON EXTRAMARITAL PREDICTIONS',
  'Consultation Ethics',
  'What strict ethical instruction does the teacher give regarding extramarital affairs?',
  '"We never state an extramarital affair from the hand."\n\nPalmistry lines reflect emotional impressions, attachments, and psychological attractions. Declaring an extramarital affair causes irreversible familial harm and misinterprets palmistic impressions that may simply represent professional admiration or past crushes.',
  'Strict rule: Never diagnose or announce an extramarital affair to a client'
);

addCard(
  'rule',
  'ABSENCE OR MULTIPLICITY OF MARRIAGE LINES',
  'General Principles',
  'Does the absence of a visible Marriage Line mean a person will never marry, or multiple lines mean multiple marriages?',
  'No.\n- Absence of a line: Does NOT mean no marriage; it indicates a lack of deep emotional romantic dependency or an emotionally detached, transactional approach to marriage.\n- Multiple lines: Do NOT mean multiple spouses; they represent intense crushes, infatuations, broken engagements, or sequential relationship negotiations.',
  '0 lines ≠ no marriage; Multiple lines ≠ multiple spouses'
);

// ==========================================
// THEME 2: LINE QUALITY & AGE CALCULATION
// Thickness, Parasite line, Timing scale 0-56
// ==========================================

addCard(
  'contrast',
  'LINE QUALITY: FAINT VS VERY DARK VS BALANCED',
  'Line Quality',
  'How do clinical readings differ between a faint, very dark, and balanced Marriage Line?',
  '1. Faint / Hard to see: Emotional detachment; partner feels uncommitted or spiritually distant.\n2. Very Dark / Thick (Gaḍhī): Rigid, controlling, orthodox mindset; indicates heavy pressure on married life where family burdens overshadow domestic happiness.\n3. Balanced / Normal: Even depth and clarity indicate a healthy, fulfilling, and mutually supportive marriage.',
  'Balanced = Healthy; Dark = Rigid & burdened; Faint = Emotionally detached'
);

addCard(
  'rule',
  'DARK MARRIAGE LINE & THE PARASITE LINE',
  'Line Quality',
  'If a client has an unusually dark, heavy Marriage Line, what must the palmist inspect on the Life Line?',
  'Check for a Parasite Line (Upajīvī Rekhā) running closely alongside the Life Line in the corresponding age sector.\n\nThis confirms that domestic friction is caused by a dependent relative (e.g., an ailing elder, a divorced sibling living in the house, or financial dependents) whose presence strains the marital atmosphere.',
  'Very dark marriage line + parasite line on Life line = Third-party domestic burden'
);

addCard(
  'measurement',
  'AGE SCALE ON THE MARRIAGE LINE (0–56 YEARS)',
  'Age Measurement',
  'How is chronological age calibrated on the Mount of Mercury for the Marriage Line?',
  'The space between the Heart Line and the base joint line (sandhi rekhā) of the Mercury finger represents the timing window.\n- Heart Line level = Age 0.\n- Base joint of Mercury finger = Age 56 (previously taken as 50).\n\nMidpoint corresponds to approximately age 27–28. The teacher\'s own line sits slightly below the midpoint, matching her marriage age of 22–23.',
  'Heart Line = 0, Mercury base = 56; Midpoint ≈ 28 years'
);

// ==========================================
// THEME 3: FORMS AND FORMATIONS OF THE MARRIAGE LINE
// Upward hook, downward slope, cuts, islands, forks
// ==========================================

addCard(
  'symbol',
  'UPWARD HOOK ON MARRIAGE LINE',
  'Forms & Formations',
  'What is the specific prediction when the Marriage Line curves sharply upward in a hook toward the Mercury finger?',
  'An upward hook indicates NO MARRIAGE (or lifelong bachelorhood / deliberate aversion to marriage).\n\nEven if a hook is small, if it reaches halfway into the lower phalange of Mercury or curves back on itself, the native rejects marital union or encounters insurmountable obstacles preventing marriage.',
  'Sharp upward hook = No marriage / lifelong bachelorhood'
);

addCard(
  'symbol',
  'VERTICAL CUT ACROSS MARRIAGE LINE',
  'Forms & Formations',
  'What does a distinct vertical line cutting perpendicularly across the Marriage Line signify?',
  'A vertical cut signifies a sudden, abrupt fracture in married life.\n\nClinically, it can indicate a sudden separation or the accidental / premature death of the spouse. The exact timing of the crisis cannot be read from the cut itself and must be cross-checked on the Life Line.',
  'Vertical line cutting marriage line = Abrupt break or sudden loss of spouse'
);

addCard(
  'contrast',
  'DOWNWARD SLOPE VS CUTTING THE HEART LINE',
  'Forms & Formations',
  'How does a Marriage Line sloping downward toward the Heart Line differ from one that directly CUTS the Heart Line?',
  '1. Sloping downward: Dull, emotionally draining marriage; native feels burdened, dissatisfied, and emotionally unsupported.\n2. Slicing through the Heart Line: The most destructive formation — signifies that married life terminates in deep sorrow, profound heartbreak, or tragic loss.',
  'Sloping down = Emotional burden; Slicing Heart line = Tragic heartbreak/sorrow'
);

addCard(
  'symbol',
  'DOWNWARD VS UPWARD BRANCHES',
  'Forms & Formations',
  'How do small downward branches from the Marriage Line contrast with upward branches?',
  '- Downward branches: Minor domestic ups and downs, temporary disagreements (found in over 50% of hands; only alarming if they cut the Heart Line).\n- Upward branches / gentle upward tilt (without a hook): Highly auspicious; represents a joyful, flourishing, and supportive partnership that elevates the native.',
  'Downward branches = Normal domestic frictions; Upward branches = Blissful marital rise'
);

addCard(
  'symbol',
  'CIRCLE OR VERTICAL CUT AT THE TERMINATION',
  'Forms & Formations',
  'What is indicated when a Marriage Line terminates in a small circle, or is cleanly stopped by a vertical line?',
  'A circle at the termination of the Marriage Line is a classical sign indicating the premature death of the spouse.\n\nSimilarly, a sharp vertical bar dead-ending the line points to a sudden, unexpected loss or accidental termination of the partner\'s life.',
  'Circle at end of marriage line = Premature death of spouse'
);

addCard(
  'contrast',
  'ISLAND DYNAMICS: SMALL VS LARGE ISLAND',
  'Forms & Formations',
  'Why does the teacher consider a SMALL island on the Marriage Line clinically more agonizing than a large island?',
  'A large island indicates that married life was compromised from the very beginning, so the native adapts to emotional compromise as normal.\n\nA small island emerges after a phase of genuine happiness, delivers a sharp crisis, and then clears. The psychological contrast makes the small island feel far more painful and destabilizing.',
  'Small island brings acute disruption after happiness; large island is a chronic compromise'
);

addCard(
  'rule',
  'TRANSIENT NATURE OF PALM ISLANDS',
  'Forms & Formations',
  'Can an island on the Marriage Line or Mercury Line disappear over time?',
  'Yes. Palm lines are dynamic biological and energetic maps.\n\nThe teacher shared her personal case: an island on her Mercury Line formed during a severe illness and completely vanished once she recovered and passed that age bracket.',
  'Islands can physically dissolve after the stressful karma/age passes'
);

addCard(
  'symbol',
  'FORK AT START VS FORK AT END',
  'Forms & Formations',
  'What is the diagnostic difference between a fork at the START of the Marriage Line versus at the END?',
  '1. Fork at Start (percussion edge): Initial hesitation, family objections, or mental distraction before the marriage stabilizes.\n2. Fork at End (inside palm): Gradual estrangement, loss of romantic interest, emotional separation, and living as strangers under one roof.',
  'Fork at start = Initial hesitation; Fork at end = Estrangement and loss of interest'
);

addCard(
  'symbol',
  'LINE REACHING SUN MOUNT',
  'Forms & Formations',
  'What does a long Marriage Line that extends to the Mount of Sun (Sūrya Parvata) indicate?',
  'If it reaches the Sun Mount without cutting the Sun Line, it brings immense social prestige, fame, and wealth through marriage.\n\nWARNING: If it cuts through the Sun Mount or slices across the Sun Line, it causes public scandal, loss of reputation, and legal/financial ruin caused by a spouse or a woman.',
  'Reaching Sun mount = Elevation through marriage; Cutting Sun line = Public scandal'
);

addCard(
  'symbol',
  'THIRD-PARTY CUT VS HEALER LINE',
  'Forms & Formations',
  'When a vertical line crosses the Marriage Line, how do you prevent confusing it with the Healer Line (Budha Rekhā)?',
  'The Healer Line naturally rises vertically on the Mercury Mount, particularly in medical, therapy, or counselling professionals.\n\nBefore predicting third-party marital interference, ascertain the client\'s profession. If they work in healthcare or counselling, vertical lines reflect their healing speech (vāṇī), not domestic saboteurs.',
  'Verify profession: Healing lines on Mercury must not be misdiagnosed as marital cuts'
);

addCard(
  'warning',
  'LINE FROM VENUS MOUNT CUTTING MARRIAGE LINE',
  'Forms & Formations',
  'What is the classical and clinical significance of a line traveling all the way from the Venus Mount to cut the Marriage Line?',
  'Classical texts suggest extreme spousal violence or the native harming their spouse.\n\nClinical rule: Never make such a claim from this line alone. The teacher warns to check the Lower Mars mount, general palm aggression, and the thumb (specifically looking for the "murderer\'s clubbed thumb" with pent-up rage).',
  'Venus line cutting marriage line = Severe spousal conflict; verify thumb and Mars'
);

// ==========================================
// THEME 4: HEART LINE LINK & MARRIAGE TYPE
// Saturn stop vs Jupiter rise, Love vs Arranged
// ==========================================

addCard(
  'rule',
  'HEART LINE TERMINATION & MARRIAGE ORIENTATION',
  'Heart Line Link',
  'Why must the Heart Line always be examined alongside the Marriage Line when predicting marital dynamics?',
  'The Heart Line reveals the native\'s emotional operating system:\n- Stopping under Saturn: Emotional detachment, transactional and practical mindset ("loves with the mind, not the heart"). Highly indicative of an arranged marriage.\n- Rising onto Jupiter Mount: Romantic idealism, emotional devotion, and high probability of a love marriage.',
  'Heart under Saturn = Arranged / practical; Heart on Jupiter = Love / idealistic'
);

addCard(
  'trait',
  'HAND TYPE & LOVE MARRIAGE PROBABILITY',
  'Heart Line Link',
  'Which hand types exhibit the highest constitutional propensity for love marriages?',
  'Fiery Hands and Watery Hands.\n- Fiery hands act on immediate passion, impulse, and personal desire.\n- Watery hands are deeply emotional, romantic, and driven by sentimental bonds.\nAiry and Earthy hands operate on mental analysis and societal/practical duty, leaning toward arranged marriages.',
  'Fiery & Watery hands have the highest tendency toward love marriage'
);

// ==========================================
// THEME 5: FINGER TILTS, APEX & KNOTTY HANDS
// Jupiter-Saturn, Sun-Saturn, Apex shifts, Knotty
// ==========================================

addCard(
  'principle',
  'FINGER TILTS AS PLANETARY YUTI',
  'Finger Tilts',
  'How should finger tilts be interpreted according to Sāmudrika Śāstra principles?',
  'Interpret a finger tilt exactly like a planetary conjunction (yuti) in Vedic astrology.\n\nWhichever finger leans toward another transfers its significations and blends with the neighboring planet. The receiving planet\'s domain is filtered through the qualities of the leaning planet.',
  'Finger tilt = Planetary conjunction (yuti) blending significations'
);

addCard(
  'contrast',
  'JUPITER TILTING TO SATURN VS SATURN TO JUPITER',
  'Finger Tilts',
  'Contrast the psychological effect of the Jupiter finger tilting toward Saturn versus the Saturn finger tilting toward Jupiter.',
  '1. Jupiter tilted to Saturn: Knowledge acquires patience, depth, and research rigor (Saturn as 8th house lord); the native does not impose knowledge and strictly follows societal laws.\n2. Saturn tilted to Jupiter: Karma (Saturn) is guided by wisdom and ethics (Jupiter); the native maintains optimism even in adversity ("whatever happened, happened for the best").',
  'Jupiter to Saturn = Depth & research; Saturn to Jupiter = Ethical & optimistic karma'
);

addCard(
  'contrast',
  'SUN TILTING TO SATURN: CAREER VS REPUTATION',
  'Finger Tilts',
  'How does a Sun finger tilting toward the Saturn finger produce opposing answers depending on whether the client asks about career or fame?',
  '- Career / Karma Question: Very auspicious. Infuses professional persistence, discipline, and endurance into career execution.\n- Sun / Fame Question: Causes delay in recognition, minor defame yoga (apayaśa), and eye or vitality sensitivities. Recognition comes late in life.',
  'Sun to Saturn = Great for work endurance, but delays fame and causes defame risk'
);

addCard(
  'principle',
  'THE MOUNT APEX (TRIRADIUS / PEAK)',
  'Mount Apex Nuances',
  'What does the Mount Apex reveal about a person, and what does it mean if all apexes are centered?',
  'The Apex (triradius/peak of papillary ridges) indicates planetary predominance (like the Ascendant or Moon sign influence).\n- Apex centered on a mount: That planet\'s energy dominates the personality.\n- All apexes centered: Exceptional constitutional balance, analogous to full Ṣaḍbala strength in astrology where all planets operate powerfully.',
  'Apex = Planetary predominance; All apexes centered = Balanced Ṣaḍbala'
);

addCard(
  'trait',
  'KNOTTY HAND (GĀṂṬHADĀR HĀTH)',
  'Hand Types',
  'What is a Knotty Hand, how is it identified, and what psychological traits does it bestow?',
  'Identified from the back of the hand by prominent, raised knuckle joints that look like knots (gāṃṭh).\n\nPsychological Traits: Bestows a deeply philosophical (dārśanik), analytical, and research-oriented mindset. The specific finger with the most pronounced knots reveals the department of life where deep philosophical inquiry is applied.',
  'Raised knuckle joints from back = Philosophical and research-driven mind'
);

addCard(
  'warning',
  'KNOTTY JOINTS VS CROOKED FINGERS',
  'Hand Types',
  'What is the crucial clinical distinction between a Knotty Hand and a Crooked Finger?',
  'A knotty hand features enlarged, swollen knuckle joints on straight fingers, indicating philosophical contemplation.\n\nA crooked finger (tēḍhī-mēḍhī uṅglī) bends or twists laterally, indicating deceit, career instability, or manipulative tendencies. They must never be confused.',
  'Knotty joints = Philosophy & research; Crooked finger = Deceit & career hurdles'
);

addCard(
  'rule',
  'HIERARCHY FOR PREDICTING NATURE',
  'Reading Methodology',
  'What is the precise step-by-step hierarchy taught by the teacher for predicting a client\'s basic nature?',
  '1. Hand Type (Fiery, Earthy, Airy, Watery) — accounts for ~60% of baseline temperament.\n2. Thumb Top Phalange — willpower, resolve, and decision-making authority.\n3. Mercury Mount & Finger — communication style, diplomacy, and expression.\n4. Modify with finger tilts, line textures, and specific mount marks.',
  'Hand type (60%) → Thumb top phalange → Mercury communication → Mounts'
);

// ==========================================
// THEME 6: CASE STUDIES
// Anuradha Ji's Jupiter Mount & Life Line
// ==========================================

addCard(
  'scenario',
  'CASE A: ANURADHA JI\'S JUPITER SQUARE',
  'Case Studies',
  'In Case Study A (Anuradha ji\'s hand), what did the prominent mark on her Jupiter mount indicate, and how was it distinguished from a diamond?',
  'Anuradha ji thought she had diamonds on Jupiter. The teacher clarified it is a Teacher\'s Square (Guru Parvata Square).\n\nRule: Diamonds only form at the termination of lines. A square on Jupiter confirms natural pedagogical talent, teaching ability, and spiritual protection. Anuradha ji is professionally a teacher.',
  'Square on Jupiter = Teacher\'s Square (pedagogy talent); Diamonds form at line ends'
);

addCard(
  'scenario',
  'CASE A: BIRD COMMUNICATION (RING OF SOLOMON IMPRESSION)',
  'Case Studies',
  'What rare trait did Anuradha ji exhibit that mimicked a Ring of Solomon impression on Jupiter?',
  'Anuradha ji possessed numerous fine lines on Jupiter giving a light impression of the Solomon Ring (wisdom/animal communication).\n\nShe verified that she mimics and holds conversations with koel birds, understanding their calls, and wild birds nested in her yard for six consecutive years.',
  'Fine lines on Jupiter = Heightened empathy with nature and bird communication'
);

addCard(
  'scenario',
  'CASE B: ANURADHA JI\'S TWO LIFE LINE ISLANDS',
  'Case Studies',
  'In Case Study B, what two verified biographical events matched the two distinct islands on Anuradha ji\'s Life Line?',
  '1. First Island (Youth): Severe childhood asthma that completely resolved around age 14–15.\n2. Second Island (Adult): Severe postpartum cardiovascular distress requiring multiple heart surgeries between ages 32 and 40.',
  'Two islands on Life Line = Youth asthma (up to 15) and heart surgeries (ages 32-40)'
);

// ==========================================
// QUIZ QUESTIONS
// ==========================================

addQuiz(
  'single',
  'Anatomy of Marriage Line',
  'easy',
  'Where is the Vivāha Rekhā (Marriage Line) situated, and in which direction does it travel?',
  [
    'On the Mount of Venus, moving outward toward the thumb',
    'On the Mount of Mercury, entering from the outer percussion edge inward',
    'On the Mount of Saturn, descending into the Plain of Mars',
    'On the Moon Mount, rising upward to the Heart Line'
  ],
  1,
  'The Marriage Line (Vivāha Rekhā / Śīla-guṇa Rekhā) is located on the Mount of Mercury between the Heart Line and the base of the little finger, traveling from the outer edge inward.',
  'The Marriage Line enters inward from the outer percussion edge on the Mercury mount.'
);

addQuiz(
  'true_false',
  'Consultation Ethics',
  'easy',
  'According to classical palmistry consultation ethics taught in class, a palmist should openly diagnose and declare an extramarital affair if multiple lines are present.',
  [
    'True',
    'False'
  ],
  1,
  'False. The teacher strictly emphasizes: "We never state an extramarital affair from the hand." Multiple lines represent emotional attachments, crushes, or past negotiations, and diagnosing an affair causes grave domestic harm.',
  'Never announce an extramarital affair during a palmistry consultation.'
);

addQuiz(
  'single',
  'Line Quality',
  'medium',
  'What does a very dark, thick (gaḍhī) Marriage Line indicate about the native\'s married life?',
  [
    'A blissful, romantic, and carefree domestic life',
    'An orthodox, rigid, and controlling mindset, with heavy domestic pressure overshadowing marital joy',
    'Multiple marriages occurring before age 25',
    'Instant wealth acquired through foreign in-laws'
  ],
  1,
  'A very dark and heavy Marriage Line indicates rigid, old-fashioned, controlling attitudes and immense pressure on married life (often due to caring for an ill family member or dependent relatives).',
  'A very dark marriage line indicates rigidity and domestic pressure, not romantic joy.'
);

addQuiz(
  'single',
  'Line Quality',
  'hard',
  'When a client displays a very dark Marriage Line, what complementary line should the palmist check alongside the Life Line?',
  [
    'A Sun Line split',
    'A Parasite Line (Upajīvī Rekhā) in the marriage age sector',
    'A Ring of Saturn',
    'A cross on the Mount of Ketu'
  ],
  1,
  'The teacher advises checking for a Parasite Line running alongside the Life Line. This confirms that the strain on marriage is caused by an external dependent or sick family member living in the household.',
  'Dark marriage line + parasite line on Life line = External family burden on marriage.'
);

addQuiz(
  'single',
  'Age Measurement',
  'medium',
  'On the Mercury Mount scale, what chronological ages are assigned to the Heart Line and the base joint of the Mercury finger?',
  [
    'Heart Line = 20 years; Mercury base = 80 years',
    'Heart Line = 0 years; Mercury base = 56 years',
    'Heart Line = 18 years; Mercury base = 72 years',
    'Heart Line = 10 years; Mercury base = 50 years'
  ],
  1,
  'The age scale runs from the Heart Line (age 0) up to the base joint line (sandhi rekhā) of the Mercury finger (age 56, previously taken as 50 in older texts).',
  'Age scale on Mercury mount: Heart Line = 0, base joint = 56.'
);

addQuiz(
  'single',
  'Forms & Formations',
  'easy',
  'What is the clear diagnostic indication of a Marriage Line that turns sharply upward into a hook toward the little finger?',
  [
    'No marriage / lifelong bachelorhood',
    'Marriage to a high-ranking foreign diplomat',
    'Birth of triplets',
    'Sudden inheritance of royal property'
  ],
  0,
  'An upward hook on the Marriage Line indicates no marriage or lifelong bachelorhood, where the native rejects marital ties or faces insurmountable barriers to wedding.',
  'An upward hook on the Marriage Line indicates no marriage.'
);

addQuiz(
  'single',
  'Forms & Formations',
  'medium',
  'What does a clean vertical line cutting directly across the Marriage Line signify?',
  [
    'Immediate promotion in government service',
    'A sudden, abrupt break in married life or the accidental death of the spouse',
    'The birth of a gifted daughter',
    'An arranged marriage turning into a love marriage'
  ],
  1,
  'A vertical cut slicing the Marriage Line indicates an abrupt, catastrophic fracture in the marriage, potentially marking the sudden or accidental loss of the spouse (which must be verified on the Life Line).',
  'A vertical line cutting the marriage line indicates a sudden break or loss of spouse.'
);

addQuiz(
  'single',
  'Forms & Formations',
  'medium',
  'Why does the teacher consider a small island on the Marriage Line more agonizing than a large island?',
  [
    'Because small islands are permanent while large islands disappear',
    'Because a small island disrupts an established period of genuine happiness, causing acute psychological shock',
    'Because small islands only appear on the left hand',
    'Because large islands always signify financial prosperity'
  ],
  1,
  'A large island represents a chronic, low-grade compromise from day one. A small island shatters an established period of marital happiness, so the native feels the suffering far more intensely.',
  'A small island causes acute disruption after established happiness.'
);

addQuiz(
  'single',
  'Forms & Formations',
  'medium',
  'How do the effects of a fork at the START of the Marriage Line differ from a fork at the END?',
  [
    'Start = Loss of interest; End = Initial hesitation',
    'Start = Initial distraction and hesitation; End = Loss of romantic interest and emotional estrangement',
    'Start = Twins; End = Triplets',
    'Start = Arranged marriage; End = Love marriage'
  ],
  1,
  'A fork at the start represents initial hesitation, family resistance, or divided focus before wedding. A fork at the end represents drifting apart, loss of emotional bond, and living as strangers.',
  'Fork at start = Initial hesitation; Fork at end = Emotional estrangement.'
);

addQuiz(
  'single',
  'Forms & Formations',
  'hard',
  'If a Marriage Line extends across the palm and cleanly enters the Mount of Sun WITHOUT cutting the Sun Line, what is the result?',
  [
    'Severe criminal litigation against in-laws',
    'Elevation in public prestige, wealth, and status through the spouse',
    'Immediate bankruptcy of the native\'s father',
    'Loss of eyesight'
  ],
  1,
  'A long Marriage Line reaching the Sun Mount without cutting the Sun Line signifies elevated status, fame, and wealth gained through a successful marital alliance.',
  'Reaching the Sun mount cleanly indicates prosperity and prestige through marriage.'
);

addQuiz(
  'single',
  'Forms & Formations',
  'hard',
  'If an extended line from Mercury Mount cuts through the Sun Mount and slices across the Sun Line, what does it signify?',
  [
    'High artistic awards from the state',
    'Severe public scandal, loss of reputation, or legal/financial ruin caused by a woman',
    'Establishment of an international charity',
    'A long overseas spiritual pilgrimage'
  ],
  1,
  'A line originating on Mercury and slicing across the Sun Line / Mount indicates acute public disgrace, loss of reputation, and legal or financial damage caused by a woman (spouse or female relative).',
  'Cutting the Sun line from Mercury indicates public disgrace caused by a woman.'
);

addQuiz(
  'multiple',
  'Forms & Formations',
  'medium',
  'Which of the following formations on or connected to the Marriage Line are considered inauspicious? (Select all that apply)',
  [
    'Upward hook toward the Mercury finger',
    'Sharp downward slope cutting through the Heart Line',
    'A circle at the termination of the line',
    'Gentle upward tilt with small upward branches',
    'A clean triangle resting on the line'
  ],
  [0, 1, 2],
  'An upward hook (no marriage), cutting the Heart Line (heartbreak/grief), and a circle at the end (death of partner) are severely inauspicious. Gentle upward branches and triangles are auspicious.',
  'Upward hooks, Heart Line cuts, and terminal circles are severely inauspicious.'
);

addQuiz(
  'single',
  'Heart Line Link',
  'medium',
  'What marital orientation is indicated when a client\'s Heart Line stops flat beneath the Mount of Saturn?',
  [
    'Passionate, uncontrollable romantic idealism',
    'A practical, unemotional mindset ("loves with the mind, not the heart"), strongly leaning toward an arranged marriage',
    'A vow of permanent celibacy in a monastery',
    'Multiple simultaneous secret love affairs'
  ],
  1,
  'A Heart Line terminating under Saturn indicates a practical, pragmatic attitude where emotion is tempered by duty and logic. It is the primary indicator of an arranged marriage.',
  'Heart Line ending under Saturn = Pragmatic, arranged marriage orientation.'
);

addQuiz(
  'single',
  'Heart Line Link',
  'medium',
  'A Heart Line that sweeps upward onto the Mount of Jupiter indicates which marital tendency?',
  [
    'A purely commercial marriage for business convenience',
    'High emotional devotion and strong predisposition for a love marriage',
    'Lifelong bachelorhood',
    'Immediate divorce within six months'
  ],
  1,
  'A Heart Line rising onto the Jupiter Mount indicates emotional idealism, loyalty, and deep romantic affection, significantly increasing the probability of a love marriage.',
  'Heart Line rising onto Jupiter Mount indicates love marriage propensity.'
);

addQuiz(
  'multiple',
  'Heart Line Link',
  'easy',
  'Which two hand types exhibit the strongest constitutional propensity for love marriages?',
  [
    'Fiery Hands',
    'Watery Hands',
    'Earthy Hands',
    'Airy Hands'
  ],
  [0, 1],
  'Fiery hands (driven by passion and bold impulse) and Watery hands (driven by deep sentiment and emotional romance) have the highest constitutional tendency toward love marriages.',
  'Fiery and Watery hands possess the highest tendency for love marriages.'
);

addQuiz(
  'single',
  'Finger Tilts',
  'medium',
  'What is the psychological effect when the Jupiter finger tilts toward the Saturn finger?',
  [
    'The person becomes a reckless gambler',
    'Research and depth enter knowledge; the person is deliberate, patient, and strictly abides by societal rules',
    'The person forces their spiritual opinions aggressively on everyone',
    'The person suffers immediate memory loss'
  ],
  1,
  'When Jupiter leans toward Saturn, Saturn\'s qualities (depth, patience, research, 8th house karakatva) temper Jupiter\'s wisdom. The person acquires knowledge steadily and never breaks rules.',
  'Jupiter tilted to Saturn = Depth, patience, research, and adherence to rules.'
);

addQuiz(
  'single',
  'Finger Tilts',
  'medium',
  'What positive trait enters a native\'s personality when their Saturn finger tilts toward the Jupiter finger?',
  [
    'Total greed for gold',
    'Ethical wisdom enters karma; the native remains optimistic and resilient even during hardship ("whatever happened was for the best")',
    'The native leaves employment to become a professional athlete',
    'Immediate political election'
  ],
  1,
  'Saturn represents karma and hardship. When it tilts toward Jupiter, Jupiterian wisdom and optimism enter their actions. Even in heavy crises, they extract positive lessons without succumbing to bitterness.',
  'Saturn tilting to Jupiter brings optimism and ethical wisdom to karma.'
);

addQuiz(
  'single',
  'Finger Tilts',
  'hard',
  'How does a Sun finger tilting toward the Saturn finger affect a career question versus a fame/reputation question?',
  [
    'Disastrous for career; brings instant overnight fame',
    'Very auspicious for career endurance; delays fame and introduces a mild defame risk (apayaśa)',
    'Neutral for both career and fame',
    'Guarantees inheritance of real estate but causes blindness'
  ],
  1,
  'For a karma/career inquiry, Sun leaning to Saturn is excellent, instilling persistent labor. For a fame inquiry, Saturn delays recognition and creates a risk of undeserved defame.',
  'Sun tilted to Saturn = Great for work discipline; delays fame and creates defame risk.'
);

addQuiz(
  'single',
  'Hand Types',
  'easy',
  'How is a Knotty Hand (Gāṃṭhadār Hāth) identified anatomically?',
  [
    'The palm has a deep depression in the center',
    'The finger knuckle joints appear raised and swollen like knots from the back of the hand',
    'All five fingers are crooked and bent sideways',
    'The thumb is completely missing the second phalange'
  ],
  1,
  'A Knotty Hand is diagnosed from the dorsal view by noticeably enlarged, bulbous knuckle joints (gāṃṭh). It indicates an analytical, philosophical, and research-oriented mind.',
  'Knotty hand = Enlarged, raised knuckle joints seen from the back of the hand.'
);

addQuiz(
  'true_false',
  'Hand Types',
  'easy',
  'A Knotty Hand is identical in meaning to a crooked (tēḍhī-mēḍhī) finger.',
  [
    'True',
    'False'
  ],
  1,
  'False. The teacher strictly warns not to confuse them. Knotty joints indicate philosophical contemplation; a crooked finger bends sideways and signifies deception or career turbulence.',
  'Knotty joints indicate philosophy; crooked fingers indicate deception/instability.'
);

addQuiz(
  'single',
  'Reading Methodology',
  'medium',
  'In the teacher\'s protocol for reading a client\'s basic nature, what element accounts for roughly 60% of the baseline temperament?',
  [
    'The Marriage Line length',
    'The Hand Type (Fiery, Earthy, Airy, Watery)',
    'The number of vertical lines on the Mercury mount',
    'The color of the fingernail moons'
  ],
  1,
  'The teacher explains that roughly 60% of a client\'s fundamental nature is established directly by their constitutional Hand Type (Fiery, Earthy, Airy, Watery).',
  'Hand Type accounts for ~60% of the baseline nature prediction.'
);

addQuiz(
  'scenario',
  'Case Studies',
  'medium',
  'In Case Study A (Anuradha ji\'s hand), she believed she had two diamonds on her Jupiter mount. How did the teacher correct this observation?',
  [
    'Diagnosed them as black moles indicating scandal',
    'Clarified that diamonds only form at the ends of lines, and her mark is a Teacher\'s Square confirming pedagogical talent',
    'Diagnosed them as islands indicating severe liver disease',
    'Stated that Jupiter mounts never carry geometric signs'
  ],
  1,
  'The teacher explained that diamonds form at line terminals. On Jupiter, intersecting lines formed a clear Teacher\'s Square, confirming Anuradha ji\'s professional vocation as a teacher.',
  'A square on Jupiter is the Teacher\'s Square, indicating pedagogical capability.',
  'Case Study A: Teacher Anuradha ji inspecting geometric marks on her Jupiter mount.'
);

addQuiz(
  'scenario',
  'Case Studies',
  'hard',
  'In Case Study B, Anuradha ji possessed two distinct islands on her Life Line. What two life crises accurately matched these timing coordinates?',
  [
    'Two divorces at ages 25 and 45',
    'Childhood asthma that resolved at 14–15, and postpartum heart surgeries between ages 32 and 40',
    'Loss of two family businesses due to fire',
    'Two foreign deportations'
  ],
  1,
  'The first island precisely timed severe childhood asthma until age 15. The second island timed a prolonged medical ordeal involving postpartum heart surgeries between ages 32 and 40.',
  'Islands on Life Line matched childhood asthma (to 15) and heart surgeries (32-40).',
  'Case Study B: Life Line island verification on student Anuradha ji.'
);

// ==========================================
// OUTPUT COMPILATION
// ==========================================

const outputContent = `import { CuratedDeck } from '@/lib/learningTypes';

export const lecture28Deck: CuratedDeck = {
  lectureId: '${NOTE_ID}',
  lectureTitle: '${NOTE_TITLE}',
  summary: 'Comprehensive mastery deck for Lecture 28 covering Vivāha Rekhā (Marriage Line / Śīla-guṇa Rekhā), line quality (faint, dark, parasite lines), age calculation (0–56 scale), structural formations (hooks, vertical cuts, downward Heart line cuts, small vs large islands, forks, Sun mount links), Heart Line linkages (Saturn arranged vs Jupiter love marriage), finger tilts as planetary yuti, the mount apex (triradius), knotty hands vs crooked fingers, and clinical case studies (Anuradha ji\\'s Teacher\\'s Square and Life Line islands).',
  flashcards: ${JSON.stringify(flashcards, null, 2)},
  quizzes: ${JSON.stringify(quizzes, null, 2)},
};
`;

const outputPath = path.join(__dirname, '../src/data/learning/28-marriage-line.ts');
fs.writeFileSync(outputPath, outputContent, 'utf8');

console.log('Successfully compiled for Note 28:');
console.log(`- ${flashcards.length} High-Yield Flashcards (100% Unique)`);
console.log(`- ${quizzes.length} Comprehensive Quiz Questions (100% Unique)`);
console.log(`Written deck to: ${outputPath}`);
