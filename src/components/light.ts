import { vec3 } from 'gl-matrix';
import { Component } from './component';
import { Ecs } from 'src/core/ecs';

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
  direction: vec3;
  color: vec3;

  constructor() {
    super();
    this.lightType = 0;
    this.ambient = vec3.fromValues(1, 1, 1);
    this.diffuse = vec3.fromValues(1, 1, 1);
    this.specular = vec3.fromValues(1, 1, 1);
    this.direction = vec3.fromValues(0, 0, 0);
    this.color = vec3.fromValues(1, 1, 1);
  }

  serialize() {
    return {
      lightType: this.lightType,
      ambient: this.ambient,
      diffuse: this.diffuse,
      specular: this.specular,
      direction: this.direction,
      color: this.color,
    };
  }

  deserialize(ecs: Ecs, component: Light) {
    const entity = ecs.createEntity();
    ecs.addComponent<Light>(entity, component);
  }
}
