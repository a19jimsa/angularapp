import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  vertices: number[];
  indices: number[];
  //To be used later for different stride and offset in vertices
  stride: number = 8;
  offset: number = 4;
  //Starts with 1 then add when more meshes are copied in to distinguish correct offset not to add to many meshes.
  meshId: number = 0;
  dirty: boolean = false;

  constructor(vertices: number[], indices: number[], meshId: number) {
    super();
    this.vertices = vertices;
    this.indices = indices;
    this.meshId = meshId;
  }
}
