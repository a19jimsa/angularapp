import { StateMachine } from '../state-machine';
import { Component } from './component';
import { Joint } from './joint';

export class Skeleton extends Component {
  override type = 'Skeleton';
  image = new Image();
  joints: Joint[] = [];
  stateMachine: StateMachine = new StateMachine();
  constructor(imageSrc: string) {
    super();
    this.image.src = imageSrc;
  }
}
