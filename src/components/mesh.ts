import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  vao: WebGLVertexArrayObject | null;
  buffer: WebGLBuffer | null;
  vertices: Float32Array;
  indices: Uint16Array;

  constructor(
    vao: WebGLVertexArrayObject | null,
    buffer: WebGLBuffer | null,
    vertices: Float32Array,
    indices: Uint16Array
  ) {
    super();
    this.vao = vao;
    this.buffer = buffer;
    this.vertices = vertices;
    this.indices = indices;
  }
}
