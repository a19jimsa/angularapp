import { Renderer } from 'src/renderer/renderer';
import { BufferLayout, IndexBuffer, VertexBuffer } from './buffer';

//VAO
export class VertexArray {
  vertexBuffer: VertexBuffer;
  indexBuffer: IndexBuffer;
  VAO: WebGLVertexArrayObject;
  instanceBuffer: WebGLBuffer | undefined;

  constructor(vertices: Float32Array, indices: Uint16Array) {
    const gl = Renderer.getGL;
    this.VAO = gl.createVertexArray();
    this.bind();
    //VBO
    this.vertexBuffer = VertexBuffer.create(vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    //IBO
    this.indexBuffer = IndexBuffer.create(indices);
    if (!this.indexBuffer.buffer) {
      console.error('Error indices');
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    this.unbind();
  }

  addInstanceBuffer(vbl: BufferLayout, instanceVertices: number[]) {
    console.log(vbl);
    const gl = Renderer.getGL;
    gl.bindVertexArray(this.VAO);
    //Instance VBO
    this.instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(instanceVertices),
      gl.DYNAMIC_DRAW,
    );
    for (const element of vbl.elements) {
      gl.enableVertexAttribArray(element.location);
      {
        gl.vertexAttribPointer(
          element.location,
          element.count,
          element.type,
          element.normalized,
          vbl.stride,
          element.offset,
        );
        gl.vertexAttribDivisor(element.location, 1);
      }
    }
    this.unbind();
  }

  addBuffer(vbl: BufferLayout) {
    const gl = Renderer.getGL;
    //VertexArraybind
    this.bind();
    for (const element of vbl.elements) {
      gl.enableVertexAttribArray(element.location);
      {
        gl.vertexAttribPointer(
          element.location,
          element.count,
          element.type,
          element.normalized,
          vbl.stride,
          element.offset,
        );
        gl.vertexAttribDivisor(element.location, 0);
      }
    }
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
