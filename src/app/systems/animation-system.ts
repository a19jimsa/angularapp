import { Bone } from '../components/bone';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Vec } from '../vec';

export class AnimationSystem {
  startTime = performance.now();
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (!skeleton) continue;
      if (!skeleton.state) continue;
      const keyframes = skeleton.state.keyframes;
      if (keyframes.length === 0) continue;
      const totalDuration = keyframes[keyframes.length - 1].time;
      const speed = 1000 / 1;
      const elapsedTime = (performance.now() - skeleton.startTime) / speed;
      const loopedTime = elapsedTime % totalDuration;
      this.sortBonesByHierarchy(skeleton);
      this.updateBonePositions(skeleton);
      for (const bone of skeleton.bones) {
        for (let i = 0; i < keyframes.length - 1; i++) {
          const keyFrame = keyframes[i];
          if (
            loopedTime >= keyFrame.time &&
            loopedTime < keyframes[i + 1].time
          ) {
            const progress =
              (loopedTime - keyFrame.time) /
              (keyframes[i + 1].time - keyFrame.time);

            if (bone.id === keyFrame.name) {
              bone.rotation = this.interpolateKeyframe(
                keyFrame.angle,
                keyframes[i + 1].angle,
                progress
              );
              bone.scale.Y = this.interpolateKeyframe(
                keyFrame.scale.Y,
                keyframes[i + 1].scale.Y,
                progress
              );
              bone.startX = keyFrame.clip.X;
              bone.startY = keyFrame.clip.Y;
            }
          }
        }
      }
    }
  }

  calculateHierarchyDepth(bone: Bone, bones: Bone[]): number {
    if (!bone.parentId) return 0; // Roten har djup 0
    const parent = bones.find((b) => b.id === bone.parentId);
    if (!parent) throw new Error(`Parent not found for bone ${bone.id}`);
    return this.calculateHierarchyDepth(parent, bones) + 1;
  }

  sortBonesByHierarchy(skeleton: Skeleton): void {
    for (const bone of skeleton.bones) {
      bone.hierarchyDepth = this.calculateHierarchyDepth(bone, skeleton.bones);
    }
    skeleton.bones.sort((a, b) => a.hierarchyDepth - b.hierarchyDepth);
  }

  updateBonePositions(skeleton: Skeleton): void {
    for (const bone of skeleton.bones) {
      let parentRotation = 0;
      if (
        bone.parentId !== null &&
        bone.parentId !== undefined &&
        bone.parentId !== ''
      ) {
        const parent = this.findBoneById(skeleton.bones, bone.parentId);
        if (parent) {
          parentRotation = this.calculateGlobalRotation(skeleton, parent);
          bone.position = this.calculateParentPosition(
            parent.position,
            parent.length * bone.attachAt,
            parentRotation
          );
        }
      }

      bone.globalRotation =
        bone.rotation + parentRotation + bone.globalSpriteRotation;
    }
  }

  calculateGlobalRotation(skeleton: Skeleton, bone: Bone): number {
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

  interpolateKeyframe(startValue: number, endValue: number, progress: number) {
    return startValue + (endValue - startValue) * progress;
  }

  degreesToRadians(degrees: number) {
    const rotationRadians = (degrees * Math.PI) / 180;
    return rotationRadians;
  }

  findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
  }

  calculateParentPosition(position: Vec, length: number, rotation: number) {
    const x = position.X + length * Math.cos(this.degreesToRadians(rotation));
    const y = position.Y + length * Math.sin(this.degreesToRadians(rotation));
    return new Vec(x, y);
  }
}
