import { Component } from 'src/components/component';
import { ParticleProp } from './particle';
import { vec2, vec3 } from 'gl-matrix';
import { MathUtils } from 'src/Utils/MathUtils';

export interface SpawnShape {
  type: string;
  offset: vec3;
  scale: vec3;
  spawnPosition(): vec3;
}

export class RingShape implements SpawnShape {
  type: string = 'Ring';
  offset: vec3 = vec3.fromValues(0, 0, 0);
  scale: vec3 = vec3.fromValues(0, 0, 0);
  radius: number = 0;
  height: number = 0;
  innerRadius: number = 0;

  spawnPosition() {
    const angle = Math.random() * Math.PI * 2;

    const r = this.radius + (Math.random() - 0.5) * 10;

    this.offset[0] = Math.cos(angle) * r;
    this.offset[1] = 0;
    this.offset[2] = Math.sin(angle) * r;
    return this.offset;
  }
}

export class PointShape implements SpawnShape {
  type: string = 'Point';
  offset: vec3 = vec3.fromValues(0, 0, 0);
  scale: vec3 = vec3.fromValues(1, 1, 1);
  spawnPosition() {
    return this.offset;
  }
}

export class BoxShape implements SpawnShape {
  type: string = 'Box';
  offset: vec3 = vec3.fromValues(0, 0, 0);
  scale: vec3 = vec3.fromValues(0, 0, 0);
  width: number = 0;
  height: number = 0;
  depth: number = 0;
  spawnPosition(): vec3 {
    this.offset[0] = MathUtils.random(0, this.width);

    this.offset[1] = MathUtils.random(0, this.height);

    this.offset[2] = MathUtils.random(0, this.depth);

    return this.offset;
  }
}

export class ParticleEmitter extends Component {
  override type: string = 'ParticleEmitter';
  shaderId: string;
  meshId: string;
  poolIndex: number = 0;
  amount: number;
  aliveCount: number = 0;
  particles: Float32Array;
  particleProp: ParticleProp;
  spawnAccumulator: number = 0;
  timer: number = 0;
  speed: vec2 = vec2.fromValues(0, 0);
  shape: SpawnShape = new PointShape();
  stride: number;
  explosiveness: number = 0;
  emitting: boolean = true;

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

  rotationX: Float32Array;
  rotationY: Float32Array;
  rotationZ: Float32Array;
  rotationSpeed: Float32Array;

  age: Float32Array;
  size: Float32Array;
  lifetime: Float32Array;
  active: Uint8Array;

  sizeBegin: Float32Array;
  sizeEnd: Float32Array;

  constructor(
    shaderId: string,
    meshId: string,
    amount: number,
    stride: number,
  ) {
    super();
    this.maxParticles = 10000;
    this.stride = stride;
    this.particles = new Float32Array(this.maxParticles * stride);
    this.particleProp = new ParticleProp();

    this.emitting = true;

    this.shaderId = shaderId;
    this.meshId = meshId;
    this.amount = amount;

    this.positionsX = new Float32Array(this.maxParticles);
    this.positionsY = new Float32Array(this.maxParticles);
    this.positionsZ = new Float32Array(this.maxParticles);

    this.velocityX = new Float32Array(this.maxParticles);
    this.velocityY = new Float32Array(this.maxParticles);
    this.velocityZ = new Float32Array(this.maxParticles);

    this.age = new Float32Array(this.maxParticles);
    this.lifetime = new Float32Array(this.maxParticles);

    this.size = new Float32Array(this.maxParticles);

    this.rotationX = new Float32Array(this.maxParticles);
    this.rotationY = new Float32Array(this.maxParticles);
    this.rotationZ = new Float32Array(this.maxParticles);
    this.rotationSpeed = new Float32Array(this.maxParticles);

    this.colorR = new Float32Array(this.maxParticles);
    this.colorG = new Float32Array(this.maxParticles);
    this.colorB = new Float32Array(this.maxParticles);

    this.active = new Uint8Array(this.maxParticles);

    this.sizeBegin = new Float32Array(this.maxParticles);
    this.sizeEnd = new Float32Array(this.maxParticles);
  }
}
