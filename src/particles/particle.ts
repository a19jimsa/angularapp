import { vec3 } from 'gl-matrix';

export class Particle {
  position: vec3 = vec3.fromValues(0, 0, 0);
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  sizeBegin: number = 1;
  sizeEnd: number = 1;
  rotation: number = 0;
  lifetime: number = 10;
  age: number = 0;
  active: boolean = false;
}

export class ParticleProp {
  position: vec3 = vec3.fromValues(500, 0, 9500);
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  direction: vec3 = vec3.fromValues(0, 0, 0);
  gravity: vec3 = vec3.fromValues(0, 0, 0);
  color: vec3 = vec3.fromValues(0, 0, 0);
  size: number = 1;
  sizeBegin: number = 1;
  sizeEnd: number = 1;
  velocityMin: number = 0;
  velocityMax: number = 0;
  spread: number = 45;
  lifetime: number = 1;
  lifetimeRandomness: number = 0;
  age: number = 0;
  emissionOffset: vec3 = vec3.fromValues(1, 1, 1);
  emissionScale: vec3 = vec3.fromValues(0, 0, 0);
  randomness: number = 0;
  rotation: number = 0;
  minAngle: number = 0;
  maxAngle: number = 0;
}
