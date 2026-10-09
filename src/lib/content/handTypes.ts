export const HAND_TYPES = [
  'Elementary Hand (Primitive/Labor Hand)',
  'Spatulate Hand (Spoon Hand)',
  'Square Hand (Vertical Hand)',
  'Conical Hand (Conic Hand)',
  'Philosophical Hand (Knotty Hand)',
  'Psychic Hand',
  'Mixed Hand',
];

export interface HandTypeDetail {
  title: string;
  identification: string;
  mentality: string;
  struggleOrStrength: string;
  modifiers: string;
}

export const HAND_TYPE_DETAILS: Record<string, HandTypeDetail> = {
  'Elementary Hand (Primitive/Labor Hand)': {
    title: 'Elementary Hand (Primitive/Labor Hand)',
    identification: 'Looks thick, heavy, and stiff. Palm appears highly prominent, resembling a square (Mars-driven). Fingers look short and less prominent compared to the massive palm space. Wrist is thick and wide. Nails are typically small.',
    mentality: 'Core focus on short-term survival ("Work, eat, drink, sleep"). Refuses self-investment, lacks ambition, and declines training opportunities. Low emotional sensitivity and creativity appreciation.',
    struggleOrStrength: 'Success requires grueling physical labor. Stiff skin blocks positive yogas from bearing fruit easily without massive struggle.',
    modifiers: 'Skin texture is usually hard, rough, and stiff. Nails are small.',
  },
  'Spatulate Hand (Spoon Hand)': {
    title: 'Spatulate Hand (Spoon Hand)',
    identification: 'Shaped like a spatula or spoon (flares out wider at the top or bottom). Similar to the Elementary hand, but the wrist is noticeably thinner and the nails are not as small.',
    mentality: 'Hardworking and practical, but fiercely independent and highly disciplined with strict boundaries. Formula: "Learn first, then make money from that learning."',
    struggleOrStrength: 'One of the best categories. Combines extreme physical capacity/action with mental sharpness. Highly organized and time-sensitive.',
    modifiers: 'Skin is less rough than Elementary; nails are larger. Willpower is heavily tied to the strength of the Thumb.',
  },
  'Square Hand (Vertical Hand)': {
    title: 'Square Hand (Vertical Hand)',
    identification: 'The entire hand (palm + fingers combined) visually forms a square. Nails often naturally take a square shape as well.',
    mentality: 'Innate, natural business acumen. Can figure out how to make money and run businesses without prior formal training. Excellent long-term planner, highly determined but flexible enough to pivot.',
    struggleOrStrength: 'Extremely good category for prosperity. Possesses excellent social etiquette and grace, and often works/donates for social welfare.',
    modifiers: 'Small nails on a Square hand indicate a researcher/investigative mindset but may bring minor health issues.',
  },
  'Conical Hand (Conic Hand)': {
    title: 'Conical Hand (Conic Hand)',
    identification: 'Long and thin hand. Fingers are long and taper smoothly forward, with a notably long middle finger. Beautiful fingernails.',
    mentality: 'Deeply desires a luxurious, comfortable life. Highly moody with rapidly fluctuating emotions and low patience. Sun/Mercury creativity (ambiguous clever communication, managing networks, hosting beautifully).',
    struggleOrStrength: 'Attains luxury but struggles to "settle" in foreign environments. Dislikes staying in other people\'s houses (prefers neutral spaces like hotels).',
    modifiers: 'Tapering fingers and beautiful nails. Associated with Sun/Mercury planetary lines.',
  },
  'Philosophical Hand (Knotty Hand)': {
    title: 'Philosophical Hand (Knotty Hand)',
    identification: 'Long and tapering hand similar to Conical, but features prominent, visible knots at the finger joints.',
    mentality: 'Deep analytical/philosophical mind. Abhors mindless entertainment. Message deliverers found in character actors, stand-up comedians, and motivational speakers. Particular about comfort and secretive.',
    struggleOrStrength: 'Very intellectual and precise. Limits their space, preferring quiet corners to remain calm.',
    modifiers: 'Knots do not need to be on all fingers—traits apply specifically to the planet of the knotted finger (e.g., Jupiter or Saturn). Thin-skinned (visible nerves) adds extreme sensitivity. Crooked fingers amplify planetary energy intensely.',
  },
  'Psychic Hand': {
    title: 'Psychic Hand',
    identification: 'Extremely long, delicate, and "super soft." Looks fragile, like the hand of a royal princess or a newborn baby.',
    mentality: 'Highly sensitive, physically and emotionally fragile. Catch colds/coughs easily and have weak digestion. Break easily under pressure if not praised.',
    struggleOrStrength: 'With finger knots: can ascend to the absolute highest levels of spiritual healing. Without finger knots: prone to comfort zone traps, extreme laziness, and chaos under minor routine changes.',
    modifiers: 'Should have very light, fine lines. If a super soft hand has thick, dark lines, it indicates a tragic paradox of a delicate person forced into a harsh, struggling life.',
  },
  'Mixed Hand': {
    title: 'Mixed Hand',
    identification: 'A blend that does not fit one category (e.g. Square palm with Conical fingers).',
    mentality: 'Ultimate multitaskers and full of diverse ideas. Seamlessly blend practicality, emotion, and creativity.',
    struggleOrStrength: 'Versatile and adaptable, but career path cannot be determined by shape alone.',
    modifiers: 'Must identify the major type first, then blend traits. Rely heavily on palm lines and fingerprints for specific career predictions.',
  },
};
