import { Component } from './component';
import { States } from './state';

export class Ai extends Component {
  override type: string = 'Ai';
  state: States;
  detectionRadius: number;
  attackRadius: number;
  cooldown: number;

  constructor(detectionRadius: number, attackRadius: number) {
    super();
    this.state = States.Idle;
    this.detectionRadius = detectionRadius;
    this.attackRadius = attackRadius;
    this.cooldown = 2;
  }
}
