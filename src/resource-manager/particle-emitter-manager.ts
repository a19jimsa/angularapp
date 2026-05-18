import { ParticleEmitter } from 'src/particles/particle-emitter';

export class ParticleEmitterManager {
  public static emitters: ParticleEmitter[] = [];

  public static add(emitter: ParticleEmitter) {
    this.emitters.push(emitter);
  }

  public static remove(emitter: ParticleEmitter) {
    const index = this.emitters.findIndex((e) => e == emitter);
    this.emitters.splice(index, 1);
  }
}
