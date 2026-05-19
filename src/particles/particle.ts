import { vec3, vec4 } from 'gl-matrix';

export class Particle {
  position: vec3 = vec3.fromValues(0, 0, 0);
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  sizeBegin: number = 0;
  sizeEnd: number = 0;
  rotation: number = 0;
  lifetime: number = 0;
  lifeRemaining: number = 0;
  active: boolean = false;
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
