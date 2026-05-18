import { vec3 } from 'gl-matrix';
import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  tiling: number = 0.01;
  fogPower: number = 10.0;
  fogColor: vec3 = vec3.fromValues(0, 0, 0);
  heights: Map<number, number>;
  dirty = false;
  constructor() {
    super();
    this.heights = new Map();
  }

  serialize() {
    return {
      tiling: this.tiling,
      fogColor: this.fogColor,
      fogPower: this.fogPower,
      heights: Array.from(this.heights),
    };
  }

  deserialize(terrain: Terrain, component: any) {
    terrain.heights = new Map(component.heights);
    terrain.tiling = component.tiling;
    terrain.fogPower = component.fogPower;
    return terrain;
  }
}
