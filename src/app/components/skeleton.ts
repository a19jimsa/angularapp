import { Bone } from './bone';
import { StateMachine } from '../States/state-machine';
import { Component } from './component';
import { Joint } from './joint';
import { Vec } from '../vec';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  joints: Joint[] = [];
  bones: Bone[] = [];
  flip: boolean = false;
  state!: StateMachine | null;
  position: Vec;
  activeAnimation: boolean;
  startTime: number = performance.now();
  constructor(imageSrc: string) {
    super();
    this.image.src = imageSrc;
    this.position = new Vec(0, 0);
    this.activeAnimation = false;
  }
}
