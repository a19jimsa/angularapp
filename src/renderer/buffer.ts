export interface Buffer {
  bind(): void;
  unbind(): void;
  setData(): void;
}

export class VertexBuffer implements Buffer {
  vertices: Float32Array;
  buffer: WebGLBuffer | null;
  gl: WebGL2RenderingContext;
  constructor(gl: WebGL2RenderingContext, vertices: Float32Array) {
    this.gl = gl;
    this.vertices = vertices;
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

export class IndexBuffer {
  buffer: WebGLBuffer | null;
  indices: Uint16Array;
  gl: WebGL2RenderingContext;
  constructor(gl: WebGL2RenderingContext, indices: Uint16Array) {
    this.indices = indices;
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

export class NormalBuffer implements Buffer {
  gl: WebGL2RenderingContext;
  normals: Float32Array;
  buffer: WebGLBuffer | null;
  constructor(gl: WebGL2RenderingContext, normals: Float32Array) {
    this.gl = gl;
    this.normals = normals;
    this.buffer = gl.createBuffer();
  }

  bind(): void {
    throw new Error('Method not implemented.');
  }
  unbind(): void {
    throw new Error('Method not implemented.');
  }
  setData(): void {
    throw new Error('Method not implemented.');
  }

  static create(
    gl: WebGL2RenderingContext,
    normals: Float32Array
  ): NormalBuffer {
    return new NormalBuffer(gl, normals);
  }
}
