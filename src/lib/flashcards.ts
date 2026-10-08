export interface Flashcard {
  id: string;
  sourceNoteId: string;
  sourceTitle: string;
  category: 'measurement' | 'principle' | 'warning' | 'rule' | 'trait';
  tag: string;
  front: string;
  back: string;
  tip?: string;
}

export interface ReviewProgress {
  cardId: string;
  interval: number; // in repetitions
  easeFactor: number;
  repetitions: number;
  dueDate: string; // ISO string
  lastReviewed: string;
  mastery: 'new' | 'learning' | 'review' | 'mastered';
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/^[>\s#*-]+/, '')
    .trim();
}

/**
 * Dynamically extract high-yield flashcards from raw markdown note content.
 * Parses callout blocks (> [!TIP], > [!WARNING], > [!INFO], > [!CAUTION], > [!SUCCESS]),
 * markdown comparison tables, and list rules.
 */
export function extractFlashcardsFromNote(noteId: string, title: string, content: string): Flashcard[] {
  const cards: Flashcard[] = [];
  const lines = content.split('\n');

  let currentHeading = title;
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Track active section heading
    if (line.startsWith('## ') || line.startsWith('### ')) {
      currentHeading = cleanMarkdown(line);
      i++;
      continue;
    }

    // 1. Parse Callout Boxes: > [!TAG] Title
    const calloutMatch = line.match(/^>\s*\[!([A-Z]+)\]\s*(.*)$/);
    if (calloutMatch) {
      const calloutType = calloutMatch[1].toUpperCase();
      const calloutTitle = calloutMatch[2].trim();
      const bodyLines: string[] = [];

      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const bodyContent = lines[i].trim().replace(/^>\s?/, '');
        if (bodyContent && !bodyContent.startsWith('[!')) {
          bodyLines.push(bodyContent);
        }
        i++;
      }

      const fullBody = bodyLines.join(' ').trim();
      if (fullBody && fullBody.length > 15) {
        let category: Flashcard['category'] = 'principle';
        if (calloutType === 'WARNING' || calloutType === 'CAUTION') category = 'warning';
        else if (calloutType === 'TIP' || calloutType === 'SUCCESS') category = 'rule';

        // Derive meaningful question & answer
        const cleanTitle = cleanMarkdown(calloutTitle || currentHeading);
        const cleanAnswer = cleanMarkdown(fullBody);

        let frontQuestion = '';
        if (calloutType === 'WARNING') {
          frontQuestion = `⚠️ Warning/Caution regarding "${cleanTitle}": What is the classical restriction or risk?`;
        } else if (calloutType === 'TIP') {
          frontQuestion = `💡 Practical Rule: In context of "${cleanTitle}", how is this evaluated or applied?`;
        } else {
          frontQuestion = `Key Concept: What does the Śāstra establish regarding "${cleanTitle}"?`;
        }

        cards.push({
          id: `${noteId}-callout-${cards.length}`,
          sourceNoteId: noteId,
          sourceTitle: title,
          category,
          tag: calloutType,
          front: frontQuestion,
          back: cleanAnswer,
          tip: currentHeading !== cleanTitle ? `Topic: ${currentHeading}` : undefined,
        });
      }
      continue;
    }

    // 2. Parse Markdown Tables (Thresholds, Measurements, Mounts, Lines)
    if (line.startsWith('|') && line.includes('|') && i + 2 < lines.length && lines[i + 1].trim().startsWith('|---')) {
      const headerCols = line.split('|').map(c => cleanMarkdown(c)).filter(Boolean);
      i += 2; // skip header and divider

      let rowIdx = 0;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const rowCols = lines[i].split('|').map(c => cleanMarkdown(c)).filter(Boolean);
        if (rowCols.length >= 2 && headerCols.length >= 2) {
          const colA = rowCols[0];
          const colB = rowCols[1];
          const colC = rowCols[2] || '';

          if (colA && colB) {
            const front = `Measurement / Classification: For "${headerCols[0]}: ${colA}", what is the corresponding ${headerCols[1]}?`;
            const back = colC ? `${colB} — (${colC})` : colB;

            cards.push({
              id: `${noteId}-table-${rowIdx}-${cards.length}`,
              sourceNoteId: noteId,
              sourceTitle: title,
              category: 'measurement',
              tag: 'TABLE',
              front,
              back,
              tip: `Section: ${currentHeading}`,
            });
          }
        }
        rowIdx++;
        i++;
      }
      continue;
    }

    i++;
  }

  return cards;
}

const STORAGE_KEY_PROGRESS = 'hastarekha_srs_progress_v1';

export function getSrsProgress(): Record<string, ReviewProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveCardRating(cardId: string, rating: 'again' | 'hard' | 'good' | 'easy'): ReviewProgress {
  const allProgress = getSrsProgress();
  const current = allProgress[cardId] || {
    cardId,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    dueDate: new Date().toISOString(),
    lastReviewed: new Date().toISOString(),
    mastery: 'new' as const,
  };

  let nextInterval = 1;
  let nextRepetitions = current.repetitions;
  let nextEase = current.easeFactor;
  let nextMastery: ReviewProgress['mastery'] = 'learning';

  if (rating === 'again') {
    nextInterval = 1;
    nextRepetitions = 0;
    nextMastery = 'learning';
  } else if (rating === 'hard') {
    nextInterval = Math.max(1, Math.round(current.interval * 1.2));
    nextEase = Math.max(1.3, nextEase - 0.15);
    nextMastery = 'learning';
  } else if (rating === 'good') {
    nextInterval = current.repetitions === 0 ? 1 : Math.round(current.interval * current.easeFactor);
    nextRepetitions += 1;
    nextMastery = nextRepetitions >= 3 ? 'review' : 'learning';
  } else if (rating === 'easy') {
    nextInterval = current.repetitions === 0 ? 3 : Math.round(current.interval * current.easeFactor * 1.3);
    nextRepetitions += 1;
    nextEase += 0.15;
    nextMastery = 'mastered';
  }

  const now = new Date();
  const nextDueDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);

  const updated: ReviewProgress = {
    cardId,
    interval: nextInterval,
    easeFactor: nextEase,
    repetitions: nextRepetitions,
    dueDate: nextDueDate.toISOString(),
    lastReviewed: now.toISOString(),
    mastery: nextMastery,
  };

  allProgress[cardId] = updated;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(allProgress));
    } catch (e) {
      // storage full
    }
  }

  return updated;
}
