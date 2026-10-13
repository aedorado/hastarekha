const fs = require('fs');
const path = require('path');

const files = [
  { name: 'Lecture 13', file: '13-ju-mount.ts' },
  { name: 'Lecture 19', file: '19-symbols-life-line-01.ts' },
  { name: 'Lecture 20', file: '20-symbols-life-line-02.ts' },
  { name: 'Lecture 21', file: '21-symbols-life-line-03.ts' },
];

console.log('=== HASTAREKHA CURATED LEARNING DECKS AUDIT ===\n');

let totalCards = 0;
let totalQuizzes = 0;
let hasError = false;

for (const { name, file } of files) {
  const filePath = path.join(__dirname, '../src/data/learning', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract JSON payload
  const match = content.match(/export const \w+: CuratedDeck = ([\s\S]*?);?\s*$/);
  if (!match) {
    console.error(`  [FAIL] Could not extract deck JSON from ${file}`);
    hasError = true;
    continue;
  }

  let deck;
  try {
    deck = JSON.parse(match[1]);
  } catch (err) {
    // If there is trailing semicolon or formatting, eval safely
    try {
      deck = eval('(' + match[1] + ')');
    } catch (e) {
      console.error(`  [FAIL] Parse error for ${file}:`, e.message);
      hasError = true;
      continue;
    }
  }

  console.log(`Auditing ${name} (${deck.lectureTitle}):`);
  console.log(`- Flashcards: ${deck.flashcards.length}`);
  console.log(`- Quiz Questions: ${deck.quizzes.length}`);

  totalCards += deck.flashcards.length;
  totalQuizzes += deck.quizzes.length;

  // Check unique flashcard fronts
  const cardFronts = new Set();
  const cardDuplicates = [];
  for (const card of deck.flashcards) {
    const key = card.front.trim().toLowerCase();
    if (cardFronts.has(key)) {
      cardDuplicates.push(card.front);
    }
    cardFronts.add(key);

    if (card.front.includes('Drill #') || card.front.includes('(Card ')) {
      console.error(`  [FAIL] Cloned card pattern detected: "${card.front.substring(0, 40)}..."`);
      hasError = true;
    }
  }

  if (cardDuplicates.length > 0) {
    console.error(`  [FAIL] Found ${cardDuplicates.length} duplicate flashcards!`);
    hasError = true;
  } else {
    console.log(`  [PASS] All flashcards 100% unique.`);
  }

  // Check unique quiz questions
  const quizQuestions = new Set();
  const quizDuplicates = [];
  for (const q of deck.quizzes) {
    const key = q.question.trim().toLowerCase();
    if (quizQuestions.has(key)) {
      quizDuplicates.push(q.question);
    }
    quizQuestions.add(key);

    if (q.question.includes('Drill #') || q.question.includes('(Q ')) {
      console.error(`  [FAIL] Cloned quiz pattern detected: "${q.question.substring(0, 40)}..."`);
      hasError = true;
    }

    if (!q.options || q.options.length < 2) {
      console.error(`  [FAIL] Question has < 2 options: ${q.id}`);
      hasError = true;
    }

    if (Array.isArray(q.correctAnswer)) {
      for (const idx of q.correctAnswer) {
        if (idx < 0 || idx >= q.options.length) {
          console.error(`  [FAIL] Invalid answer index ${idx} in question ${q.id}`);
          hasError = true;
        }
      }
    } else {
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        console.error(`  [FAIL] Invalid answer index ${q.correctAnswer} in question ${q.id}`);
        hasError = true;
      }
    }
  }

  if (quizDuplicates.length > 0) {
    console.error(`  [FAIL] Found ${quizDuplicates.length} duplicate questions!`);
    hasError = true;
  } else {
    console.log(`  [PASS] All quiz questions 100% unique.`);
  }

  console.log('');
}

console.log('--------------------------------------------------');
console.log(`TOTAL FLASHCARDS ACROSS SYSTEM: ${totalCards}`);
console.log(`TOTAL QUIZ QUESTIONS ACROSS SYSTEM: ${totalQuizzes}`);

if (hasError) {
  console.error('\nAUDIT COMPLETED WITH FAILURES.');
  process.exit(1);
} else {
  console.log('\nAUDIT PASSED PERFECTLY: ALL CONTENT IS 100% UNIQUE & HIGH-YIELD!');
}
