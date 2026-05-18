import { vec3 } from 'gl-matrix';
import { Ecs } from 'src/core/ecs';

export type Particle = {
  position: vec3;
  velocity: vec3;
  sizeBegin: number;
  sizeEnd: number;
  rotation: number;
  lifetime: number;
  lifeRemaining: number;
  active: boolean;
};

export class ParticleEmitterSystem {
  public particles: Particle[] = new Array();

  update(ecs: Ecs) {}
}
