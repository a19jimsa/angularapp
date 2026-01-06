import { vec3 } from 'gl-matrix';
import { Component } from './component';

export class BatchRenderable extends Component {
  override type: string = 'BatchRenderable';
  width: number;
  height: number;
  scale: vec3;
  texture: string;

  constructor(width: number, height: number, scale: vec3, texture: string) {
    super();
    this.width = width;
    this.height = height;
    this.scale = scale;
    this.texture = texture;
  }
}
