import { mat4, vec2, vec3 } from 'gl-matrix';
import { VertexArray } from './vertex-array';

export type Vertex = {
  position: vec3;
  uv: vec2;
  normal: vec3;
};

export class MeshRenderer {
  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  setupMesh(vao: VertexArray) {
    const gl = this.gl;
    vao.bind();
    gl.vertexAttribPointer(
      0,
      3,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(
      1,
      2,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(
      2,
      3,
      gl.FLOAT,
      false,
      8 * Float32Array.BYTES_PER_ELEMENT,
      5 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(2);
    vao.unbind();
  }
}
