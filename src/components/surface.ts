import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Surface extends Component {
  override type: string = 'Surface';
  ambient = vec3.fromValues(1, 1, 1);
  diffuse = vec3.fromValues(1, 1, 1);
  specular = vec3.fromValues(1, 1, 1);
  shininess: number = 1;
}
