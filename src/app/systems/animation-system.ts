import { Attack } from '../components/attack';
import { AttackDuration } from '../components/attack-duration';
import { Bone } from '../components/bone';
import { Component } from '../components/component';
import { Joint } from '../components/joint';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { Weapon } from '../components/weapon';
import { Ecs } from '../ecs';
import { Entity } from '../entity';
import { Renderer } from '../renderer';
import { Vec } from '../vec';

export class AnimationSystem {
  startTime = performance.now();
  update(ecs: Ecs, renderer: Renderer) {
    renderer.drawForeground();
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      if (skeleton === undefined || transform === undefined) continue;
      skeleton.position = transform.position;
      skeleton.bones.sort((a, b) => {
        if (a.parentId === null && b.parentId !== null) {
          return -1; // Placera ben utan parent före ben med parent
        } else if (a.parentId !== null && b.parentId === null) {
          return 1; // Placera ben med parent efter ben utan parent
        } else {
          return 0; // Om båda antingen har eller saknar parent, lämna dem i samma ordning
        }
      });
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
        }

        // Loop all children of joint update their position and draw them
        for (let j = 0; j < skeleton.bones.length; j++) {
          const bone = skeleton.bones[j];
          if (bone.parentId !== null) {
            //Children of bones.
            const parentBone = this.findBoneById(
              skeleton.bones,
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
          this.runAnimation(bone, skeleton);
          //renderer.renderJoints(bone);
          
        }
      }

      if(skeleton.active && skeleton.stateMachine.currentState == "attack"){
        ecs.addComponent<Attack>(entity, new Attack(100,100,100,50,50,new Vec(0,0)));
        ecs.addComponent<AttackDuration>(entity, new AttackDuration(45));
        skeleton.active = false;
      }
      renderer.renderCharacter(skeleton, transform);
    }
  }

  runAnimation(bone: Bone, skeleton: Skeleton) {
    const keyframes = skeleton.stateMachine.animations;
    const totalDuration = keyframes[keyframes.length - 1].time;
    const speed = 1000; // ms
    const currentTime = performance.now();
    const loopedTime = (currentTime / speed) % totalDuration;
    for (let i = 0; i < keyframes.length - 1; i++) {
      const keyFrame = keyframes[i];
      if (loopedTime >= keyFrame.time && loopedTime < keyframes[i + 1].time) {
        const progress =
          (loopedTime - keyFrame.time) /
          (keyframes[i + 1].time - keyFrame.time);
        
        if (bone.id === keyFrame.name) {
          bone.rotation = this.interpolateKeyframe(
            keyFrame.angle,
            keyframes[i + 1].angle,
            progress
          );
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
