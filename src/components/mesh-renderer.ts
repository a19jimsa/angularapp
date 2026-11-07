import { Component } from './component';
import { Material } from 'src/renderer/material';
import { Shader } from 'src/renderer/shader';

export class MeshRenderer extends Component {
  override type: string = 'MeshRenderer';
  meshId: string;
  textureIds: string[];
  material: Material;
  shader: Shader;
  dirty: boolean = false;

  constructor(
    meshId: string,
    textureIds: string[],
    material: Material,
    shader: Shader,
  ) {
    super();
    this.meshId = meshId;
    this.textureIds = textureIds;
    this.material = material;
    this.shader = shader;
  }
}
