import { Renderer } from 'src/renderer/renderer';
import { IndexBuffer, VertexBuffer } from './buffer';
import { Shader } from './shader';

//VAO
export class VertexArray {
  gl: WebGL2RenderingContext;
  vao: WebGLVertexArrayObject;
  vertexBuffer: VertexBuffer;
  indexBuffer: IndexBuffer;

  constructor(vertices: Float32Array, indices: Uint16Array, shader: Shader) {
    this.gl = Renderer.getGL;
    this.vao = this.gl.createVertexArray();
    this.bind();
    this.vertexBuffer = VertexBuffer.create(this.gl, vertices);
    this.vertexBuffer.buffer = this.gl.createBuffer();
    if (!this.vertexBuffer.buffer) {
      console.error('Error vertex');
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    this.indexBuffer = IndexBuffer.create(this.gl, indices);
    this.indexBuffer.buffer = this.gl.createBuffer();
    if (!this.indexBuffer.buffer) {
      console.error('Error indices');
    }
    this.indexBuffer.buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.buffer);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      indices,
      this.gl.STATIC_DRAW
    );
    this.setupMesh(shader);
    this.unbind();
  }

  bind() {
    this.gl.bindVertexArray(this.vao);
  }

  unbind() {
    this.gl.bindVertexArray(null);
  }

  setupMesh(shader: Shader) {
    const gl = this.gl;
    this.gl.bindVertexArray(this.vao);
    const positionLoc = gl.getAttribLocation(shader.program, 'a_position');
    gl.vertexAttribPointer(
      positionLoc,
      3,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(positionLoc);
    const texLocation = gl.getAttribLocation(shader.program, 'a_texcoord');
    gl.vertexAttribPointer(
      texLocation,
      2,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(texLocation);
    const normalLocation = gl.getAttribLocation(shader.program, 'a_normal');
    gl.vertexAttribPointer(
      normalLocation,
      3,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(normalLocation);
    gl.bindVertexArray(null);
    shader.unbind();
  }

  static create(vertices: Float32Array, indices: Uint16Array, shader: Shader) {
    return new VertexArray(vertices, indices, shader);
  }
}
