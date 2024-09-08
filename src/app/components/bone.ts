import { Vec } from '../vec';
import { Component } from './component';

export class Bone extends Component {
  override type: string = 'Bone';
  id: string;
  parentId: string | null;
  position: Vec;
  length: number;
  rotation: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  flip: boolean;
  color: string;
  offset: Vec;

  constructor(
    id: string,
    parentId: string | null,
    offset: Vec,
    length: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    rotation: number
  ) {
    super();
    this.id = id;
    this.offset = offset;
    this.position = new Vec(0, 0);
    this.parentId = parentId;
    this.length = length;
    this.rotation = rotation;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.flip = false;
    this.color = 'blue';
  }
}
