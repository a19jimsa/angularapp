import { Vec } from '../app/vec';
import { Component } from './component';

export class Velocity extends Component {
  override type: string = 'Velocity';
  velocity: Vec;

  constructor(velocity: Vec) {
    super();
    this.velocity = velocity;
  }
}
