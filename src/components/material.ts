import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Material extends Component {
  override type: string = 'Material';
  shader: string;
  slot: string;
  ambient = vec3.fromValues(1, 1, 1);
  diffuse = vec3.fromValues(1, 1, 1);
  specular = vec3.fromValues(1, 1, 1);
  shininess: number = 30;
  constructor(shader: string, slot: string) {
    super();
    this.shader = shader;
    this.slot = slot;
  }
}
