import { Component } from './component';

export class FlowMap extends Component {
  override type: string = 'FlowMap';
  width: number;
  height: number;
  coords: Uint8ClampedArray;
  slot: string;
  constructor(slot: string) {
    super();
    this.width = 64;
    this.height = 64;
    this.coords = new Uint8ClampedArray(64 * 64 * 4);
    for (let i = 0; i < this.coords.length / 2; i += 4) {
      this.coords[i] = 255;
    }
    this.slot = slot;
  }
}
