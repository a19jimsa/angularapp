import { vec3, vec4 } from 'gl-matrix';

export class Particle {
  position: vec3;
  velocity: vec3;
  sizeBegin: number;
  sizeEnd: number;
  rotation: number;
  lifetime: number;
  lifeRemaining: number;
  active: boolean;
  constructor(particleProp: ParticleProp) {
    this.active = true;
    this.position = vec3.fromValues(0, 0, 0);
    this.position[0] = particleProp.position[0];
    this.position[1] = particleProp.position[1];
    this.position[2] = particleProp.position[2];
    this.velocity = vec3.fromValues(0, 0, 0);
    this.velocity[0] = particleProp.velocity[0];
    this.velocity[1] = particleProp.velocity[1];
    this.velocity[2] = particleProp.velocity[2];
    this.lifetime = particleProp.lifetime;
    this.lifeRemaining = particleProp.lifetime;
    this.sizeBegin =
      particleProp.sizeBegin +
      particleProp.sizeVariation * (Math.random() - 0.5);
    this.sizeEnd = particleProp.sizeEnd;
    this.rotation = 0;
  }
}

export class ParticleProp {
  position: vec3 = vec3.fromValues(0, 0, 0);
  velocity: vec3 = vec3.fromValues(0, -9.8, 0);
  velocityVariation: vec3 = vec3.fromValues(0, 0, 0);
  sizeBegin: number = 1;
  sizeEnd: number = 2;
  sizeVariation: number = 0;
  lifetime: number = 5;
}
