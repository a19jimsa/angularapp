import { mat4, vec3 } from 'gl-matrix';

export class Shader {
  gl: WebGL2RenderingContext;
  //Can not be null then no shader are loaded into program and exection fails.
  program!: WebGLProgram;
  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;
    this.program = program;
  }

  //Use program
  bind() {
    this.gl.useProgram(this.program);
  }

  unbind() {
    this.gl.useProgram(null);
  }

  getUniformLocation(name: string) {
    if (!this.program) throw new Error('Program is not defined!');
    return this.gl.getUniformLocation(this.program!, name);
  }

  setUniformMat4(name: string, matrix: mat4) {
    this.gl.uniformMatrix4fv(this.getUniformLocation(name), false, matrix);
  }

  setInt(program: WebGLProgram, name: string, x: number) {
    const location = this.gl.getUniformLocation(program, name);
    this.gl.uniform1i(location, x);
  }

  setVec3(name: string, value: vec3) {
    this.gl.uniform3fv(this.getUniformLocation(name), value);
  }

  setFloat(name: string, value: number) {
    this.gl.uniform1f(this.getUniformLocation(name), value);
  }

  setMaterialTexture(name: string, slot: number) {
    this.gl.uniform1i(this.getUniformLocation(name), slot);
  }
}
