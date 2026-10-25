import { Component } from './component';
import { Material } from 'src/renderer/material';
import { Shader } from 'src/renderer/shader';

export class MeshRenderer extends Component {
  override type: string = 'MeshRenderer';
  meshId: string;
  material: Material;
  shader: Shader;
  dirty: boolean = false;

  constructor(
    meshId: string,
    material: Material,
    shader: Shader,
  ) {
    super();
    this.meshId = meshId;
    this.material = material;
    this.shader = shader;
  }
}
