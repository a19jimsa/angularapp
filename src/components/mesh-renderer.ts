import { VertexArray } from 'src/renderer/vertex-array';
import { Component } from './component';
import { Material } from 'src/renderer/material';

export class MeshRenderer extends Component {
  override type: string = 'MeshRenderer';
  mesh: VertexArray;
  material: Material;

  constructor(mesh: VertexArray, material: Material) {
    super();
    this.mesh = mesh;
    this.material = material;
  }
}
