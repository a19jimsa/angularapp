import { Component } from 'src/components/component';
import { Particle, ParticleProp } from './particle';
import { vec2, vec3 } from 'gl-matrix';

interface Shape {
  type: string;
  offset: vec3;
  scale: vec3;
  spawnPosition(): vec3;
}

export class RingShape implements Shape {
  type: string = 'Ring';
  offset: vec3 = vec3.fromValues(0, 0, 0);
  scale: vec3 = vec3.fromValues(0, 0, 0);
  radius: number = 0;
  height: number = 0;
  innerRadius: number = 0;

  spawnPosition() {
    const out = vec3.fromValues(0, 0, 0);
    const angle = Math.random() * Math.PI * 2;

    const r = this.radius + (Math.random() - 0.5) * 10;

    out[0] = Math.cos(angle) * r;
    out[1] = 0;
    out[2] = Math.sin(angle) * r;
    return out;
  }
}

export class Point implements Shape {
  type: string = 'Point';
  offset: vec3 = vec3.fromValues(0, 0, 0);
  scale: vec3 = vec3.fromValues(1, 1, 1);
  spawnPosition() {
    const out = vec3.fromValues(0, 0, 0);
    return out;
  }
}

export class ParticleEmitter extends Component {
  override type: string = 'ParticleEmitter';
  shaderId: string;
  meshId: string;
  poolIndex: number = 1;
  amount: number;
  particles: Float32Array;
  particleProp: ParticleProp;
  burst: number;
  timer: number = 0;
  speed: vec2 = vec2.fromValues(0, 0);
  shape: Shape = new Point();

  maxParticles: number;

  positionsX: Float32Array;
  positionsY: Float32Array;
  positionsZ: Float32Array;

  velocityX: Float32Array;
  velocityY: Float32Array;
  velocityZ: Float32Array;

  colorR: Float32Array;
  colorG: Float32Array;
  colorB: Float32Array;

  rotation: Float32Array;

  age: Float32Array;
  size: Float32Array;
  lifetime: Float32Array;
  active: Uint8Array;

  constructor(shaderId: string, meshId: string, amount: number) {
    super();
    this.maxParticles = 10000;
    this.particles = new Float32Array(10000 * 9);
    this.particleProp = new ParticleProp();

    this.shaderId = shaderId;
    this.meshId = meshId;
    this.amount = amount;
    this.burst = 0;

    this.positionsX = new Float32Array(this.maxParticles);
    this.positionsY = new Float32Array(this.maxParticles);
    this.positionsZ = new Float32Array(this.maxParticles);

    this.velocityX = new Float32Array(this.maxParticles);
    this.velocityY = new Float32Array(this.maxParticles);
    this.velocityZ = new Float32Array(this.maxParticles);

    this.age = new Float32Array(this.maxParticles);
    this.lifetime = new Float32Array(this.maxParticles);

    this.size = new Float32Array(this.maxParticles);
    this.rotation = new Float32Array(this.maxParticles);

    this.colorR = new Float32Array(this.maxParticles);
    this.colorG = new Float32Array(this.maxParticles);
    this.colorB = new Float32Array(this.maxParticles);

    this.active = new Uint8Array(this.maxParticles);
  }
}
