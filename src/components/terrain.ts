import { vec3 } from 'gl-matrix';
import { Component } from './component';
import { TextureManager } from 'src/resource-manager/texture-manager';

export class Terrain extends Component {
  override type: string = 'Terrain';
  slot: string;
  tiling: number = 0.0001;
  fogPower: number = 10.0;
  fogColor: vec3 = vec3.fromValues(0, 0, 0);
  size: number;
  heights: Map<number, number>;
  dirty = false;
  meshId: string;
  constructor(slot: string, size: number, meshId: string) {
    super();
    this.slot = slot;
    this.size = size;
    this.heights = new Map();
    this.meshId = meshId;
  }

  serialize() {
    const texture = TextureManager.getTexture(this.slot);
    if (!texture) throw new Error('Could not get Texture of name ' + this.slot);
    return {
      size: this.size,
      tiling: this.tiling,
      fogColor: this.fogColor,
      fogPower: this.fogPower,
      heights: Array.from(this.heights),
      meshId: this.meshId,
      textures: texture.Paths,
    };
  }

  deserialize(terrain: Terrain, component: any) {
    terrain.heights = new Map(component.heights);
    terrain.tiling = component.tiling;
    terrain.fogPower = component.fogPower;
    return terrain;
  }
}
