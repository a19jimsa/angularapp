import { Vec } from '../app/vec';
import { Component } from './component';

export class Smear extends Component {
  override type: string = 'Smear';
  startPosition: Vec;
  positions: Vec[];

  constructor() {
    super();
    this.startPosition = new Vec(0, 0);
    this.positions = new Array();
  }
}
