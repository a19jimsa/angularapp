import { Component } from './component';

export class Rotation extends Component {
  override type: string = 'Rotation';
  angle: number;
  speed: number;
  constructor() {
    super();
    this.angle = 0;
    this.speed = 0;
  }
}
