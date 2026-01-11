import { Renderer } from 'src/renderer/renderer';
import { IndexBuffer, VertexBuffer } from './buffer';

//VAO
export class VertexArray {
  vertexBuffer: VertexBuffer;
  indexBuffer: IndexBuffer;
  VAO: WebGLVertexArrayObject;

  constructor(vertices: Float32Array, indices: Uint16Array) {
    const gl = Renderer.getGL;
    this.VAO = gl.createVertexArray();
    this.bind();
    //VBO
    this.vertexBuffer = VertexBuffer.create(vertices);
    this.vertexBuffer.buffer = gl.createBuffer();
    if (!this.vertexBuffer.buffer) {
      console.error('Error vertex');
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //IBO
    this.indexBuffer = IndexBuffer.create(indices);
    this.indexBuffer.buffer = gl.createBuffer();
    if (!this.indexBuffer.buffer) {
      console.error('Error indices');
    }
    this.indexBuffer.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.unbind();
  }

  bind() {
    const gl = Renderer.getGL;
    gl.bindVertexArray(this.VAO);
  }

  unbind() {
    const gl = Renderer.getGL;
    gl.bindVertexArray(null);
  }

  static create(vertices: Float32Array, indices: Uint16Array) {
    return new VertexArray(vertices, indices);
  }
}
