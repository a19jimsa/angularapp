import { Skeleton } from '../components/skeleton';
import { Attack } from '../components/attack';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';
import { Bone } from '../components/bone';
import { Transform } from '../components/transform';

export class AttackSystem {
  update(ecs: Ecs, renderer: Renderer): void {
    for (const entity of ecs.getEntities()) {
      const attack = ecs.getComponent<Attack>(entity, 'Attack');
      if (attack === undefined) continue;
      for (const skeletonEntity of ecs.getEntities()) {
        const skeleton = ecs.getComponent<Skeleton>(skeletonEntity, 'Skeleton');
        if (skeleton === undefined) continue;
        if (entity === skeletonEntity) continue;
        for (const bone of skeleton.bones) {
          if (this.isColliding(attack, bone, renderer)) {
            console.log('Hitted' + bone.id);
            break;
          }
        }
      }
    }
  }

  // Kontrollera om två hitboxar kolliderar (rektangel-baserad kollision)
  isColliding(attack: Attack, bone: Bone, renderer: Renderer): boolean {
    renderer.drawHitBox(attack);
    return (
      attack.position.X < bone.position.X + bone.endX &&
      attack.position.X + attack.width > bone.position.X &&
      attack.position.Y < bone.position.Y + bone.endY &&
      attack.position.Y + attack.height > bone.position.Y
    );
  }
}
