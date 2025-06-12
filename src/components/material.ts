import { Shader } from 'src/renderer/shader';
import { Component } from './component';

export class Material extends Component {
  override type: string = 'Material';
  shader: Shader;
  texture: WebGLTexture | null;
  slot: number;
  constructor(shader: Shader, texture: WebGLTexture | null, slot: number) {
    super();
    this.shader = shader;
    this.texture = texture;
    this.slot = slot;
  }
}
