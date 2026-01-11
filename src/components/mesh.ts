import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  vertices: number[];
  indices: number[];
  meshId: string;

  constructor(vertices: number[], indices: number[], meshId: string) {
    super();
    this.vertices = vertices;
    this.indices = indices;
    this.meshId = meshId;
  }
}
