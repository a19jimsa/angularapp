import { Ecs } from 'src/core/ecs';
import { ParticleProp } from 'src/particles/particle';
import { ParticleEmitter } from 'src/particles/particle-emitter';

export class ParticleEmitterSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const particleEmitter = ecs.getComponent<ParticleEmitter>(
        entity,
        'ParticleEmitter',
      );
      if (!particleEmitter) continue;
      for (let i = 0; i < particleEmitter.maxParticles; i++) {
        if (particleEmitter.active[i] === 0) continue;
        if (particleEmitter.life[i] <= 0) {
          particleEmitter.active[i] = 0;
          continue;
        }
        //Updates all particles
        particleEmitter.positionsX[i] += particleEmitter.velocityX[i];
        particleEmitter.positionsY[i] += particleEmitter.velocityY[i];
        particleEmitter.positionsZ[i] += particleEmitter.velocityZ[i];
        particleEmitter.life[i] -= 0.16;
      }
      for (let i = 0; i < particleEmitter.maxParticles; i++) {
        const j = i * 3;

        particleEmitter.particles[j] = particleEmitter.positionsX[i];
        particleEmitter.particles[j + 1] = particleEmitter.positionsY[i];
        particleEmitter.particles[j + 2] = particleEmitter.positionsZ[i];
      }
      this.emit(particleEmitter);
    }
  }

  //Create new particles
  emit(particleEmitter: ParticleEmitter) {
    const index = particleEmitter.poolIndex;
    if (particleEmitter.active[index] === 0) {
      const particleProp = new ParticleProp();
      particleEmitter.active[index] = 1;
      particleEmitter.positionsX[index] = particleProp.position[0];
      particleEmitter.positionsY[index] = particleProp.position[1];
      particleEmitter.positionsZ[index] = particleProp.position[2];
      particleEmitter.velocityX[index] = particleProp.velocity[0];
      particleEmitter.velocityY[index] = particleProp.velocity[1];
      particleEmitter.velocityZ[index] = particleProp.velocity[2];
      particleEmitter.life[index] = 10;
    }

    particleEmitter.poolIndex =
      (particleEmitter.poolIndex - 1 + particleEmitter.amount) %
      particleEmitter.amount;
  }
}
