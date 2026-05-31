import { Component } from 'src/components/component';
import { Particle, ParticleProp } from './particle';

export class ParticleEmitter extends Component {
  override type: string = 'ParticleEmitter';
  shaderId: string;
  meshId: string;
  poolIndex: number = 1;
  amount: number;
  particles: Float32Array;
  particleProp: ParticleProp;

  maxParticles: number;

  positionsX: Float32Array;
  positionsY: Float32Array;
  positionsZ: Float32Array;

  velocityX: Float32Array;
  velocityY: Float32Array;
  velocityZ: Float32Array;

  life: Float32Array;
  active: Uint8Array;

  constructor(shaderId: string, meshId: string, amount: number) {
    super();
    this.maxParticles = 10000;
    this.particles = new Float32Array(10000 * 3);
    this.particleProp = new ParticleProp();

    this.shaderId = shaderId;
    this.meshId = meshId;
    this.amount = amount;

    this.positionsX = new Float32Array(this.maxParticles);
    this.positionsY = new Float32Array(this.maxParticles);
    this.positionsZ = new Float32Array(this.maxParticles);

    this.velocityX = new Float32Array(this.maxParticles);
    this.velocityY = new Float32Array(this.maxParticles);
    this.velocityZ = new Float32Array(this.maxParticles);

    this.life = new Float32Array(this.maxParticles);
    this.active = new Uint8Array(this.maxParticles);

    for (let i = 0; i < amount; i++) {
      const particleProp = this.particleProp;
      this.active[i] = 1;
      this.positionsX[i] = particleProp.position[0];
      this.positionsY[i] = particleProp.position[1];
      this.positionsZ[i] = particleProp.position[2];
      this.velocityX[i] = particleProp.velocity[0];
      this.velocityY[i] = particleProp.velocity[1];
      this.velocityZ[i] = particleProp.velocity[2];
      this.life[i] = 10;
    }
  }
}
