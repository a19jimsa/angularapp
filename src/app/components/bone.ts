import { Vec } from '../vec';
import { Component } from './component';

export class Bone extends Component {
  override type: string = 'Bone';
  id: string;
  parentId: string | null;
  offsetX: number;
  offsetY: number;
  position: Vec;
  length: number;
  rotation: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;

  constructor(
    id: string,
    parentId: string | null,
    position: Vec,
    offsetX: number,
    offsetY: number,
    length: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) {
    super();
    this.id = id;
    this.parentId = parentId;
    this.position = position;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.length = length;
    this.rotation = 0;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
  }
}
