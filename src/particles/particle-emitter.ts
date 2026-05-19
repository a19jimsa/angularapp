import { Particle, ParticleProp } from './particle';
import { Component } from 'src/components/component';

export class ParticleEmitter extends Component {
  override type: string = 'ParticleEmitter';
  shaderId: string;
  meshId: string;
  particlePool: Particle[];
  particleProp: ParticleProp;
  poolIndex: number = 0;

  constructor(shaderId: string, meshId: string, amount: number) {
    super();
    this.shaderId = shaderId;
    this.meshId = meshId;
    this.particlePool = [];
    for (let i = 0; i < amount; i++) {
      this.particlePool.push(new Particle());
    }
    console.log(this.particlePool);
    this.particleProp = new ParticleProp();
  }
}
