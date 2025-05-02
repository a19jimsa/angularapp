import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords = new Uint8ClampedArray();
  constructor(width: number, height: number) {
    super();
    this.coords = new Uint8ClampedArray(width * height * 4);
  }
}
