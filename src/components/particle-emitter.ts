import { Component } from './component';

export class ParticleEmitter extends Component {
  override type: string = 'ParticleEmitter';
  shaderId: string;

  constructor(shaderId: string) {
    super();
    this.shaderId = shaderId;
  }
}
