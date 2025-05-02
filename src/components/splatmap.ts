import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords = new Uint8ClampedArray();
  width: number;
  height: number;
  constructor(width: number, height: number) {
    super();
    this.width = width;
    this.height = height;
    this.coords = new Uint8ClampedArray(width * height * 4);
  }
}
