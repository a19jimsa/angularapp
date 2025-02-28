import { Vec } from 'src/app/vec';

export type Particle = {
  position: Vec;
  velocity: Vec;
  sizeBegin: number;
  sizeEnd: number;
  rotation: number;
  lifetime: number;
  lifeRemaining: number;
  active: boolean;
};

export type ParticleProp = {
  position: Vec;
  velocity: Vec;
  velocityVariation: Vec;
  sizeBegin: number;
  sizeEnd: number;
  sizeVariation: number;
  lifetime: number;
};

export class ParticleSystem {
  particlePool: Particle[] = [];
  poolIndex: number = 999;

  constructor() {
    this.particlePool = new Array(1000).fill(null).map(() => ({
      position: new Vec(0, 0),
      velocity: new Vec(0, 0),
      sizeBegin: 0,
      sizeEnd: 0,
      rotation: 0,
      size: 0,
      lifetime: 1,
      lifeRemaining: 1,
      active: false,
    }));
  }

  onUpdate() {
    for (const particle of this.particlePool) {
      if (!particle.active) {
        continue;
      }
      if (particle.lifeRemaining <= 0) {
        particle.active = false;
        continue;
      }
      particle.lifeRemaining -= 0.16;
      particle.position = particle.position.plus(particle.velocity.times(0.16));
      particle.rotation += 0.01 * 0.16;
    }
  }

  emit(particleProps: ParticleProp) {
    const particle = this.particlePool[this.poolIndex];

    particle.active = true;
    particle.position = particleProps.position;
    particle.rotation = Math.random() * 2 * Math.PI;

    particle.velocity = particleProps.velocity;
    particle.velocity.X = particleProps.velocity.X;
    particle.velocity.Y = particleProps.velocity.Y;

    particle.lifetime = particleProps.lifetime;
    particle.lifeRemaining = particleProps.lifetime;

    particle.sizeBegin =
      particleProps.sizeBegin +
      particleProps.sizeVariation * (Math.random() - 0.5);
    particle.sizeEnd = particleProps.sizeEnd;

    this.poolIndex =
      (this.poolIndex - 1 + this.particlePool.length) %
      this.particlePool.length;
  }
}
