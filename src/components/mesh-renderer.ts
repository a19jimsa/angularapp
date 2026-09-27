import { VertexArray } from 'src/renderer/vertex-array';
import { Component } from './component';
import { Material } from 'src/renderer/material';

export class MeshRenderer extends Component {
  override type: string = 'MeshRenderer';
  meshId: string;
  mesh: VertexArray;
  material: Material;
  dirty: boolean = false;

  constructor(meshId: string, mesh: VertexArray, material: Material) {
    super();
    this.meshId = meshId;
    this.mesh = mesh;
    this.material = material;
  }
}
