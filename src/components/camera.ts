import { Vec } from '../app/vec';
import { Component } from './component';

export class Camera extends Component {
  override type: string = 'Camera';
  position: Vec;

  constructor() {
    super();
    this.position = new Vec(0, 0);
  }
}
