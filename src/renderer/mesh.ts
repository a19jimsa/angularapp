import { mat4, vec2, vec3 } from 'gl-matrix';
import { VertexArrayBuffer } from './vertex-array-buffer';
import { Texture } from './texture';
import { Shader } from './shader';
import { PerspectiveCamera } from './perspective-camera';
import { OrtographicCamera } from './orthographic-camera';

export type Vertex = {
  position: vec3;
  normal: vec2;
  texture: vec2;
};

export class Mesh {
  gl: WebGL2RenderingContext;
  vao: VertexArrayBuffer;
  texture: WebGLTexture;
  shader: Shader;

  constructor(
    gl: WebGL2RenderingContext,
    vertices: Float32Array,
    indices: Uint16Array,
    texture: WebGLTexture,
    shader: Shader
  ) {
    this.gl = gl;
    this.vao = new VertexArrayBuffer(gl, vertices, indices);
    this.texture = texture;
    this.shader = shader;
    this.setupMesh(shader);
  }

  private setupMesh(shader: Shader) {
    const gl = this.gl;
    const positionLoc = gl.getAttribLocation(shader.program, 'a_position');
    gl.vertexAttribPointer(
      positionLoc,
      3,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      0
    );
    gl.enableVertexAttribArray(positionLoc);
    const texLocation = gl.getAttribLocation(shader.program, 'a_texcoord');
    gl.vertexAttribPointer(
      texLocation,
      2,
      gl.FLOAT,
      false,
      5 * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT
    );
    gl.enableVertexAttribArray(texLocation);
  }

  translate(x: number, y: number, z: number) {
    const model = mat4.create();
    mat4.translate(model, model, vec3.fromValues(x, y, z));
    this.shader.uploadUniformMat4('u_model', model);
  }

  draw(camera: PerspectiveCamera | OrtographicCamera) {
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.shader.use();
    const location = this.gl.getUniformLocation(
      this.shader.program,
      'u_matrix'
    );
    this.gl.uniformMatrix4fv(location, false, camera.getViewProjectionMatrix());
    this.vao.bind();
    this.gl.drawElements(
      this.gl.TRIANGLES,
      this.vao.indexBuffer.getCount(),
      this.gl.UNSIGNED_SHORT,
      0
    );
    this.vao.unbind();
  }
}
