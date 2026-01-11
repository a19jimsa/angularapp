import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Material extends Component {
  override type: string = 'Material';
  slot: string;
  ambient = vec3.fromValues(1, 1, 1);
  diffuse = vec3.fromValues(1, 1, 1);
  specular = vec3.fromValues(1, 1, 1);
  shininess: number = 30;
  shaderId: string;
  constructor(slot: string, shaderId: string) {
    super();
    this.slot = slot;
    this.shaderId = shaderId;
  }
}
