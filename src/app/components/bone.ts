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
  pivot: Vec;
  offset: Vec;
  order: number;
  attachAt: number;
  flip: boolean;

  globalPosition: Vec;
  globalRotation: number;

  constructor(
    id: string,
    parentId: string | null,
    pivot: Vec,
    length: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    order: number,
    offset: Vec
  ) {
    super();
    this.id = id;
    this.pivot = pivot;
    this.position = new Vec(0, 0);
    this.parentId = parentId;
    this.length = length;
    this.rotation = 0;
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.order = order;
    this.offset = offset;
    this.attachAt = 0;
    this.flip = false;
    this.globalPosition = new Vec(0, 0);
    this.globalRotation = 0;
  }
}
