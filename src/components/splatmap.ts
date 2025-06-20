import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords = new Uint8ClampedArray();
  width: number;
  height: number;
  slot: number;
  texture: WebGLTexture;
  constructor(
    width: number,
    height: number,
    texture: WebGLTexture,
    slot: number
  ) {
    super();
    this.width = width;
    this.height = height;
    this.coords = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < this.coords.length; i += 4) {
      this.coords[i + 0] = 255;
    }
    this.slot = slot;
    this.texture = texture;
  }
}
