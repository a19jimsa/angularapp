import { Vec } from '../vec';
import { Component } from './component';

export class Attack extends Component {
  override type = 'Attack';
  damage: number;
  speed: number;
  length: number;
  width: number;
  height: number;
  position: Vec;
  active: boolean = false;

  constructor(
    damage: number,
    speed: number,
    length: number,
    width: number,
    height: number,
    position: Vec
  ) {
    super();
    this.damage = damage;
    this.speed = speed;
    this.length = length;
    this.height = height;
    this.width = width;
    this.position = position;
  }
}
