import { vec2 } from 'gl-matrix';
import { Component } from './component';

export class BrushImage extends Component {
  override type: string = 'BrushImage';
  UV: vec2 = vec2.fromValues(0, 0);
  layer: number = -1;
}
