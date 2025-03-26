export interface Buffer {
  bind(): void;
  unbind(): void;
  setData(): void;
}

export class VertexBuffer implements Buffer {
  buffer: WebGLBuffer | null;
  static gl: WebGL2RenderingContext;
  constructor(vertices: Float32Array) {
    const gl = VertexBuffer.gl;
    this.buffer = gl.createBuffer();
    this.bind();
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    this.unbind();
  }

  bind(): void {
    VertexBuffer.gl.bindBuffer(VertexBuffer.gl.ARRAY_BUFFER, this.buffer);
  }
  unbind(): void {
    VertexBuffer.gl.bindBuffer(VertexBuffer.gl.ARRAY_BUFFER, null);
  }
  setData(): void {
    throw new Error('Method not implemented.');
  }

  static create(
    gl: WebGL2RenderingContext,
    vertices: Float32Array
  ): VertexBuffer {
    VertexBuffer.gl = gl;
    return new VertexBuffer(vertices);
  }
}

export class IndexBuffer {
  buffer: WebGLBuffer | null;
  static gl: WebGL2RenderingContext;
  indices: Uint16Array;
  constructor(indices: Uint16Array) {
    this.indices = indices;
    const gl = IndexBuffer.gl;
    this.buffer = gl.createBuffer();
    this.bind();
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    this.unbind();
  }

  bind(): void {
    IndexBuffer.gl.bindBuffer(IndexBuffer.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }
  unbind(): void {
    IndexBuffer.gl.bindBuffer(IndexBuffer.gl.ELEMENT_ARRAY_BUFFER, null);
  }
  setData(): void {
    throw new Error('Method not implemented.');
  }

  getCount(): number {
    return this.indices.length;
  }

  static create(gl: WebGL2RenderingContext, indices: Uint16Array): IndexBuffer {
    IndexBuffer.gl = gl;
    return new IndexBuffer(indices);
  }
}
