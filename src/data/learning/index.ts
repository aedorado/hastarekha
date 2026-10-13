import { CuratedDeck } from '@/lib/learningTypes';
import { lecture13Deck } from './13-ju-mount';
import { lecture19Deck } from './19-symbols-life-line-01';
import { lecture20Deck } from './20-symbols-life-line-02';
import { lecture21Deck } from './21-symbols-life-line-03';

const decksRegistry: Record<string, CuratedDeck> = {
  '13 - JU Mount.md': lecture13Deck,
  '13 - JU Mount': lecture13Deck,
  '13': lecture13Deck,
  '19 - Symbols & Life Line - Part 01.md': lecture19Deck,
  '19 - Symbols & Life Line - Part 01': lecture19Deck,
  '19': lecture19Deck,
  '20 - Symbols & Life Line - Part 02.md': lecture20Deck,
  '20 - Symbols & Life Line - Part 02': lecture20Deck,
  '20': lecture20Deck,
  '21 - Symbols & Life Line - Part 03.md': lecture21Deck,
  '21 - Symbols & Life Line - Part 03': lecture21Deck,
  '21': lecture21Deck,
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

export { lecture13Deck, lecture19Deck, lecture20Deck, lecture21Deck };


