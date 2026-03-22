import { mat4, vec2, vec3 } from 'gl-matrix';
import { Renderer } from './renderer';
import { TextureManager } from 'src/resource-manager/texture-manager';
import { Texture, TextureType } from './texture';

export class Shader {
  //Can not be null then no shader are loaded into program and exection fails.
  //Shader must have program and a layout for buffers.
  program: WebGLProgram;
  constructor(program: WebGLProgram) {
    this.program = program;
  }

  //Use program
  bind() {
    Renderer.getGL.useProgram(this.program);
  }

  unbind() {
    Renderer.getGL.useProgram(null);
  }

  getUniformLocation(name: string) {
    if (!this.program) throw new Error('Program is not defined!');
    return Renderer.getGL.getUniformLocation(this.program!, name);
  }

  setUniformMat4(name: string, matrix: mat4) {
    Renderer.getGL.uniformMatrix4fv(
      this.getUniformLocation(name),
      false,
      matrix,
    );
  }

  setInt(program: WebGLProgram, name: string, x: number) {
    const location = Renderer.getGL.getUniformLocation(program, name);
    Renderer.getGL.uniform1i(location, x);
  }

  setVec2(name: string, value: vec2) {
    Renderer.getGL.uniform2fv(this.getUniformLocation(name), value);
  }

  setVec3(name: string, value: vec3) {
    Renderer.getGL.uniform3fv(this.getUniformLocation(name), value);
  }

  setFloat(name: string, value: number) {
    Renderer.getGL.uniform1f(this.getUniformLocation(name), value);
  }

  setFloatArray(name: string, values: Float32Array) {
    Renderer.getGL.uniform1fv(this.getUniformLocation(name), values);
  }

  setVec2Array(name: string, values: Float32Array) {
    Renderer.getGL.uniform2fv(this.getUniformLocation(name), values);
  }

  setMaterialTexture(
    locationName: string,
    texture: WebGLTexture,
    slot: number,
  ) {
    const gl = Renderer.getGL;
    const location = this.getUniformLocation(locationName);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, slot);
  }

  setMaterialTextureArray(
    locationName: string,
    textureArray: WebGLTexture,
    slot: number,
  ) {
    const gl = Renderer.getGL;
    const location = this.getUniformLocation(locationName);
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, textureArray);
    gl.uniform1i(location, slot);
  }
}
