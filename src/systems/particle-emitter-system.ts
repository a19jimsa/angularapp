import { vec3 } from 'gl-matrix';
import { Ecs } from 'src/core/ecs';
import { ParticleEmitter } from 'src/particles/particle-emitter';

export class ParticleEmitterSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const particleEmitter = ecs.getComponent<ParticleEmitter>(
        entity,
        'ParticleEmitter',
      );
      if (!particleEmitter) continue;
      //Updates all particles
      for (const particle of particleEmitter.particlePool) {
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
      this.emit(particleEmitter);
    }
  }

  //Create new particles
  emit(particleEmitter: ParticleEmitter) {
    const particle = particleEmitter.particlePool[particleEmitter.poolIndex];

    if (!particle.active) {
      console.log(particleEmitter.particleProp);
      particle.active = true;
      particle.lifeRemaining = particleEmitter.particleProp.lifetime;
      particle.lifetime = particleEmitter.particleProp.lifetime;
      particle.position[0] = particleEmitter.particleProp.position[0];
      particle.position[1] = particleEmitter.particleProp.position[1];
      particle.position[2] = particleEmitter.particleProp.position[2];
      particle.velocity[0] = particleEmitter.particleProp.velocity[0];
      particle.velocity[1] = particleEmitter.particleProp.velocity[1];
      particle.velocity[2] = particleEmitter.particleProp.velocity[2];
      particle.rotation = 0;
      particle.sizeBegin = particleEmitter.particleProp.sizeBegin;
      particle.sizeEnd = particleEmitter.particleProp.sizeEnd;
      particle.velocity = particleEmitter.particleProp.velocity;
    }
    particleEmitter.poolIndex =
      (particleEmitter.poolIndex - 1 + particleEmitter.particlePool.length) %
      particleEmitter.particlePool.length;
  }
}
