import { Component } from './component';

export class Rotation extends Component {
  override type: string = 'Rotation';
  angle: number;
  constructor() {
    super();
    this.angle = 0;
  }
}
