import { vec3 } from 'gl-matrix';
import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  tiling: number = 0.01;
  fogPower: number = 0;
  fogColor: vec3 = vec3.fromValues(0, 0, 0);
  size: number;
  heights: Map<number, number>;
  dirty = false;
  meshId: string;
  constructor(size: number, meshId: string) {
    super();
    this.size = size;
    this.heights = new Map();
    this.meshId = meshId;
  }

  serialize() {
    return {
      size: this.size,
      tiling: this.tiling,
      fogColor: this.fogColor,
      fogPower: this.fogPower,
      heights: Array.from(this.heights),
      meshId: this.meshId,
    };
  }
}
