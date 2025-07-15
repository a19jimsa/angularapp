import { vec3 } from 'gl-matrix';
import { Component } from './component';

export class Transform3D extends Component {
  override type: string = 'Transform3D';
  translate: vec3 = vec3.fromValues(0, 0, 0);
  rotation: vec3 = vec3.fromValues(0, 0, 0);
  scale: vec3 = vec3.fromValues(0, 0, 0);
}
