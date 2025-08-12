import { Component } from './component';

export class Water extends Component {
  override type: string = 'Water';
  displacement: number = 1;
  flowSpeed: number = 0.1;
  tiling: number = 1;
}
