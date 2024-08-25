import { Vec } from '../vec';
import { Component } from './component';

export class Camera extends Component {
  override type: string = 'Camera';
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
  position: Vec;

  constructor(
    width: number,
    height: number,
    maxWidth: number,
    maxHeight: number,
    position: Vec
  ) {
    super();
    this.width = width;
    this.height = height;
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this.position = position;
  }
}
