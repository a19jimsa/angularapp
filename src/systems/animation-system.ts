import { Keyframe } from 'src/app/animation-creator/animation-creator.component';
import { MathUtils } from 'src/Utils/MathUtils';
import { Skeleton } from 'src/components/skeleton';
import { Ecs } from 'src/core/ecs';
import { Vec } from 'src/app/vec';
import { Bone } from 'src/components/bone';
import { Animation } from 'src/components/animation';

export class AnimationSystem {
  update(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const animation = ecs.getComponent<Animation>(entity, 'Animation');
      if (!skeleton) continue;
      this.sortBonesByHierarchy(skeleton);
      this.updateBonePositions(skeleton.bones);
      if (skeleton.blend) {
        this.blendAnimations(skeleton);
      }
      if (!skeleton.blend) {
        this.runAnimation(skeleton, skeleton.keyframes);
      }
    }
  }

  private runAnimation(skeleton: Skeleton, keyframes: Keyframe[]) {
    if (!keyframes) return;
    if (keyframes.length === 0) return;
    const totalDuration = keyframes[keyframes.length - 1].time;
    const speed = 2000 / 1;
    const elapsedTime = (performance.now() - skeleton.startTime) / speed;
    const loopedTime = elapsedTime % totalDuration;
    skeleton.elapsedTime = elapsedTime;
    if (elapsedTime >= skeleton.animationDuration) {
      skeleton.startTime = performance.now();
      return;
    }
    for (const bone of skeleton.bones) {
      for (let i = 0; i < keyframes.length - 1; i++) {
        const keyframe = keyframes[i];
        if (loopedTime >= keyframe.time && loopedTime < keyframes[i + 1].time) {
          const progress =
            (loopedTime - keyframe.time) /
            (keyframes[i + 1].time - keyframe.time);
          if (bone.id === keyframe.name) {
            if (keyframe.position && keyframe.name === 'root') {
              bone.position.x = MathUtils.interpolateKeyframe(
                keyframe.position.x,
                keyframes[i + 1].position.x,
                progress
              );
              bone.position.y = MathUtils.interpolateKeyframe(
                keyframe.position.y,
                keyframes[i + 1].position.y,
                progress
              );
            }
            bone.rotation = MathUtils.interpolateKeyframe(
              keyframe.angle,
              keyframes[i + 1].angle,
              progress
            );
            bone.scale.x = MathUtils.interpolateKeyframe(
              keyframe.scale.x,
              keyframes[i + 1].scale.x,
              progress
            );
            bone.scale.y = MathUtils.interpolateKeyframe(
              keyframe.scale.y,
              keyframes[i + 1].scale.y,
              progress
            );
            bone.startX = keyframe.clip.startX;
            bone.startY = keyframe.clip.startY;
            bone.endX = keyframe.clip.endX;
            bone.endY = keyframe.clip.endY;
          }
        }
      }
    }
  }

  private sortBonesByHierarchy(skeleton: Skeleton): void {
    skeleton.bones.sort((a, b) => a.hierarchyDepth - b.hierarchyDepth);
  }

  private updateBonePositions(bones: Bone[]): void {
    for (const bone of bones) {
      let parentRotation = 0;
      if (bone.parentId) {
        const parent = MathUtils.findBoneById(bones, bone.parentId);
        if (parent) {
          parentRotation = MathUtils.calculateGlobalRotation(bones, parent);
          bone.position = MathUtils.calculateParentPosition(
            parent.position,
            parent.length * bone.attachAt * parent.scale.y,
            parentRotation
          );
        }
      }
      bone.globalRotation =
        bone.rotation + parentRotation + bone.globalSpriteRotation;
    }
  }

  private blendAnimations(skeleton: Skeleton) {
    if (skeleton.takeSnapshot) {
      this.createSnaphot(skeleton);
      skeleton.takeSnapshot = false;
    }
    const elapsedTime = (performance.now() - skeleton.startTime) / 500;
    const loopedTime = elapsedTime % skeleton.animationDuration;
    for (const bone of skeleton.bones) {
      if (skeleton.snapShot) {
        const keyframe = skeleton.snapShot[bone.id];
        if (keyframe) {
          bone.rotation = MathUtils.interpolateKeyframe(
            bone.rotation,
            keyframe.rotation,
            loopedTime
          );
          bone.scale.x = MathUtils.interpolateKeyframe(
            bone.scale.x,
            keyframe.scale.x,
            loopedTime
          );
          bone.scale.y = MathUtils.interpolateKeyframe(
            bone.scale.y,
            keyframe.scale.y,
            loopedTime
          );
          bone.startX = keyframe.clip.startX;
          bone.startY = keyframe.clip.startY;
        }
      }
    }
    if (elapsedTime >= skeleton.animationDuration) {
      skeleton.blendTime = 0;
      skeleton.blend = false;
      skeleton.snapShot = null;
      skeleton.elapsedTime = elapsedTime;
      skeleton.startTime = performance.now();
    }
  }

  private createSnaphot(skeleton: Skeleton) {
    skeleton.blend = true;
    skeleton.snapShot = {};
    if (!skeleton.keyframes) return;
    skeleton.keyframes.forEach((keyframe) => {
      if (skeleton.snapShot) {
        if (skeleton.snapShot[keyframe.name]) return;
        skeleton.snapShot[keyframe.name] = {
          rotation: keyframe.angle,
          scale: new Vec(keyframe.scale.x, keyframe.scale.y),
          clip: {
            startX: keyframe.clip.startX,
            startY: keyframe.clip.startY,
            endX: keyframe.clip.endX,
            endY: keyframe.clip.endY,
          },
        };
      }
    });
    console.log('Created snapshot');
  }
}
