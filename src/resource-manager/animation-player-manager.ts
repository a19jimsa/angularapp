import { AnimationPlayer } from 'src/core/animation-player';

export class AnimationPlayerManager {
  public static animationPlayers: Map<string, AnimationPlayer> = new Map<
    string,
    AnimationPlayer
  >();
}
