import { Component } from './component';

export class Water extends Component {
  override type: string = 'Water';
  scale: number = 0;
  constructor(scale: number) {
    super();
    this.scale = scale;
  }
}
