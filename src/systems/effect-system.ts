import { Effect } from 'src/components/effect';
import { Transform } from 'src/components/transform';
import { Ecs } from 'src/core/ecs';
import { ResourceManager } from 'src/core/resource-manager';
import { MathUtils } from 'src/Utils/MathUtils';

export class EffectSystem {
  update(ecs: Ecs) {
    const pool = ecs.getPool<[Effect]>('Effect');
    pool.forEach(({ entity, components }) => {
      const [effect] = components;
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      effect.position = transform.position;
      this.runAnimation(effect);
    });
  }

  runAnimation(effect: Effect) {
    if (effect.sprites.length <= 0) return;
    const totalDuration = ResourceManager.getEffect(effect.effectType)[
      ResourceManager.getEffect(effect.effectType).length - 1
    ].time;
    const speed = 1000 / 1;
    const elapsedTime = (performance.now() - 1000) / speed;
    const loopedTime = elapsedTime % totalDuration;
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
                sprite.position.X = MathUtils.interpolateKeyframe(
                  keyframe[i].position.X,
                  keyframe[i + 1].position.X,
                  progress
                );
                sprite.position.Y = MathUtils.interpolateKeyframe(
                  keyframe[i].position.Y,
                  keyframe[i + 1].position.Y,
                  progress
                );
              }

              sprite.rotation = MathUtils.interpolateKeyframe(
                keyframe[i].angle,
                keyframe[i + 1].angle,
                progress
              );
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
