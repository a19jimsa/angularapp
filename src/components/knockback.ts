import { Vec } from 'src/app/vec';
import { Component } from './component';

export class Knockback extends Component {
  override type: string = 'Knockback';
  force: Vec;

  constructor(force: Vec) {
    super();
    this.force = force;
  }
}
