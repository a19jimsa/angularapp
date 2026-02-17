import { SceneManager } from 'src/scene/scene-manager';
import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords: Uint8ClampedArray;
  size: number;
  dirty: boolean = true;
  slot: string;
  tiles = new Float32Array([0, 0, 1, 0, 2, 0, 3, 0]);
  constructor(size: number, slot: string) {
    super();
    this.size = size;
    this.coords = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < this.coords.length; i += 4) {
      this.coords[i + 0] = 255;
    }
    this.slot = slot;
  }

  serialize() {
    return {
      size: this.size,
      path: SceneManager.convertCoordsToImage(this.size, this.coords),
      tiles: Array.from(this.tiles),
      slot: this.slot,
    };
  }
}
