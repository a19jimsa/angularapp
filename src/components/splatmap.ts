import { SceneManager } from 'src/scene/scene-manager';
import { Component } from './component';

export class Splatmap extends Component {
  override type: string = 'Splatmap';
  coords: Uint8ClampedArray;
  alphaCoords: Uint8ClampedArray;
  size: number;
  dirty: boolean = true;
  slot: string;
  layers: number = -1;
  tiles = new Float32Array([0, 0, 1, 0, 2, 0, 3, 0]);
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
    return {
      size: this.size,
      path: SceneManager.convertCoordsToImage(this.size, this.coords),
      alphaCoords: this.alphaCoords,
      tiles: Array.from(this.tiles),
      slot: this.slot,
    };
  }

  async deserialize(splatmap: Splatmap, component: any) {
    // const image = await TextureManager.loadImage(
    //   '/assets/textures/texture_map.jpg',
    // );
    // const name = 'textureMap';
    // const texture = TextureManager.createAndBindTexture(
    //   name,
    //   image,
    //   image.width,
    //   image.height,
    // );
    // splatmap.tiles = component.tiles;
    // splatmap.coords = await SceneManager.convertImageToCoords(component.path)!;
    // splatmap.alphaCoords = component.alphaCoords;
    // let index = 0;
    // for (let i = 0; i < splatmap.coords.length; i += 4) {
    //   splatmap.coords[i + 3] = splatmap.alphaCoords[index];
    //   index++;
    // }
    // const splatmapTexture = TextureManager.createAndBindTexture(
    //   splatmap.slot,
    //   null,
    //   splatmap.size,
    //   splatmap.size,
    // );
    // console.log(splatmapTexture);
    // splatmap.dirty = true;
    // return splatmap;
  }
}
