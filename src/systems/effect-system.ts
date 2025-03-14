import { Effect } from 'src/components/effect';

import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';
import { MathUtils } from 'src/Utils/MathUtils';

export class EffectSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Effect]>('Effect');
    pool.forEach(({ entity, components }) => {
      const [effect] = components;
      if (!effect.isAlive) return;
      this.runAnimation(effect);
    });
  }

  runAnimation(effect: Effect) {
    if (effect.sprites.length <= 0) return;
    const totalDuration = ResourceManager.getEffect(effect.effectType)[
      ResourceManager.getEffect(effect.effectType).length - 1
    ].time;
    const speed = 1000 / 1;
    const elapsedTime = (performance.now() - effect.startTime) / speed;
    const loopedTime = elapsedTime % totalDuration;
    if (elapsedTime >= effect.duration) {
      effect.isAlive = false;
      return;
    }
    if (effect)
      for (const sprite of effect.sprites) {
        for (
          let i = 0;
          i < ResourceManager.getEffect(effect.effectType).length - 1;
          i++
        ) {
          const keyframe = ResourceManager.getEffect(effect.effectType);
          if (keyframe[i].name === sprite.name) {
            if (
              loopedTime >= keyframe[i].time &&
              loopedTime < keyframe[i + 1].time
            ) {
              const progress =
                (loopedTime - keyframe[i].time) /
                (keyframe[i + 1].time - keyframe[i].time);

              if (sprite.name === keyframe[i].name) {
                if (keyframe[i].position) {
                  sprite.position.x = MathUtils.interpolateKeyframe(
                    keyframe[i].position.x,
                    keyframe[i + 1].position.x,
                    progress
                  );
                  sprite.position.y = MathUtils.interpolateKeyframe(
                    keyframe[i].position.y,
                    keyframe[i + 1].position.y,
                    progress
                  );
                }

                sprite.rotation = MathUtils.interpolateKeyframe(
                  keyframe[i].angle,
                  keyframe[i + 1].angle,
                  progress
                );
                sprite.scaleX = MathUtils.interpolateKeyframe(
                  keyframe[i].scale.x,
                  keyframe[i + 1].scale.x,
                  progress
                );
                sprite.scaleY = MathUtils.interpolateKeyframe(
                  keyframe[i].scale.y,
                  keyframe[i + 1].scale.y,
                  progress
                );
                sprite.startX = keyframe[i].clip.startX;
                sprite.startY = keyframe[i].clip.startY;
                sprite.endX = keyframe[i].clip.endX;
                sprite.endY = keyframe[i].clip.endY;
              }
            }
          }
        }
      }
  }
}
