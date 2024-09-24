import { Vec } from '../vec';
import { Component } from './component';

export class Joint extends Component {
  override type: string = 'Joint';
  id: string;
  parentId: string | null;
  position: Vec;
  rotation: number;
  angles: number[] = [];
  lengths: number[] = [];
  color: string;
  constructor(
    id: string,
    parentId: string | null,
    rotation: number,
    lengths: number[],
    angles: number[],
    color: string
  ) {
    super();
    this.id = id;
    this.parentId = parentId;
    this.position = new Vec(0, 0);
    this.rotation = rotation;
    this.color = color;
    this.lengths = lengths;
    this.angles = angles;
  }
}
