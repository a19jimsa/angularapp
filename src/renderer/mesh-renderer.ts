import { mat4, vec2, vec3 } from 'gl-matrix';
import { VertexArrayBuffer } from './vertex-array-buffer';
import { Shader } from './shader';

export type Vertex = {
  position: vec3;
  normal: vec2;
  texture: vec2;
};

export class MeshRenderer {
  gl: WebGL2RenderingContext;
  vao: VertexArrayBuffer;
  shader: Shader;

  constructor(
    gl: WebGL2RenderingContext,
    vertices: Float32Array,
    indices: Uint16Array,
    shader: Shader
  ) {
    this.gl = gl;
    this.vao = new VertexArrayBuffer(gl, vertices, indices);
    this.shader = shader;
    if (this.vao === null) {
      console.error('Vao is null!');
    }
    this.setupMesh(shader);
  }

  private setupMesh(shader: Shader) {
    const gl = this.gl;
    shader.use();
    this.vao.bind();
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
    this.vao.unbind();
    gl.useProgram(null);
  }
}
