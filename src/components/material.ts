import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Material extends Component {
  override type: string = 'Material';
  shader: string;
  slot: number;
  ambient = vec3.fromValues(1, 1, 1);
  diffuse = vec3.fromValues(1, 1, 1);
  specular = vec3.fromValues(1, 1, 1);
  shininess: number = 1;
  constructor(shader: string, slot: number) {
    super();
    this.shader = shader;
    this.slot = slot;
  }
}
