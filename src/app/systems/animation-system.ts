import { Bone } from '../components/bone';
import { Skeleton } from '../components/skeleton';
import { Ecs } from '../ecs';
import { MathUtils } from '../Util/MathUtils';

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
              bone.rotation = MathUtils.interpolateKeyframe(
                keyFrame.angle,
                keyframes[i + 1].angle,
                progress
              );
              bone.scale.X = MathUtils.interpolateKeyframe(
                keyFrame.scale.X,
                keyframes[i + 1].scale.X,
                progress
              );
              bone.scale.Y = MathUtils.interpolateKeyframe(
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
        const parent = MathUtils.findBoneById(skeleton.bones, bone.parentId);
        if (parent) {
          parentRotation = MathUtils.calculateGlobalRotation(skeleton, parent);
          bone.position = MathUtils.calculateParentPosition(
            parent.position,
            parent.length * bone.attachAt * parent.scale.Y,
            parentRotation
          );
        }
      }

      bone.globalRotation =
        bone.rotation + parentRotation + bone.globalSpriteRotation;
    }
  }
}
