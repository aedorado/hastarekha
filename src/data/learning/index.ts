import { CuratedDeck } from '@/lib/learningTypes';
import { lecture13Deck } from './13-ju-mount';

const decksRegistry: Record<string, CuratedDeck> = {
  '13 - JU Mount.md': lecture13Deck,
  '13 - JU Mount': lecture13Deck,
  '13': lecture13Deck,
};

export function getCuratedDeckForNote(noteId: string): CuratedDeck | null {
  if (!noteId) return null;
  const normalized = noteId.trim();
  return decksRegistry[normalized] || null;
}

export function hasCuratedDeck(noteId: string): boolean {
  return !!getCuratedDeckForNote(noteId);
}

export { lecture13Deck };
