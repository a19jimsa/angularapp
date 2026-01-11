import { mat4, vec3 } from 'gl-matrix';
import { Renderer } from './renderer';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { BufferLayout } from './buffer';

export class Shader {
  gl: WebGL2RenderingContext;
  //Can not be null then no shader are loaded into program and exection fails.
  program: WebGLProgram;
  layout: BufferLayout;
  constructor(program: WebGLProgram, layout: BufferLayout) {
    this.gl = Renderer.getGL;
    this.program = program;
    this.layout = layout;
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

  setMaterialTexture(locationName: string, slotName: string) {
    const gl = this.gl;
    const location = this.getUniformLocation(locationName);
    const slot = TextureManager.getSlot(slotName);
    if (slot === -1) {
      console.log('Slot is wrong! ' + slotName);
    }
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, TextureManager.getTexture(slotName));
    gl.uniform1i(location, slot); // koppla uniform till samma slot
  }
}
