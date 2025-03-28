import { IndexBuffer, VertexBuffer } from './buffer';

//VAO
export class VertexArrayBuffer {
  gl: WebGL2RenderingContext;
  vao: WebGLVertexArrayObject | null;
  vertexBuffer: VertexBuffer;
  indexBuffer: IndexBuffer;

  constructor(
    gl: WebGL2RenderingContext,
    vertices: Float32Array,
    indices: Uint16Array
  ) {
    this.gl = gl;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vertexBuffer = VertexBuffer.create(gl, vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    this.indexBuffer = IndexBuffer.create(gl, indices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  }

  bind() {
    this.gl.bindVertexArray(this.vao);
  }

  unbind() {
    this.gl.bindVertexArray(null);
  }

  static create(
    gl: WebGL2RenderingContext,
    vertices: Float32Array,
    indices: Uint16Array
  ) {
    return new VertexArrayBuffer(gl, vertices, indices);
  }
}
