import { Vec } from '../app/vec';
import { Component } from './component';

export class Transform extends Component {
  override type = 'Transform';
  position: Vec;
  velocity: Vec;
  radius: number;
  mass: number;

  constructor(position: Vec, velocity: Vec, radius: number) {
    super();
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.mass = 1;
  }
}
