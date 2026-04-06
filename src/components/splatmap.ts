import { SceneManager } from 'src/scene/scene-manager';
import { Component } from './component';
import { TextureManager } from 'src/resource-manager/texture-manager';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords: Uint8ClampedArray;
  alphaCoords: Uint8ClampedArray;
  size: number;
  dirty: boolean = true;
  slot: string;
  layers: number = -1;
  constructor(size: number, slot: string) {
    super();
    this.size = size;
    this.coords = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < this.coords.length; i += 4) {
      this.coords[i + 0] = 255;
      this.coords[i + 1] = 0;
      this.coords[i + 2] = 0;
      this.coords[i + 3] = 0;
    }
    this.alphaCoords = new Uint8ClampedArray(size * size);
    this.slot = slot;
  }

  serialize() {
    let index = 0;
    for (let i = 0; i < this.coords.length; i += 4) {
      this.alphaCoords[index] = this.coords[i + 3];
      index++;
    }
    const image = SceneManager.convertCoordsToImage(this.size, this.coords);

    return {
      size: this.size,
      img: image,
      alphaCoords: this.alphaCoords,
      slot: this.slot,
    };
  }

  async deserialize(splatmap: Splatmap, component: any) {}
}
