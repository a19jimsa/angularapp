import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Material extends Component {
  override type: string = 'Material';
  ambient = vec3.fromValues(1, 1, 1);
  diffuse = vec3.fromValues(1, 1, 1);
  specular = vec3.fromValues(1, 1, 1);
  shininess: number = 1;
  shaderId: string;
  constructor(shaderId: string) {
    super();
    this.shaderId = shaderId;
  }

  serialize() {
    return {
      ambient: this.ambient,
      diffuse: this.diffuse,
      specular: this.specular,
      shininess: this.shininess,
      shaderId: this.shaderId,
    };
  }

  deserialize(component: Material) {
    const material = new Material(component.shaderId);
    material.ambient = component.ambient;
    material.diffuse = component.diffuse;
    material.specular = component.specular;
    material.shininess = component.shininess;
    return material;
  }
}
