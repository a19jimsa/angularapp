import { mat4, vec3 } from 'gl-matrix';

export class Shader {
  gl: WebGL2RenderingContext;
  //Can not be null then no shader are loaded into program and exection fails.
  program!: WebGLProgram;
  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;
    this.program = program;
  }

  use() {
    this.gl.useProgram(this.program);
  }

  getUniformLocation(name: string) {
    this.use();
    return this.gl.getUniformLocation(this.program!, name);
  }

  uploadUniformMat4(name: string, matrix: mat4) {
    this.use();
    const location = this.gl.getUniformLocation(this.program!, name);
    if (!location) return;
    this.gl.uniformMatrix4fv(location, false, matrix);
  }

  setInt(program: WebGLProgram, name: string, x: number) {
    const location = this.gl.getUniformLocation(program, name);
    this.gl.uniform1i(location, x);
  }

  setVec3(name: string, value: vec3) {
    this.gl.uniform3fv(this.getUniformLocation(name), value);
  }
}
