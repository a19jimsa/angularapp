import { Component } from './component';

export type AiStates = 'Idle' | 'Patrol' | 'Chase' | 'Attack';

export class Ai extends Component {
  override type: string = 'Ai';
  state: AiStates;
  detectionRadius: number;
  attackRadius: number;
  cooldown: number;

  constructor(detectionRadius: number, attackRadius: number) {
    super();
    this.state = 'Attack';
    this.detectionRadius = detectionRadius;
    this.attackRadius = attackRadius;
    this.cooldown = 0;
  }
}
