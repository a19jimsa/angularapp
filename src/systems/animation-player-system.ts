import { vec3 } from 'gl-matrix';
import { Animation } from 'src/components/animation';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';

export class AnimationPlayerSystem {
  update(ecs: Ecs, dt: number) {
    for (const entity of ecs.getEntities()) {
      const anim = ecs.getComponent<Animation>(entity, 'Animation');
      if (!anim) continue;

      anim.time += dt;

      const transform = ecs.getComponent<Transform3D>(entity, 'Transform3D');

      if (!transform) continue;

      for (const track of anim.tracks) {
        const value = track.sample(anim.time);

        switch (track.type) {
          case 'position':
            transform.position = value as vec3;
            break;

          case 'rotation':
            transform.rotation = value as vec3;
            break;

          case 'scale':
            transform.scale = value as vec3;
            break;
        }
      }
    }
  }
}
