import { Renderer } from 'src/renderer/renderer';
import { BufferLayout, IndexBuffer, VertexBuffer } from './buffer';

//VAO
export class VertexArray {
  vertexBuffer: VertexBuffer;
  instanceBuffer: VertexBuffer | undefined;
  indexBuffer: IndexBuffer;
  VAO: WebGLVertexArrayObject;

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

  addInstanceBuffer(instanceVertices: Float32Array) {
    this.bind();
    const gl = Renderer.getGL;
    //Instance VBO
    this.instanceBuffer = VertexBuffer.create(instanceVertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceVertices, gl.DYNAMIC_DRAW);
    this.unbind();
  }

  addBuffer(vbl: BufferLayout) {
    const gl = Renderer.getGL;
    let index = 0;
    //VertexArraybind
    this.bind();
    for (const element of vbl.elements) {
      gl.enableVertexAttribArray(index);
      if (element.isInstanced) {
        console.log(element.count);
        gl.vertexAttribPointer(
          index,
          element.count,
          element.type,
          element.normalized,
          3 * Float32Array.BYTES_PER_ELEMENT,
          0
        );
        gl.vertexAttribDivisor(index, 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
      } else {
        gl.vertexAttribPointer(
          index,
          element.count,
          element.type,
          element.normalized,
          vbl.stride,
          element.offset
        );
        gl.vertexAttribDivisor(index, 0);
      }
      index++;
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
