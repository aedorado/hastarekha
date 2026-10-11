import { Flashcard } from './flashcards';

export type QuestionType = 'single' | 'multiple' | 'true_false' | 'scenario';

export interface QuizQuestion {
  id: string;
  sourceNoteId: string;
  type: QuestionType;
  subtopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scenario?: string; // Vignette / client presentation context
  question: string;
  options: string[];
  correctAnswer: number | number[]; // 0-indexed: single number for 'single'/'true_false'/'scenario', array of numbers for 'multiple'
  explanation: string; // Comprehensive rationale explaining why the answer is correct and why other choices fail
  practicalTakeaway?: string; // Direct diagnostic tip for practical palmistry consultation
}

export interface CuratedDeck {
  lectureId: string;
  lectureTitle: string;
  summary: string;
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedAnswer: number | number[];
  isCorrect: boolean;
  timestamp: string;
}

export interface QuizProgressState {
  answered: Record<string, QuizAnswerRecord>;
  flaggedForReview: string[];
}
