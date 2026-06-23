import { vec3 } from 'gl-matrix';
import { Transform3D } from 'src/components/transform3D';
import { Ecs } from 'src/core/ecs';
import { AnimationPlayerManager } from 'src/resource-manager/animation-player-manager';

export class AnimationPlayerSystem {
  update(ecs: Ecs) {
    const player = AnimationPlayerManager.animationPlayers.get('Init');
    if (!player) return;
    if (!player.playing) return;
    //dt maybe later or fixed time
    player.loopedTime += 0.016;
    const time = player.loopedTime % player.lifetime;
    for (const track of player.tracks) {
      const value = track.evaluate(time);
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
        console.log(value);
        track.target[track.property] = value;
      }
    }
  }
}
