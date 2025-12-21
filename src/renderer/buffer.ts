export interface Buffer {
  bind(): void;
  unbind(): void;
  setData(): void;
}

//VBO
export class VertexBuffer implements Buffer {
  vertices: Float32Array;
  buffer: WebGLBuffer | null;
  gl: WebGL2RenderingContext;
  constructor(gl: WebGL2RenderingContext, vertices: Float32Array) {
    this.gl = gl;
    this.vertices = new Float32Array(vertices);
    this.buffer = gl.createBuffer();
  }

  bind(): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  }
  unbind(): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  setData(): void {
    throw new Error('Method not implemented.');
  }

  static create(
    gl: WebGL2RenderingContext,
    vertices: Float32Array
  ): VertexBuffer {
    return new VertexBuffer(gl, vertices);
  }
}

//IBO
export class IndexBuffer {
  buffer: WebGLBuffer | null;
  indices: Uint16Array;
  gl: WebGL2RenderingContext;
  constructor(gl: WebGL2RenderingContext, indices: Uint16Array) {
    this.indices = new Uint16Array(indices);
    this.gl = gl;
    this.buffer = gl.createBuffer();
  }

  bind(): void {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }
  unbind(): void {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }
  setData(): void {
    throw new Error('Method not implemented.');
  }

  getCount(): number {
    return this.indices.length;
  }

  static create(gl: WebGL2RenderingContext, indices: Uint16Array): IndexBuffer {
    return new IndexBuffer(gl, indices);
  }
}
