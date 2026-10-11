import { CuratedDeck } from '@/lib/learningTypes';
import { lecture13Deck } from './13-ju-mount';
import { lecture19Deck } from './19-symbols-life-line-01';

const decksRegistry: Record<string, CuratedDeck> = {
  '13 - JU Mount.md': lecture13Deck,
  '13 - JU Mount': lecture13Deck,
  '13': lecture13Deck,
  '19 - Symbols & Life Line - Part 01.md': lecture19Deck,
  '19 - Symbols & Life Line - Part 01': lecture19Deck,
  '19': lecture19Deck,
};

export function getCuratedDeckForNote(noteId: string): CuratedDeck | null {
  if (!noteId) return null;
  const normalized = noteId.trim().replace(/^notes\//i, '');
  if (decksRegistry[normalized]) return decksRegistry[normalized];
  const withoutExt = normalized.replace(/\.md$/i, '');
  if (decksRegistry[withoutExt]) return decksRegistry[withoutExt];
  const numMatch = normalized.match(/^(\d+)/);
  if (numMatch && decksRegistry[numMatch[1]]) return decksRegistry[numMatch[1]];
  return null;
}

export function hasCuratedDeck(noteId: string): boolean {
  return !!getCuratedDeckForNote(noteId);
}

export { lecture13Deck, lecture19Deck };

