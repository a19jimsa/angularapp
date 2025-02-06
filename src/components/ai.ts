import { Entity } from '../app/entity';
import { Component } from './component';

export class Ai extends Component {
  override type: string = 'Ai';
  state: 'idle' | 'patrol' | 'chase' | 'attack';
  target: Entity | null;
  detectionRadius: number;
  attackRadius: number;
  cooldown: number;

  constructor(
    state: 'idle' | 'patrol' | 'chase' | 'attack',
    target: Entity | null,
    detectionRadius: number,
    attackRadius: number
  ) {
    super();
    this.state = state;
    this.target = target;
    this.detectionRadius = detectionRadius;
    this.attackRadius = attackRadius;
    this.cooldown = 0;
  }
}
