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
    player.loopedTime = player.loopedTime % player.lifetime;
    for (const track of player.tracks) {
      const value = track.evaluate(player.loopedTime);
      if (value === null) return;
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
        transform[track.property][0] = value[0];
        transform[track.property][1] = value[1];
        transform[track.property][2] = value[2];
      } else {
        console.log(value);
        console.log(player.loopedTime);
        track.target[track.property] = value;
      }
    }
  }
}
