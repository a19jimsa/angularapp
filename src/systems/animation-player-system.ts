import { vec3 } from 'gl-matrix';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { AnimationPlayerManager } from 'src/resource-manager/animation-player-manager';

export class AnimationPlayerSystem {
  update(ecs: Ecs) {
    const player = AnimationPlayerManager.animationPlayers.get('Init');
    if (!player) return;
    if (!player.playing) return;
    player.loopedTime += 0.16;
    const time = player.loopedTime % player.lifetime;
    for (const track of player.tracks) {

      const value = track.evaluate(time);
      if (!value) continue;
      console.log(value);
      const transform = ecs.getComponent<Transform3D>(
        track.entity,
        track.componentID,
      );
      if (
        track.property === 'position' ||
        track.property === 'rotation' ||
        track.property == 'scale'
      ) {
        if (!transform) continue;
        transform[track.property] = value as vec3;
      } else {
        track.target[track.property] = value;
      }
    }
  }
}
