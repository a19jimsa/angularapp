import { Effect } from 'src/components/effect';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';
import { MathUtils } from 'src/Utils/MathUtils';

export class EffectSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Effect]>('Effect');
    pool.forEach(({ entity, components }) => {
      const [effect] = components;
      this.runAnimation(effect);
    });
  }

  runAnimation(effect: Effect) {
    if (effect.sprites.length <= 0) return;
    const totalDuration =
      ResourceManager.getEffect('hit')[
        ResourceManager.getEffect('hit').length - 1
      ].time;
    const speed = 1000 / 1;
    const elapsedTime = (performance.now() - 1000) / speed;
    const loopedTime = elapsedTime % totalDuration;
    for (const sprite of effect.sprites) {
      for (let i = 0; i < ResourceManager.getEffect('hit').length - 1; i++) {
        const keyframe = ResourceManager.getEffect('hit');
        if (keyframe[i].name === sprite.name) {
          if (
            loopedTime >= keyframe[i].time &&
            loopedTime < keyframe[i + 1].time
          ) {
            const progress =
              (loopedTime - keyframe[i].time) /
              (keyframe[i + 1].time - keyframe[i].time);

            sprite.scaleX = MathUtils.interpolateKeyframe(
              keyframe[i].scale.X,
              keyframe[i + 1].scale.X,
              progress
            );
            sprite.scaleY = MathUtils.interpolateKeyframe(
              keyframe[i].scale.Y,
              keyframe[i + 1].scale.Y,
              progress
            );
          }
        }
      }
    }
  }
}
