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
  position: vec3 = vec3.fromValues(0, 0, 0);
  angleMin: number = 0;
  angleMax: number = 0;
  velocity: vec3 = vec3.fromValues(0, 0, 0);
  direction: vec3 = vec3.fromValues(0, 0, 0);
  angularVelocity: vec3 = vec3.fromValues(0, 0, 0);
  spread: number = 45;
  initialVelocityMin: number = 0;
  initialVelocityMax: number = 0;
  gravity: vec3 = vec3.fromValues(0, 0, 0);
  color: vec3 = vec3.fromValues(0, 0, 0);
  rotation: vec3 = vec3.fromValues(0, 0, 0);
  minRotationX: number = 0;
  maxRotationX: number = 0;
  minRotationY: number = 0;
  maxRotationY: number = 0;
  minRotationZ: number = 0;
  maxRotationZ: number = 0;
  minScale: number = 0;
  maxScale: number = 0;
  scaleRandomness: number = 0;
  size: number = 1;
  sizeBegin: number = 1;
  sizeEnd: number = 1;
  velocityMin: number = 0;
  velocityMax: number = 0;
  lifetime: number = 1;
  lifetimeRandomness: number = 0;
  age: number = 0;
  emissionOffset: vec3 = vec3.fromValues(1, 1, 1);
  emissionScale: vec3 = vec3.fromValues(0, 0, 0);
}
