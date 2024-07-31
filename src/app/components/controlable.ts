import { Vec } from '../vec';
import { Component } from './component';

export class Controlable extends Component {
  override type: string = 'Controlable';
  velocity: Vec;
  curl: number;
  isActive: boolean;

  constructor(velocity: Vec, curl: number, isActive: boolean) {
    super();
    this.velocity = velocity;
    this.curl = curl;
    this.isActive = isActive;
  }
}
