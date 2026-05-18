import { vec3 } from 'gl-matrix';
import { Particle, ParticleProp } from './particle';
import { Material } from 'src/particles/material';
import { Mesh } from 'src/particles/mesh';

export class ParticleEmitter {
  material: Material;
  mesh: Mesh;
  particlePool: Particle[];
  poolIndex: number = 0;
  particleProp: ParticleProp;

  constructor(shaderId: string, meshId: string, amount: number) {
    this.material = new Material(shaderId);
    this.mesh = new Mesh(meshId);
    this.poolIndex = amount - 1;
    this.particleProp = new ParticleProp();
    this.particlePool = new Array();
    for (let i = 0; i < amount; i++) {
      this.particlePool.push(new Particle(this.particleProp));
    }
  }

  //UPdates all particles
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
      particle.position = vec3.add(
        particle.position,
        particle.position,
        particle.velocity,
      );
      particle.rotation += 0.01 * 0.16;
    }
  }

  //Create new particles
  emit() {
    const particle = this.particlePool[this.poolIndex];

    this.poolIndex =
      (this.poolIndex - 1 + this.particlePool.length) %
      this.particlePool.length;

    if (!particle.active) {
      console.log(this.particleProp);
      particle.active = true;
      particle.lifeRemaining = this.particleProp.lifetime;
      particle.lifetime = this.particleProp.lifetime;
      particle.position[0] =
        this.particleProp.position[0] + Math.random() * 1000;
      particle.position[1] = this.particleProp.position[1];
      particle.position[2] = 9000;
      particle.velocity[0] = this.particleProp.velocity[0];
      particle.velocity[1] = this.particleProp.velocity[1];
      particle.velocity[2] = this.particleProp.velocity[2];
      particle.rotation = 0;
      particle.sizeBegin = this.particleProp.sizeBegin;
      particle.sizeEnd = this.particleProp.sizeEnd;
      particle.velocity = this.particleProp.velocity;
      console.log('Hello');
    }
  }
}
