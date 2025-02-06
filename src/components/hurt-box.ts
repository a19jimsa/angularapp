import { Vec } from '../app/vec';
import { Component } from './component';

export class HurtBox extends Component {
  override type: string = 'HurtBox';
  position: Vec;
  width: number;
  height: number;
  constructor() {
    super();
    this.position = new Vec(0, 0);
    this.width = 0;
    this.height = 0;
  }
}
