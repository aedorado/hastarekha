import { VedicData } from '@/types/palmistry';

export interface DetectedYoga {
  name: string;
  icon: string;
  desc: string;
}

export const getDetectedYogas = (vedicData: VedicData): DetectedYoga[] => {
  const detectedYogas: DetectedYoga[] = [];

  if (vedicData.line_life?.features?.includes('Supportive parallel line')) {
    detectedYogas.push({
      name: 'Supportive / Mars Line',
      icon: '🛡️',
      desc: 'A line running parallel to the Life Line without touching it (Note 21 §2) — distinguished from a Mars line that touches/crosses the Life Line, which the teacher associates with trouble.',
    });
  }

  if (vedicData.line_head?.features?.includes("Writer's Fork (Fork at end)")) {
    detectedYogas.push({
      name: "Writer's Fork (Head Line)",
      icon: '✍️',
      desc: "One branch to Mercury, one to Mars or Moon: multitasking ability, good writer/artist, business mind — but the teacher's explicit caveat is that the mind stays disturbed/not calm despite the multitasking (Note 24 §2.7H).",
    });
  }

  if (vedicData.mount_jupiter?.signs?.includes('Cross')) {
    detectedYogas.push({
      name: 'Cross on Jupiter',
      icon: '💍',
      desc: 'The one place a cross is auspicious (Note 19) — happy marriage and education achievements.',
    });
  }

  if (vedicData.mount_jupiter?.signs?.includes('Square')) {
    detectedYogas.push({
      name: "Teacher's Square on Jupiter",
      icon: '🏫',
      desc: 'Protective square on Jupiter mount — associated with instructional/teaching ability and protection from defamation.',
    });
  }

  if (vedicData.mount_sun?.signs?.includes('Trident')) {
    detectedYogas.push({
      name: 'Trident on Sun Mount',
      icon: '🔱',
      desc: 'Multi-channel fame — renown through more than one path at once.',
    });
  }

  if (vedicData.mount_sun?.signs?.includes('Diamond Chain') || vedicData.line_fate?.signs?.includes('Diamond Chain at end')) {
    detectedYogas.push({
      name: 'Diamond Chain',
      icon: '💎',
      desc: "Wish-fulfilment symbol — the transcript's clearest examples are at the end of the Fate Line or Sun Line (Note 24); doubles that line's result.",
    });
  }

  {
    const canopySign = vedicData.mount_sun?.signs?.includes('Canopy / Circle')
      ? 'Sun Mount'
      : vedicData.line_life?.signs?.includes('Canopy (Circle at end)')
      ? 'Life Line'
      : null;
    if (canopySign) {
      detectedYogas.push({
        name: 'Canopy / Circle',
        icon: '👑',
        desc: `Protective-halo symbol on the ${canopySign}. The transcript's worked example is the Life Line: "whole life is protected" despite its ups and downs (Note 24) — treat the meaning elsewhere as the same protective principle applied to that line/mount, not a separately stated claim.`,
      });
    }
  }

  if (vedicData.line_mercury_present === true && vedicData.line_mercury_joins_moon) {
    detectedYogas.push({
      name: 'Line of Intuition',
      icon: '👁️',
      desc: 'Mercury/Health Line reaching the Moon Mount (Note 27 §9.2) — strong intuition, prophetic dreams.',
    });
  }

  if (vedicData.line_mercury_single_vertical) {
    detectedYogas.push({
      name: 'Single Vertical Line on Mercury Mount',
      icon: '💰',
      desc: 'Sudden money gain (Note 27 §9.5).',
    });
  }

  if (vedicData.line_fate && vedicData.line_head && vedicData.line_mercury_present === true) {
    detectedYogas.push({
      name: 'Dhana kī Koṭhī (Money Room)',
      icon: '🏛️',
      desc: 'Triangle formed by Fate, Head, and Mercury lines (Note 27 §9.5) — capacity to store and grow wealth.',
    });
  }

  if (vedicData.line_marriage?.formations?.includes('Gentle Upward Curve / Upward Branches')) {
    detectedYogas.push({
      name: 'Happy Marital Union (Vivāha Shubha Yoga)',
      icon: '💍',
      desc: 'Gentle upward curving marriage line or upward branches — indication of marital harmony, happiness, and mutual elevation (Lecture 28 §5 #6).',
    });
  }

  if (vedicData.line_marriage?.formations?.includes('Triangle on Line')) {
    detectedYogas.push({
      name: 'Vivāha Trikoṇa (Triangle on Marriage Line)',
      icon: '🔺',
      desc: 'Rare and highly auspicious mark on the Vivāha Rekhā — elevated marital blessing and status (Lecture 28 §5 #12).',
    });
  }

  if (vedicData.line_marriage?.formations?.includes('Reaching Sun Mount') || vedicData.line_marriage?.reaches_sun_mount) {
    detectedYogas.push({
      name: 'Sun-Linked Marriage Yoga',
      icon: '🌟',
      desc: 'Marriage line extending into Sun Mount — spouse brings royal honor, public recognition, fame, and wealth (Lecture 28 §5.3).',
    });
  }

  if (vedicData.line_marriage?.formations?.includes('Sharp Upward Hook')) {
    detectedYogas.push({
      name: 'Nirvivāha Yoga (Lifelong Bachelorhood)',
      icon: '🚫',
      desc: 'Sharp upward hook on Vivāha Rekhā — classical aversion to marriage or lifelong celibacy (Lecture 28 §5 #1).',
    });
  }

  return detectedYogas;
};
