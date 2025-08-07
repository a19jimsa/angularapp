import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';
import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  vao: WebGLVertexArrayObject | null;
  buffer: WebGLBuffer | null;
  vertices: Float32Array;
  indices: Uint16Array;
  //To be used later for different stride and offset in vertices
  stride: number = 8;
  offset: number = 4;
  //Starts with 1 then add when more meshes are copied in to distinguish correct offset not to add to many meshes.
  id: number = 1;

  constructor(vao: VertexArrayBuffer) {
    super();
    this.vao = vao.vao;
    this.buffer = vao.vertexBuffer.buffer;
    this.vertices = vao.vertexBuffer.vertices;
    this.indices = vao.indexBuffer.indices;
  }
}
