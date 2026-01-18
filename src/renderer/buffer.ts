import { Renderer } from './renderer';

type BufferElement = {
  location: number; //aPosition,a_normals etc
  type: GLenum; // gl.FLOAT, gl.INT, gl.UNSIGNED_BYTE, etc
  count: number; // antal komponenter, t.ex. 3 för vec3
  normalized: boolean;
  offset: number; // byte-offset i vertex-strukturen,
  isInstanced: boolean;
};

export class BufferLayout {
  public elements: BufferElement[] = [];
  public stride = 0;

  add(
    location: number,
    type: GLenum,
    count: number,
    normalized = false,
    isInstanced = false,
  ) {
    const offset = this.stride;
    this.elements.push({
      location,
      type,
      count,
      normalized,
      offset,
      isInstanced,
    });

    this.stride += count * this.getSizeOfType(type);
    console.log('Added to buffer element' + type);
  }

  private getSizeOfType(type: GLenum): number {
    const gl = Renderer.getGL;
    switch (type) {
      case gl.FLOAT:
        return 4;
      case gl.INT:
        return 4;
      case gl.UNSIGNED_INT:
        return 4;
      case gl.SHORT:
        return 2;
      case gl.UNSIGNED_SHORT:
        return 2;
      case gl.BYTE:
        return 1;
      case gl.UNSIGNED_BYTE:
        return 1;
      default:
        throw new Error(`Unknown buffer element type: ${type}`);
    }
  }
}

//VBO
export class VertexBuffer {
  vertices: Float32Array;
  buffer: WebGLBuffer | null;
  constructor(vertices: Float32Array) {
    const gl = Renderer.getGL;
    this.vertices = new Float32Array(vertices);
    this.buffer = gl.createBuffer();
  }
  setData(): void {
    throw new Error('Method not implemented.');
  }

  static create(vertices: Float32Array): VertexBuffer {
    return new VertexBuffer(vertices);
  }
}

//IBO
export class IndexBuffer {
  buffer: WebGLBuffer | null;
  indices: Uint16Array;
  constructor(indices: Uint16Array) {
    this.indices = new Uint16Array(indices);
    const gl = Renderer.getGL;
    this.buffer = gl.createBuffer();
  }
  setData(): void {
    throw new Error('Method not implemented.');
  }

  getCount(): number {
    return this.indices.length;
  }

  static create(indices: Uint16Array): IndexBuffer {
    return new IndexBuffer(indices);
  }
}
