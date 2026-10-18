import { VertexArray } from 'src/renderer/vertex-array';
import { Component } from './component';
import { Material } from 'src/renderer/material';
import { Shader } from 'src/renderer/shader';

export class MeshRenderer extends Component {
  override type: string = 'MeshRenderer';
  meshId: string;
  mesh: VertexArray;
  material: Material;
  shader: Shader;
  dirty: boolean = false;

  constructor(
    meshId: string,
    mesh: VertexArray,
    material: Material,
    shader: Shader,
  ) {
    super();
    this.meshId = meshId;
    this.mesh = mesh;
    this.material = material;
    this.shader = shader;
  }
}
