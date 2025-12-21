import { vec3 } from 'gl-matrix';
import { Component } from './component';

enum LightType {
  Directional,
  Point,
  Spot,
}

export class Light extends Component {
  override type: string = 'Light';
  lightType: LightType;
  ambient: vec3;
  diffuse: vec3;
  specular: vec3;

  constructor() {
    super();
    this.lightType = 0;
    this.ambient = vec3.fromValues(1, 1, 1);
    this.diffuse = vec3.fromValues(1, 1, 1);
    this.specular = vec3.fromValues(1, 1, 1);
  }
}
