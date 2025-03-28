import { Vec } from '../app/vec';
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
  order: number;
  attachAt: number;
  scale: Vec;
  globalRotation: number;
  globalSpriteRotation: number;
  hierarchyDepth: number;
  minAngle: number;
  maxAngle: number;

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
    minAngle: number,
    maxAngle: number
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
    this.attachAt = 1;
    this.globalRotation = 0;
    this.globalSpriteRotation = 0;
    this.hierarchyDepth = 0;
    this.scale = new Vec(1, 1);
    this.minAngle = minAngle;
    this.maxAngle = maxAngle;
  }
}
