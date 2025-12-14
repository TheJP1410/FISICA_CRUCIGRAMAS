export type Topic = 
  | 'TERMODINÁMICA'
  | 'TEMPERATURA'
  | 'ONDAS'
  | 'MAS'
  | 'FLUIDOS'
  | 'ELASTICIDAD';

export interface CrosswordWord {
  answer: string;
  clue: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  number: number;
}

export interface CrosswordData {
  title: string;
  words: CrosswordWord[];
}

export interface CellData {
  row: number;
  col: number;
  char: string | null; // The correct character, null if block
  userChar: string; // What user typed
  number: number | null; // The clue number if this is a start
  isActive: boolean; // Is part of the puzzle
  isCorrect?: boolean; // For validation state
  isError?: boolean; // For validation state
  relatedWords: number[]; // Indices of words in the 'words' array that use this cell
}
