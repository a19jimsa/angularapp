import { Component } from './component';

export class Material extends Component {
  override type: string = 'Material';
  program: WebGLProgram;
  texture: WebGLTexture;
  slot: number;
  constructor(program: WebGLProgram, texture: WebGLTexture, slot: number) {
    super();
    this.program = program;
    this.texture = texture;
    this.slot = slot;
  }
}
