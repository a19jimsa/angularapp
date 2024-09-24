import { Vec } from '../vec';
import { Bone } from './bone';

export class Weapon extends Bone {
  override type = 'Weapon';
  width: number;
  height: number;

  constructor(
    id: string,
    parentId: string,
    pivot: Vec,
    length: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    jointRotation: number,
    width: number,
    height: number
  ) {
    super(
      id,
      parentId,
      pivot,
      length,
      startX,
      startY,
      endX,
      endY,
      jointRotation
    );
    this.width = width;
    this.height = height;
  }
}
