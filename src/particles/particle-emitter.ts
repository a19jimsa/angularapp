import { Component } from 'src/components/component';
import { Particle, ParticleProp } from './particle';

export class ParticleEmitter extends Component {
  override type: string = 'ParticleEmitter';
  shaderId: string;
  meshId: string;
  poolIndex: number = 0;
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

  constructor(shaderId: string, meshId: string, maxParticles: number) {
    super();
    this.particles = new Float32Array(maxParticles * 3);
    this.particleProp = new ParticleProp();

    this.shaderId = shaderId;
    this.meshId = meshId;
    this.maxParticles = maxParticles;
    this.amount = 1000;

    this.positionsX = new Float32Array(maxParticles);
    this.positionsY = new Float32Array(maxParticles);
    this.positionsZ = new Float32Array(maxParticles);

    this.velocityX = new Float32Array(maxParticles);
    this.velocityY = new Float32Array(maxParticles);
    this.velocityZ = new Float32Array(maxParticles);

    this.life = new Float32Array(maxParticles);
    this.active = new Uint8Array(maxParticles);

    for (let i = 0; i < maxParticles; i++) {
      const particleProp = new ParticleProp();
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
