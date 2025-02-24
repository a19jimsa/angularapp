import { Keyframe } from 'src/app/animation-creator/animation-creator.component';
import { MathUtils } from 'src/Utils/MathUtils';
import { Skeleton } from 'src/components/skeleton';
import { Ecs } from 'src/core/ecs';

export class AnimationSystem {
  startTime = performance.now();
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (!skeleton) continue;
      this.runAnimation(skeleton, skeleton.keyframes);
    }
  }

  runAnimation(skeleton: Skeleton, keyframes: Keyframe[]) {
    if (keyframes.length === 0) return;
    const timer = keyframes.at(-1)?.time;
    if (timer) {
      skeleton.animationDuration = timer;
    }
    const totalDuration = keyframes[keyframes.length - 1].time;
    const speed = 1000 / 1;
    const elapsedTime = (performance.now() - skeleton.startTime) / speed;
    const loopedTime = elapsedTime % totalDuration;
    this.sortBonesByHierarchy(skeleton);
    this.updateBonePositions(skeleton);
    for (const bone of skeleton.bones) {
      for (let i = 0; i < keyframes.length - 1; i++) {
        const keyFrame = keyframes[i];
        if (loopedTime >= keyFrame.time && loopedTime < keyframes[i + 1].time) {
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

  sortBonesByHierarchy(skeleton: Skeleton): void {
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
