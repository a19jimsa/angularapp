import { Vec } from '../vec';
import { Component } from './component';

export class HitBox extends Component {
  override type = 'HitBox';
  position: Vec;
  width: number;
  height: number;
  constructor(position: Vec, width: number, height: number) {
    super();
    this.position = position;
    this.width = width;
    this.height = height;
  }
}
