import { Shader } from 'src/renderer/shader';
import { Component } from './component';

export class Material extends Component {
  override type: string = 'Material';
  program: WebGLProgram;
  texture: WebGLTexture | null;
  slot: number;
  constructor(shader: Shader, texture: WebGLTexture | null, slot: number) {
    super();
    this.program = shader.program;
    this.texture = texture;
    this.slot = slot;
  }
}
