import { TextureType } from 'src/renderer/texture';
import { Component } from './component';
import { vec3 } from 'gl-matrix';

export class Material extends Component {
  override type: string = 'Material';
  textureType: TextureType;
  ambient = vec3.fromValues(1, 1, 1);
  diffuse = vec3.fromValues(1, 1, 1);
  specular = vec3.fromValues(1, 1, 1);
  shininess: number = 1;
  shaderId: string;
  constructor(textureType: TextureType, shaderId: string) {
    super();
    this.textureType = textureType;
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
    const material = new Material(component.textureType, component.shaderId);
    material.ambient = component.ambient;
    material.diffuse = component.diffuse;
    material.specular = component.specular;
    material.shininess = component.shininess;
    return material;
  }
}
