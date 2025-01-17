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
  startTime: number = performance.now();
  constructor(imageSrc: string) {
    super();
    this.image.src = imageSrc;
    this.position = new Vec(0, 0);
    this.state = new OnGroundState();
  }
}
