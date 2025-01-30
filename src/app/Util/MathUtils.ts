import { Bone } from '../components/bone';
import { Skeleton } from '../components/skeleton';
import { Vec } from '../vec';

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

  static findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
  }

  static calculateParentPosition(
    position: Vec,
    length: number,
    rotation: number
  ) {
    const x = position.X + length * Math.cos(this.degreesToRadians(rotation));
    const y = position.Y + length * Math.sin(this.degreesToRadians(rotation));
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
}
