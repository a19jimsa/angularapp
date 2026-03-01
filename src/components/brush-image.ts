import { vec2 } from 'gl-matrix';
import { Component } from './component';

export class BrushImage extends Component {
  override type: string = 'BrushImage';
  slot: string;
  UV: vec2;
  constructor(slot: string, UV: vec2) {
    super();
    this.slot = slot;
    this.UV = UV;
  }
}
