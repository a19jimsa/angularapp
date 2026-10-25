import { vec3, vec4 } from 'gl-matrix';
import { Component } from './component';

export class Terrain extends Component {
  override type: string = 'Terrain';
  tiling: number = 0.01;
  fogPower: number = 10.0;
  fogColor: vec3 = vec3.fromValues(0, 0, 0);
  dirty = false;
  width: number;
  depth: number;
  height: number;
  size: number;
  colors: vec4 = vec4.fromValues(0, 1, 2, 3);

  constructor(width: number, depth: number, height: number, size: number) {
    super();
    this.width = width;
    this.depth = depth;
    this.height = height;
    this.size = size;
  }

  serialize() {
    return {
      tiling: this.tiling,
      fogColor: this.fogColor,
      fogPower: this.fogPower,
      dirty: this.dirty,
      width: this.width,
      depth: this.depth,
      height: this.height,
      size: this.size,
    };
  }

  deserialize(terrain: Terrain, component: any) {
    terrain.tiling = component.tiling;
    terrain.fogPower = component.fogPower;
    return terrain;
  }
}
