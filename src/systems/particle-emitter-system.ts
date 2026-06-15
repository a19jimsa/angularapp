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
      for (let i = 0; i < particleEmitter.amount; i++) {
        if (particleEmitter.active[i] === 0) continue;
        if (particleEmitter.age[i] >= particleEmitter.lifetime[i]) {
          particleEmitter.active[i] = 0;
          particleEmitter.age[i] = particleEmitter.lifetime[i];
          continue;
        }
        //Updates all particles
        particleEmitter.positionsX[i] += particleEmitter.velocityX[i];
        particleEmitter.positionsY[i] += particleEmitter.velocityY[i];
        particleEmitter.positionsZ[i] += particleEmitter.velocityZ[i];
        particleEmitter.age[i] += 0.016;
      }

      //Create particle buffer
      for (let i = 0; i < particleEmitter.amount; i++) {
        const j = i * 10;
        particleEmitter.particles[j] = particleEmitter.positionsX[i];
        particleEmitter.particles[j + 1] = particleEmitter.positionsY[i];
        particleEmitter.particles[j + 2] = particleEmitter.positionsZ[i];
        particleEmitter.particles[j + 3] = particleEmitter.age[i];
        particleEmitter.particles[j + 4] = particleEmitter.lifetime[i];
        particleEmitter.particles[j + 5] = particleEmitter.colorR[i];
        particleEmitter.particles[j + 6] = particleEmitter.colorG[i];
        particleEmitter.particles[j + 7] = particleEmitter.colorB[i];
        particleEmitter.particles[j + 8] = particleEmitter.size[i];
        particleEmitter.particles[j + 9] = MathUtils.degreesToRadians(
          particleEmitter.rotation[i],
        );
      }
      this.emit(particleEmitter);
      particleEmitter.poolIndex =
        (particleEmitter.poolIndex - 1 + particleEmitter.amount) %
        particleEmitter.amount;
    }
  }

  //Activate particles from the deadpool
  emit(particleEmitter: ParticleEmitter) {
    if (particleEmitter.shape) {
      this.spawnParticles(particleEmitter);
    }
  }

  spawnParticles(particleEmitter: ParticleEmitter) {
    const index = particleEmitter.poolIndex;
    if (particleEmitter.active[index] === 0) {
      const particleProp = particleEmitter.particleProp;
      const randVel =
        particleProp.velocityMin +
        Math.random() * (particleProp.velocityMax - particleProp.velocityMin);
      if (particleEmitter.shape.type === 'Point') {
        particleEmitter.positionsX[index] =
          particleProp.position[0] * particleProp.emissionOffset[0];
        particleEmitter.positionsY[index] =
          particleProp.position[1] * particleProp.emissionOffset[1];
        particleEmitter.positionsZ[index] =
          particleProp.position[2] * particleProp.emissionOffset[2];

        particleEmitter.velocityX[index] =
          particleProp.velocity[0] +
          particleProp.direction[0] +
          particleProp.gravity[0] +
          randVel;
        particleEmitter.velocityY[index] =
          particleProp.velocity[1] +
          particleProp.direction[1] +
          particleProp.gravity[1] +
          randVel;
        particleEmitter.velocityZ[index] =
          particleProp.velocity[2] +
          particleProp.direction[2] +
          particleProp.gravity[2] +
          randVel;
      } else if (particleEmitter.shape.type === 'Ring') {
        const position = particleEmitter.shape.spawnPosition();
        particleEmitter.positionsX[index] =
          particleProp.position[0] + position[0];
        particleEmitter.positionsY[index] =
          particleProp.position[1] + position[1];
        particleEmitter.positionsZ[index] =
          particleProp.position[2] + position[2];

        particleEmitter.velocityX[index] =
          particleProp.velocity[0] +
          particleProp.direction[0] +
          particleProp.gravity[0] +
          randVel;
        particleEmitter.velocityY[index] =
          particleProp.velocity[1] +
          particleProp.direction[1] +
          particleProp.gravity[1] +
          randVel;
        particleEmitter.velocityZ[index] =
          particleProp.velocity[2] +
          particleProp.direction[2] +
          particleProp.gravity[2] +
          randVel;
      }
      particleEmitter.active[index] = 1;
      particleEmitter.age[index] = particleProp.age;
      particleEmitter.lifetime[index] =
        particleProp.lifetime *
        (1 + (Math.random() * 2 - 1) * particleProp.lifetimeRandomness);
      particleEmitter.colorR[index] = particleProp.color[0];
      particleEmitter.colorG[index] = particleProp.color[1];
      particleEmitter.colorB[index] = particleProp.color[2];
      particleEmitter.size[index] = particleProp.size;
      particleEmitter.rotation[index] = MathUtils.random(
        particleProp.minAngle,
        particleProp.maxAngle,
      );
    }
  }
}
