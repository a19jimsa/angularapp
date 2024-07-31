import { Component } from './component';

export class Rotation extends Component {
  override type: string;
  rotation: number;
  angle: number;
  constructor() {
    super();
    this.type = 'Rotation';
    this.rotation = 0;
    this.angle = 0;
  }
}
