import { Component } from './component';

export class Stats extends Component {
  override type: string = 'Stats';
  strength: number;
  magic: number;
  stamina: number;
  critical: number;
  stagger: number;
  poise: number;
  defense: number;
  speed: number;
  constructor(
    strength: number,
    magic: number,
    stamina: number,
    critical: number,
    stagger: number,
    poise: number,
    defense: number,
    speed: number
  ) {
    super();
    this.strength = strength;
    this.magic = magic;
    this.stamina = stamina;
    this.critical = critical;
    this.stagger = stagger;
    this.poise = poise;
    this.defense = defense;
    this.speed = speed;
  }
}
