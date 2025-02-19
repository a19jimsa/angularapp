import { Entity } from 'src/app/entity';
import { Component } from './component';

export class Target extends Component {
  override type: string = 'Target';
  player: Entity;

  constructor(player: Entity) {
    super();
    this.player = player;
  }
}
