import { State } from './state.model';
import { Vec } from './vec.model';

export interface GameObject {
  pos: Vec;
  gravity: number;
  dir: boolean;
  flipPlayer: boolean;
  speed: Vec;
  size: Vec;
  isDead: boolean;
  collide(state: State): State;
  update(time: number, state: State, keys: any): GameObject;
  get type(): string;
}
