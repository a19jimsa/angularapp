import { Bone } from './bone';
import { State } from '../States/state';
import { Component } from './component';
import { Vec } from '../vec';
import { OnGroundState } from '../States/on-ground-state';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  bones: Bone[] = [];
  flip: boolean = false;
  state: State;
  position: Vec;
  startTime: number = 0;
  yPos: number = 0;
  constructor(imageSrc: string) {
    super();
    this.image.src = imageSrc;
    this.position = new Vec(0, 0);
    this.state = new OnGroundState();
  }
}
