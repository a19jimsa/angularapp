import { Vec } from 'src/app/vec';
import { Component } from './component';

export class HitBox extends Component {
  override type = 'HitBox';
  width: number;
  height: number;
  position: Vec;
  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
    this.position = new Vec(0, 0);
  }
}
