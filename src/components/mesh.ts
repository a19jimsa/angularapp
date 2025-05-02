import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';
import { Component } from './component';

export class Mesh extends Component {
  override type: string = 'Mesh';
  vao: WebGLVertexArrayObject | null;
  vertices: Float32Array;
  indices: Uint16Array;

  constructor(
    vao: WebGLVertexArrayObject | null,
    vertices: Float32Array,
    indices: Uint16Array
  ) {
    super();
    this.vao = vao;
    this.vertices = vertices;
    this.indices = indices;
  }
}
