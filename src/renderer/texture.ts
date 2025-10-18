import { Shader } from './shader';

export class Texture {
  gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  setUniform(shader: Shader, name: string, slot: number) {
    shader.use();
    this.gl.uniform1i(this.gl.getUniformLocation(shader.program!, name), slot);
  }
}
