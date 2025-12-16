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
  color: vec3;
  position: vec3;

  constructor() {
    super();
    this.lightType = 0;
    this.color = vec3.fromValues(1, 1, 1);
    this.position = vec3.fromValues(0, 0, 0);
  }
}
