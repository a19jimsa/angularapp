import { vec3, vec4 } from 'gl-matrix';

export class Particle {
  position: vec3 = vec3.fromValues(0, 0, 0);
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  sizeBegin: number = 0;
  sizeEnd: number = 0;
  rotation: number = 0;
  lifetime: number = 0;
  lifeRemaining: number = 0;
  age: number = 0;
  active: boolean = false;

  constructor() {
    const particleProp = new ParticleProp();
    console.log(particleProp);
    this.active = true;
    this.lifeRemaining = particleProp.lifetime;
    this.lifetime = particleProp.lifetime;
    this.position[0] = particleProp.position[0];
    this.position[1] = particleProp.position[1];
    this.position[2] = particleProp.position[2];
    this.velocity[0] = particleProp.velocity[0];
    this.velocity[1] = particleProp.velocity[1];
    this.velocity[2] = particleProp.velocity[2];
    this.rotation = 0;
    this.sizeBegin = particleProp.sizeBegin;
    this.sizeEnd = particleProp.sizeEnd;
    this.age = 0;
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
  age: number = 0;
}
