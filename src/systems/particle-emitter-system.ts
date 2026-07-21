import { Ecs } from 'src/core/ecs';
import { ParticleEmitter } from 'src/particles/particle-emitter';
import { MathUtils } from 'src/Utils/MathUtils';

export class ParticleEmitterSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const particleEmitter = ecs.getComponent<ParticleEmitter>(
        entity,
        'ParticleEmitter',
      );
      if (!particleEmitter) continue;
      //Update particles
      for (let i = 0; i < particleEmitter.maxParticles; i++) {
        if (particleEmitter.active[i] === 0) continue;
        if (particleEmitter.age[i] >= particleEmitter.lifetime[i]) {
          particleEmitter.active[i] = 0;
          if (particleEmitter.subEmitter) {
            particleEmitter.subEmitter.particleProp.position[0] =
              particleEmitter.positionsX[i];
            particleEmitter.subEmitter.particleProp.position[1] =
              particleEmitter.positionsY[i];
            particleEmitter.subEmitter.particleProp.position[2] =
              particleEmitter.positionsZ[i];
          }
          continue;
        }
        //Updates all particles
        particleEmitter.positionsX[i] += particleEmitter.velocityX[i];
        particleEmitter.positionsY[i] += particleEmitter.velocityY[i];
        particleEmitter.positionsZ[i] += particleEmitter.velocityZ[i];
        particleEmitter.age[i] += 0.016;
        if (particleEmitter.loop) {
          particleEmitter.age[i] = 0;
        }
      }

      let aliveCount = 0;
      //Fill particle buffer with values
      for (let i = 0; i < particleEmitter.maxParticles; i++) {
        if (particleEmitter.active[i] === 0) continue;
        const j = aliveCount * particleEmitter.stride;
        particleEmitter.particles[j] = particleEmitter.positionsX[i];
        particleEmitter.particles[j + 1] = particleEmitter.positionsY[i];
        particleEmitter.particles[j + 2] = particleEmitter.positionsZ[i];
        particleEmitter.particles[j + 3] = particleEmitter.age[i];
        particleEmitter.particles[j + 4] = particleEmitter.lifetime[i];
        particleEmitter.particles[j + 5] = particleEmitter.colorR[i];
        particleEmitter.particles[j + 6] = particleEmitter.colorG[i];
        particleEmitter.particles[j + 7] = particleEmitter.colorB[i];
        particleEmitter.particles[j + 8] = particleEmitter.size[i];
        particleEmitter.particles[j + 9] = particleEmitter.rotationSpeed[i];
        particleEmitter.particles[j + 10] = particleEmitter.sizeBegin[i];
        particleEmitter.particles[j + 11] = particleEmitter.sizeEnd[i];
        particleEmitter.particles[j + 12] = particleEmitter.rotationX[i];
        particleEmitter.particles[j + 13] = particleEmitter.rotationY[i];
        particleEmitter.particles[j + 14] = particleEmitter.rotationZ[i];
        aliveCount++;
      }
      particleEmitter.aliveCount = aliveCount;
      particleEmitter.spawnAccumulator += 0.016;
      if (particleEmitter.emitting) {
        this.emit(particleEmitter);
      }
      particleEmitter.poolIndex =
        (particleEmitter.poolIndex - 1 + particleEmitter.amount) %
        particleEmitter.amount;
    }
  }

  spawnSubParticles(particleEmitter: ParticleEmitter) {
    //Trigger sub particles
    for (let i = 0; i < particleEmitter.amount; i++) {
      const spawnedParticles = this.spawnParticles(particleEmitter);
      particleEmitter.poolIndex =
        (particleEmitter.poolIndex - 1 + particleEmitter.maxParticles) %
        particleEmitter.maxParticles;
    }
  }

  //Activate particles from the deadpool
  emit(particleEmitter: ParticleEmitter) {
    if (particleEmitter.spawnAccumulator >= particleEmitter.spawnRate) {
      this.spawnParticles(particleEmitter);
      if (particleEmitter.subEmitter) {
        this.spawnSubParticles(particleEmitter.subEmitter);
      }
      particleEmitter.spawnAccumulator -= particleEmitter.spawnRate;
    }
  }

  spawnParticles(particleEmitter: ParticleEmitter) {
    const index = particleEmitter.poolIndex;
    if (particleEmitter.active[index] === 0) {
      const particleProp = particleEmitter.particleProp;
      const position = particleEmitter.shape.spawnPosition();
      particleEmitter.positionsX[index] =
        particleProp.position[0] + position[0];
      particleEmitter.positionsY[index] =
        particleProp.position[1] + position[1];
      particleEmitter.positionsZ[index] =
        particleProp.position[2] + position[2];

      const randVel = MathUtils.random(
        particleProp.velocityMin,
        particleProp.velocityMax,
      );

      const angle = Math.atan2(
        particleProp.direction[1],
        particleProp.direction[0],
      );

      const spreadAngle =
        angle +
        MathUtils.random(-1, 1) *
          MathUtils.degreesToRadians(particleProp.spread);

      const x = Math.cos(spreadAngle);
      const y = Math.sin(spreadAngle);

      particleEmitter.velocityX[index] = x * randVel + particleProp.gravity[0];
      particleEmitter.velocityY[index] = y * randVel + particleProp.gravity[1];
      particleEmitter.velocityZ[index] =
        particleProp.velocity[2] * randVel +
        particleProp.direction[2] +
        particleProp.gravity[2];

      particleEmitter.active[index] = 1;
      particleEmitter.age[index] = 0;
      particleEmitter.lifetime[index] =
        particleProp.lifetime *
        (1 + (Math.random() * 2 - 1) * particleProp.lifetimeRandomness);
      particleEmitter.colorR[index] = particleProp.color[0];
      particleEmitter.colorG[index] = particleProp.color[1];
      particleEmitter.colorB[index] = particleProp.color[2];
      particleEmitter.size[index] =
        particleProp.size *
        (1 + (Math.random() * 2 - 1) * particleProp.scaleRandomness);
      particleEmitter.rotationSpeed[index] = particleProp.rotationSpeed;
      particleEmitter.sizeBegin[index] = particleProp.sizeBegin;
      particleEmitter.sizeEnd[index] = particleProp.sizeEnd;
      particleEmitter.rotationX[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.startRotation, particleProp.endRotation) *
          particleProp.rotation[0],
      );
      particleEmitter.rotationY[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.startRotation, particleProp.endRotation) *
          particleProp.rotation[1],
      );
      particleEmitter.rotationZ[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.startRotation, particleProp.endRotation) *
          particleProp.rotation[2],
      );
      return 1;
    }
    return 0;
  }
}
