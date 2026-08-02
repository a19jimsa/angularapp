import { vec3 } from 'gl-matrix';
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
      //Update sub particles
      for (let i = 0; i < particleEmitter.maxParticles; i++) {
        if (particleEmitter.active[i] === 0) continue;
        //On death of particle emitt subparticles
        if (particleEmitter.age[i] >= particleEmitter.lifetime[i]) {
          particleEmitter.active[i] = 0;
          if (particleEmitter.subEmitter) {
            particleEmitter.subEmitter.emitting = true;
            const spawnInterval =
              particleEmitter.particleProp.lifetime / particleEmitter.amount;

            particleEmitter.subEmitter.spawnAccumulator += spawnInterval;
            particleEmitter.subEmitter.particleProp.position[0] =
              particleEmitter.positionsX[i];
            particleEmitter.subEmitter.particleProp.position[1] =
              particleEmitter.positionsY[i];
            particleEmitter.subEmitter.particleProp.position[2] =
              particleEmitter.positionsZ[i];
          }
          continue;
        }

        //Updates all particles positions
        particleEmitter.velocityX[i] += particleEmitter.particleProp.gravity[0];
        particleEmitter.velocityY[i] += particleEmitter.particleProp.gravity[1];
        particleEmitter.velocityZ[i] += particleEmitter.particleProp.gravity[2];
        particleEmitter.positionsX[i] += particleEmitter.velocityX[i];
        particleEmitter.positionsY[i] += particleEmitter.velocityY[i];
        particleEmitter.positionsZ[i] += particleEmitter.velocityZ[i];
        particleEmitter.rotationX[i] += particleEmitter.rotationSpeed[i];
        particleEmitter.rotationY[i] += particleEmitter.rotationSpeed[i];
        particleEmitter.rotationZ[i] += particleEmitter.rotationSpeed[i];

        particleEmitter.age[i] += 0.016;
      }

      let aliveCount = 0;
      //Fill particle buffer with values
      for (let i = 0; i < particleEmitter.maxParticles; i++) {
        if (particleEmitter.active[i] === 0) continue;
        const j = aliveCount * particleEmitter.stride;
        particleEmitter.particles[j] = particleEmitter.positionsX[i];
        particleEmitter.particles[j + 1] = particleEmitter.positionsY[i];
        particleEmitter.particles[j + 2] = particleEmitter.positionsZ[i];
        particleEmitter.particles[j + 3] =
          particleEmitter.age[i] / particleEmitter.lifetime[i];
        particleEmitter.particles[j + 4] = particleEmitter.rotationX[i];
        particleEmitter.particles[j + 5] = particleEmitter.rotationY[i];
        particleEmitter.particles[j + 6] = particleEmitter.rotationZ[i];
        aliveCount++;
      }
      particleEmitter.aliveCount = aliveCount;

      if (particleEmitter.emitting) {
        this.emit(particleEmitter);
      }
    }
  }

  //Spawn from deadpool with spawninterval depending on lifetime / amount
  emit(particleEmitter: ParticleEmitter) {
    const amount = particleEmitter.amount;
    const spawnInterval = particleEmitter.particleProp.lifetime / amount;

    particleEmitter.spawnAccumulator += 0.016;

    if (particleEmitter.spawnAccumulator >= spawnInterval) {
      const spawnAmount =
        Math.floor(particleEmitter.amount * particleEmitter.explosiveness) + 1;
      for (let i = 0; i < spawnAmount; i++) {
        this.spawnParticles(particleEmitter);
        particleEmitter.spawnAccumulator -= spawnInterval;
      }
      if (particleEmitter.oneShot) {
        particleEmitter.emitting = false;
      }
    }
  }

  getFreeParticles(particleEmitter: ParticleEmitter, amount: number) {
    const freeParticles: number[] = [];
    while (freeParticles.length < amount) {
      const index = particleEmitter.poolIndex;
      if (particleEmitter.active[index] === 0) {
        freeParticles.push(index);
        console.log('Added particle index ' + index);
      }
      particleEmitter.poolIndex =
        (particleEmitter.poolIndex - 1 + particleEmitter.maxParticles) %
        particleEmitter.maxParticles;
    }
    return freeParticles;
  }

  applySpread(direction: vec3, spreadDegrees: number): vec3 {
    const spread = MathUtils.degreesToRadians(spreadDegrees);

    // slumpa vinkel inom spread
    const angle = MathUtils.random(-1, 1) * spread;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return vec3.fromValues(
      direction[0] * cos - direction[1] * sin,
      direction[0] * sin + direction[1] * cos,
      direction[2],
    );
  }

  spawnParticles(particleEmitter: ParticleEmitter) {
    const index = particleEmitter.poolIndex;
    let value = 0;
    if (particleEmitter.active[index] === 0) {
      const particleProp = particleEmitter.particleProp;
      const position = particleEmitter.shape.spawnPosition();
      particleEmitter.positionsX[index] =
        particleProp.position[0] + position[0];
      particleEmitter.positionsY[index] =
        particleProp.position[1] + position[1];
      particleEmitter.positionsZ[index] =
        particleProp.position[2] + position[2];

      const direction = this.applySpread(
        particleProp.direction,
        particleProp.spread,
      );

      const speed = MathUtils.random(
        particleProp.velocityMin,
        particleProp.velocityMax,
      );

      particleEmitter.velocityX[index] = direction[0] * speed;
      particleEmitter.velocityY[index] = direction[1] * speed;
      particleEmitter.velocityZ[index] = direction[2] * speed;

      particleEmitter.active[index] = 1;
      particleEmitter.age[index] = 0;
      particleEmitter.lifetime[index] =
        particleProp.lifetime *
        (1 + (Math.random() * 2 - 1) * particleProp.lifetimeRandomness);
      particleEmitter.rotationX[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.minRotationX, particleProp.maxRotationX),
      );
      particleEmitter.rotationY[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.minRotationY, particleProp.maxRotationY),
      );
      particleEmitter.rotationZ[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.minRotationZ, particleProp.maxRotationZ),
      );
      particleEmitter.rotationSpeed[index] = MathUtils.random(
        particleProp.minRotationSpeed,
        particleProp.maxRotationSpeed,
      );
      value++;
    }
    particleEmitter.poolIndex =
      (particleEmitter.poolIndex - 1 + particleEmitter.maxParticles) %
      particleEmitter.maxParticles;
    return value;
  }
}
