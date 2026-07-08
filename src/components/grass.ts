import { Component } from './component';

export class Grass extends Component {
  override type: string = 'Grass';
  size: number = 128;
  coords: Uint8ClampedArray = new Uint8ClampedArray();
  alphaCoords: Uint8ClampedArray;
  maxAmount: number = 1000000;
  amount: number = 0;
  index: number = 0;
  meshId: string = 'grass';
  //Max grass per buffer * xyz
  positions: Float32Array = new Float32Array(this.maxAmount * 3);
  constructor(size: number) {
    super();
    this.size = size;
    this.coords = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < this.coords.length; i += 4) {
      this.coords[i + 0] = 0;
      this.coords[i + 1] = 0;
      this.coords[i + 2] = 0;
      this.coords[i + 3] = 0;
    }
    this.alphaCoords = new Uint8ClampedArray(size * size);
  }
}
