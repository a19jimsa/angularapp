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
      if (particleEmitter.emitting) {
        this.emit(particleEmitter);
      }
    }
  }

  spawnSubParticles(particleSubEmitter: ParticleEmitter) {
    //Trigger sub particles
    for (let i = 0; i < particleSubEmitter.amount; i++) {
      this.spawnParticles(particleSubEmitter);
      particleSubEmitter.poolIndex =
        (particleSubEmitter.poolIndex - 1 + particleSubEmitter.maxParticles) %
        particleSubEmitter.maxParticles;
    }
  }

  //Spawn from deadpool with spawninterval depending on lifetime / amount
  emit(particleEmitter: ParticleEmitter) {
    const spawnInterval =
      particleEmitter.particleProp.lifetime / particleEmitter.amount;

    particleEmitter.spawnAccumulator += 0.016;

    if (particleEmitter.explosiveness > 0) {
      if (particleEmitter.spawnAccumulator >= spawnInterval) {
        const amount = particleEmitter.amount * particleEmitter.explosiveness;
        for (let i = 0; i < amount; i++) {
          this.spawnParticles(particleEmitter);
          particleEmitter.spawnAccumulator -= spawnInterval;
        }
      }
    } else {
      if (particleEmitter.spawnAccumulator >= spawnInterval) {
        this.spawnParticles(particleEmitter);
        particleEmitter.spawnAccumulator -= spawnInterval;
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
      particleEmitter.colorR[index] = particleProp.color[0];
      particleEmitter.colorG[index] = particleProp.color[1];
      particleEmitter.colorB[index] = particleProp.color[2];
      particleEmitter.size[index] =
        particleProp.size *
        (1 + (Math.random() * 2 - 1) * particleProp.scaleRandomness);
      particleEmitter.rotationSpeed[index] = 0; // Remove later
      particleEmitter.sizeBegin[index] = particleProp.sizeBegin;
      particleEmitter.sizeEnd[index] = particleProp.sizeEnd;
      particleEmitter.rotationX[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.minRotationX, particleProp.maxRotationX),
      );
      particleEmitter.rotationY[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.minRotationY, particleProp.maxRotationY),
      );
      particleEmitter.rotationZ[index] = MathUtils.degreesToRadians(
        MathUtils.random(particleProp.minRotationZ, particleProp.maxRotationZ),
      );
      value++;
    }
    particleEmitter.poolIndex =
      (particleEmitter.poolIndex - 1 + particleEmitter.maxParticles) %
      particleEmitter.maxParticles;
    return value;
  }
}
