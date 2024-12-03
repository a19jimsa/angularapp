import { Skeleton } from '../components/skeleton';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';
import { ParentBone } from '../components/parent-bone';
import { Vec } from '../vec';
import { Sprite } from '../components/sprite';
import { Transform } from '../components/transform';
import { Rotation } from '../components/rotation';

export class WeaponSystem {
  update(ecs: Ecs, renderer: Renderer) {
    const pool = ecs.getPool<[ParentBone, Transform, Sprite, Rotation]>(
      'ParentBone',
      'Transform',
      'Sprite',
      'Rotation'
    );

    for (const [parentBone, transform, sprite, rotation] of pool) {
      for (const entity of ecs.getEntities()) {
        const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
        if (!skeleton) continue;
        const bone = skeleton.bones.find((e) => e.id === parentBone.boneId);
        if (!bone) continue;

        transform.position = this.calculateParentPosition(
          bone.position,
          bone.length,
          bone.rotation
        );
        rotation.angle = bone.rotation;
        sprite.flip = false;
        if (skeleton.flip) {
          transform.position.X =
            skeleton.position.X + (skeleton.position.X - transform.position.X);
          sprite.flip = true;
        }
        renderer.drawWeapon(sprite, transform, rotation.angle);
      }
    }
  }

  calculateParentPosition(position: Vec, length: number, rotation: number) {
    const xEnd =
      position.X + length * Math.cos(this.degreesToRadians(rotation));
    const yEnd =
      position.Y + length * Math.sin(this.degreesToRadians(rotation));
    return new Vec(xEnd, yEnd);
  }

  degreesToRadians(degrees: number) {
    const rotationRadians = (degrees * Math.PI) / 180;
    return rotationRadians;
  }
}
