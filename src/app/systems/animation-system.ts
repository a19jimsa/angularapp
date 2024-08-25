import { Bone } from '../components/bone';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';
import { Vec } from '../vec';

export class AnimationSystem {
  update(ecs: Ecs, renderer: Renderer) {
    renderer.drawForeground();

    for (let entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (skeleton !== undefined && transform !== undefined) {
        const keyframes = skeleton.stateMachine.animations;
        if (transform.velocity.X > 0) {
          skeleton.stateMachine.changeState('running');
        }

        const totalDuration = keyframes[keyframes.length - 1].time;
        const speed = 500; // ms
        const loopedTime = (performance.now() / speed) % totalDuration;

        for (let i = 0; i < keyframes.length - 1; i++) {
          const keyFrame = keyframes[i];
          if (
            loopedTime >= keyFrame.time &&
            loopedTime < keyframes[i + 1].time
          ) {
            const progress =
              (loopedTime - keyFrame.time) /
              (keyframes[i + 1].time - keyFrame.time);

            const angle = this.interpolateKeyframe(
              keyFrame.angle,
              keyframes[i + 1].angle,
              progress
            );
            const bone = this.findBoneById(skeleton.bones, keyFrame.name);
            if (bone !== undefined) {
              bone.rotation = this.degreesToRadians(angle);
            }
          }
        }

        for (let i = 0; i < skeleton.bones.length; i++) {
          const bone = skeleton.bones[i];
          let position = transform.position;
          bone.position = transform.position;
          let color = 'red';
          if (bone.parentId !== null) {
            color = 'green';
            const parent = this.findBoneById(
              skeleton.bones,
              bone.parentId
            ) as Bone;

            const newPos = this.calculateParentPosition(parent);
            position = newPos;
            bone.position = newPos;
            position.X += bone.offsetX;
            position.Y += bone.offsetY;

            const name = keyframes.find((e) => e.name === bone.id);
            if (!name) {
              bone.rotation = parent.rotation;
            }
          }

          renderer.renderSheet(
            skeleton.image,
            position,
            bone.rotation,
            bone.startX,
            bone.startY,
            bone.endX,
            bone.endY
          );

          renderer.renderFont(loopedTime.toString());
          //renderer.renderBone(position, bone.length, bone.rotation, color);
          renderer.drawBackgroundGame();
        }
      }
    }
  }

  interpolateKeyframe(startValue: number, endValue: number, progress: number) {
    return startValue + (endValue - startValue) * progress;
  }

  degreesToRadians(degrees: number) {
    const rotationRadians = degrees * (Math.PI / 180);
    return rotationRadians;
  }

  findBoneById(bones: Bone[], parentId: string) {
    return bones.find((e) => e.id === parentId);
  }

  calculateParentPosition(parent: Bone) {
    const xEnd = parent.position.X + parent.length * Math.cos(parent.rotation);
    const yEnd = parent.position.Y + parent.length * Math.sin(parent.rotation);
    return new Vec(xEnd, yEnd);
  }
}
