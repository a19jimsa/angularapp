import { Ingridient } from './ingridient';

export interface Dish {
  name: string;
  ingridients: Ingridient[];
  date: Date;
}
