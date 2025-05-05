import { VertexArrayBuffer } from 'src/renderer/vertex-array-buffer';
import { Component } from './component';
import { Shader } from 'src/renderer/shader';

export class Skybox extends Component {
  override type: string = 'Skybox';
  vao: VertexArrayBuffer;
  shader: Shader;
  texture: WebGLTexture;

  constructor(vao: VertexArrayBuffer, shader: Shader, texture: WebGLTexture) {
    super();
    this.vao = vao;
    this.shader = shader;
    this.texture = texture;
  }
}
