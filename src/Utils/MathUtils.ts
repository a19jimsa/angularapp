import { HitBox } from 'src/components/hit-box';
import { Bone } from '../components/bone';
import { Skeleton } from '../components/skeleton';
import { Vec } from '../app/vec';
import { HurtBox } from 'src/components/hurt-box';

export class MathUtils {
  static interpolateKeyframe(
    startValue: number,
    endValue: number,
    progress: number
  ) {
    return startValue + (endValue - startValue) * progress;
  }

  static degreesToRadians(degrees: number) {
    const rotationRadians = (degrees * Math.PI) / 180;
    return rotationRadians;
  }

  static radiansToDegrees(radians: number) {
    const rotationDegrees = radians * (Math.PI / 180);
    return rotationDegrees;
  }

  static findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
  }

  static calculateParentPosition(
    position: Vec,
    length: number,
    rotation: number
  ) {
    const x = position.x + length * Math.cos(this.degreesToRadians(rotation));
    const y = position.y + length * Math.sin(this.degreesToRadians(rotation));
    return new Vec(x, y);
  }

  static calculateGlobalRotation(skeleton: Skeleton, bone: Bone): number {
    if (bone.parentId !== null) {
      const parent = this.findBoneById(skeleton.bones, bone.parentId);
      if (parent) {
        // Rekursivt addera förälderns globala rotation
        return this.calculateGlobalRotation(skeleton, parent) + bone.rotation;
      }
    }
    // Om det inte finns någon förälder (root), returnera bara benets egen rotation
    return bone.rotation;
  }

  static isColliding(hitBox: HitBox, hurtBox: HurtBox): boolean {
    return (
      hitBox.position.x + hitBox.width > hurtBox.position.x &&
      hitBox.position.x < hurtBox.position.x + hurtBox.width &&
      hitBox.position.y + hitBox.height > hurtBox.position.y &&
      hitBox.position.y < hurtBox.position.y + hurtBox.height
    );
  }
}
