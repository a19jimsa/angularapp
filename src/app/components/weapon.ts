import { Vec } from '../vec';
import { Component } from './component';

export class Weapon extends Component {
  override type = 'Weapon';
  position: Vec;

  constructor() {
    super();
    this.position = new Vec(0, 0);
  }
}
