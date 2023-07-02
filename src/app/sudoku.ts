export interface Sudoku {
  value: string;
  active: boolean;
  locked: boolean;
  hidden: boolean;
  block: string;
  blockValue: number;
}
