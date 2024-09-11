import { Bone } from '../components/bone';
import { Joint } from '../components/joint';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Ecs } from '../ecs';
import { Renderer } from '../renderer';
import { StateMachine } from '../state-machine';
import { Vec } from '../vec';

export class AnimationSystem {
  // update(ecs: Ecs, renderer: Renderer) {
  //   renderer.drawForeground();
  //   for (let entity of ecs.getEntities()) {
  //     const transform = ecs.getComponent<Transform>(entity, 'Transform');
  //     const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
  //     renderer.drawDebug(transform.position);
  //     if (skeleton !== undefined && transform !== undefined) {
  //       const keyframes = skeleton.stateMachine.animations;
  //       if (transform.velocity.X > 0) {
  //         skeleton.stateMachine.changeState('running');
  //       }
  //       for (let i = 0; i < skeleton.bones.length; i++) {
  //         const bone = skeleton.bones[i];
  //         bone.position = transform.position;
  //       }
  //       //Now every bone has a position. Now we can calculate what every children should move.
  //       for (let i = 0; i < skeleton.bones.length; i++) {
  //         const bone = skeleton.bones[i];
  //         if (bone.parentId !== null) {
  //           bone.color = 'green';
  //           const parent = this.findBoneById(
  //             skeleton.bones,
  //             bone.parentId
  //           ) as Bone;
  //           bone.position = this.calculateParentPosition(parent, bone);
  //           const name = keyframes.find((e) => e.name === bone.id);
  //           if (!name) {
  //             bone.rotation = parent.rotation;
  //           }
  //         }
  //         bone.flip = false;
  //         // if (transform.velocity.X <= 0) {
  //         //   bone.flip = true;
  //         //   if (bone.offsetX !== 0) {
  //         //     bone.position.X =
  //         //       transform.position.X - (bone.position.X - transform.position.X);
  //         //   }
  //         // } else if (transform.velocity.X > 0) {
  //         //   bone.flip = false;
  //         // }

  //         const totalDuration = keyframes[keyframes.length - 1].time;
  //         const speed = 500; // ms
  //         const loopedTime = (performance.now() / speed) % totalDuration;

  //         for (let i = 0; i < keyframes.length - 1; i++) {
  //           const keyFrame = keyframes[i];
  //           if (
  //             loopedTime >= keyFrame.time &&
  //             loopedTime < keyframes[i + 1].time
  //           ) {
  //             const progress =
  //               (loopedTime - keyFrame.time) /
  //               (keyframes[i + 1].time - keyFrame.time);

  //             let angle = 0;
  //             const parentBone = this.findBoneById(
  //               skeleton.bones,
  //               keyFrame.name
  //             );
  //             if (parentBone !== undefined) {
  //               if (!parentBone.flip) {
  //                 angle = this.interpolateKeyframe(
  //                   keyFrame.angle,
  //                   keyframes[i + 1].angle,
  //                   progress
  //                 );
  //               } else {
  //                 angle = this.interpolateKeyframe(
  //                   180 - keyFrame.angle,
  //                   180 - keyframes[i + 1].angle,
  //                   progress
  //                 );
  //               }
  //               parentBone.rotation = this.degreesToRadians(angle);
  //             }
  //           }
  //         }
  //         renderer.renderSheet(skeleton.image, bone);
  //         renderer.renderFont(loopedTime.toString());
  //         renderer.renderBone(bone);
  //         renderer.drawBackgroundGame();
  //       }
  //     }
  //   }
  // }

  update(ecs: Ecs, renderer: Renderer) {
    renderer.drawForeground();
    for (let entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (skeleton !== undefined && transform !== undefined) {
        for (let i = 0; i < skeleton.joints.length; i++) {
          const joint = skeleton.joints[i];
          joint.position = transform.position;
          //Render joint and update position based on parent
          if (joint.parentId !== null) {
            const jointParent = this.findJointById(
              skeleton.joints,
              joint.parentId
            ) as Joint;

            const radians =
              ((jointParent.angles[jointParent.lengths.length - 1] +
                jointParent.rotation) *
                Math.PI) /
              180;

            const newX =
              jointParent.position.X +
              jointParent.lengths[jointParent.lengths.length - 1] *
                Math.cos(radians);
            const newY =
              jointParent.position.Y +
              jointParent.lengths[jointParent.lengths.length - 1] *
                Math.sin(radians);

            joint.position = new Vec(newX, newY);
            joint.rotation = jointParent.rotation;

            //renderer.renderJoint(joint);

            //jointParent.rotation++;
          } else {
            //renderer.renderJoint(joint);
          }

          // Loop all children of joint update their position and draw them
          for (let j = 0; j < joint.bones.length; j++) {
            const bone = joint.bones[j];
            if (bone.parentId !== null) {
              //Children of bones.
              const parentBone = this.findBoneById(
                joint.bones,
                bone.parentId
              ) as Bone;

              bone.position = this.calculateParentPosition(
                parentBone.position,
                parentBone.length,
                parentBone.rotation + parentBone.jointRotation
              );
            } else {
              const xEnd =
                joint.position.X +
                joint.lengths[j] *
                  Math.cos(
                    this.degreesToRadians(joint.rotation + joint.angles[j])
                  );
              const yEnd =
                joint.position.Y +
                joint.lengths[j] *
                  Math.sin(
                    this.degreesToRadians(joint.rotation + joint.angles[j])
                  );
              bone.position = new Vec(xEnd, yEnd);
            }
            //bone.rotation = joint.rotation + joint.angles[j];
            bone.rotation = 90;
            this.runAnimation(bone);
            //renderer.renderBone(skeleton.image, bone);
            //renderer.renderJoints(bone);
          }
        }
        renderer.renderCharacter(skeleton, transform);
      }
    }
  }

  runAnimation(bone: Bone) {
    const stateMachine = new StateMachine();

    const keyframes = stateMachine.animations;
    const totalDuration = keyframes[keyframes.length - 1].time;
    const speed = 500; // ms
    const loopedTime = (performance.now() / speed) % totalDuration;
    for (let i = 0; i < keyframes.length - 1; i++) {
      const keyFrame = keyframes[i];
      if (loopedTime >= keyFrame.time && loopedTime < keyframes[i + 1].time) {
        const progress =
          (loopedTime - keyFrame.time) /
          (keyframes[i + 1].time - keyFrame.time);

        let angle = 0;
        if (bone.id === keyFrame.name) {
          angle = this.interpolateKeyframe(
            keyFrame.angle,
            keyframes[i + 1].angle,
            progress
          );
          bone.rotation = angle;
        }
      }
    }
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

  findJointById(joint: Joint[], parentID: string) {
    return joint.find((e) => e.id === parentID);
  }

  calculateParentPosition(position: Vec, length: number, rotation: number) {
    const xEnd =
      position.X + length * Math.cos(this.degreesToRadians(rotation));
    const yEnd =
      position.Y + length * Math.sin(this.degreesToRadians(rotation));
    return new Vec(xEnd, yEnd);
  }
}
