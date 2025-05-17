import { AnimatedTexture } from 'src/components/animatedTexture';
import { Ecs } from 'src/core/ecs';

export class MovingTextureSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const movingTexture = ecs.getComponent<AnimatedTexture>(
        entity,
        'AnimatedTexture'
      );
      if (movingTexture) {
      }
    }
  }
}
