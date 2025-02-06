import { Component } from './component';

export class HitBox extends Component {
  override type = 'HitBox';
  width: number;
  height: number;
  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
  }
}
