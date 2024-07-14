import { Vec } from './vec.model';

export interface GameObject {
  create(pos: Vec): GameObject;
}
