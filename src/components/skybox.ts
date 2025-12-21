import { Component } from './component';

export class Skybox extends Component {
  override type: string = 'Skybox';
  shader: string;
  slot: number;

  constructor(shader: string, slot: number) {
    super();
    this.shader = shader;
    this.slot = slot;
  }
}
