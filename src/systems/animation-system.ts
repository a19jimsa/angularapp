import { Keyframe } from 'src/app/animation-creator/animation-creator.component';
import { MathUtils } from 'src/Utils/MathUtils';
import { Skeleton } from 'src/components/skeleton';
import { Ecs } from 'src/core/ecs';

export class AnimationSystem {
  blendTime = 0;

  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (!skeleton) continue;
      this.sortBonesByHierarchy(skeleton);
      this.updateBonePositions(skeleton);
      if (skeleton.blend) {
        this.blendAnimations(skeleton);
      } else {
        this.runAnimation(skeleton, skeleton.keyframes);
      }
    }
  }

  runAnimation(skeleton: Skeleton, keyframes: Keyframe[]) {
    if (keyframes.length === 0) return;
    const totalDuration = keyframes[keyframes.length - 1].time;
    const speed = 1000 / 1;
    const elapsedTime = (performance.now() - skeleton.startTime) / speed;
    const loopedTime = elapsedTime % totalDuration;
    skeleton.animationDuration = totalDuration;
    for (const bone of skeleton.bones) {
      for (let i = 0; i < keyframes.length - 1; i++) {
        const keyframe = keyframes[i];
        if (loopedTime >= keyframe.time && loopedTime < keyframes[i + 1].time) {
          const progress =
            (loopedTime - keyframe.time) /
            (keyframes[i + 1].time - keyframe.time);

          if (bone.id === keyframe.name) {
            bone.rotation = MathUtils.interpolateKeyframe(
              keyframe.angle,
              keyframes[i + 1].angle,
              progress
            );
            bone.scale.X = MathUtils.interpolateKeyframe(
              keyframe.scale.X,
              keyframes[i + 1].scale.X,
              progress
            );
            bone.scale.Y = MathUtils.interpolateKeyframe(
              keyframe.scale.Y,
              keyframes[i + 1].scale.Y,
              progress
            );
            bone.startX = keyframe.clip.X;
            bone.startY = keyframe.clip.Y;
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

  blendAnimations(skeleton: Skeleton) {
    for (const bone of skeleton.bones) {
      if (skeleton.snapShot) {
        const keyframe = skeleton.snapShot[bone.id];
        if (keyframe) {
          bone.rotation = MathUtils.interpolateKeyframe(
            bone.rotation,
            keyframe.rotation,
            0.1
          );
          bone.scale.X = MathUtils.interpolateKeyframe(
            bone.scale.X,
            keyframe.scale.X,
            0.1
          );
          bone.scale.Y = MathUtils.interpolateKeyframe(
            bone.scale.Y,
            keyframe.scale.Y,
            0.1
          );
          bone.startX = keyframe.clip.X;
          bone.startY = keyframe.clip.Y;
        }
      }
    }
    this.blendTime++;
    if (this.blendTime > 20) {
      this.blendTime = 0;
      skeleton.blend = false;
      skeleton.startTime = performance.now();
      skeleton.snapShot = null;
    }
  }
}
