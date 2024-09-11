export class StateMachine {
  //Load from JSON keyframes

  //Use for now hardcoded keyframes in here.

  runningFrames = [
    { time: 0, name: 'dragonRightArm', angle: 80 },
    { time: 1, name: 'dragonRightArm', angle: 120 },
    { time: 2, name: 'dragonRightArm', angle: 80 },
    { time: 0, name: 'dragonRightLowerArm', angle: 80 },
    { time: 1, name: 'dragonRightLowerArm', angle: 60 },
    { time: 2, name: 'dragonRightLowerArm', angle: 80 },
    { time: 0, name: 'dragonLeftArm', angle: 80 },
    { time: 1, name: 'dragonLeftArm', angle: 120 },
    { time: 2, name: 'dragonLeftArm', angle: 80 },
    { time: 0, name: 'dragonLeftLowerArm', angle: 80 },
    { time: 1, name: 'dragonLeftLowerArm', angle: 60 },
    { time: 2, name: 'dragonLeftLowerArm', angle: 80 },
    { time: 0, name: 'dragonBody', angle: 90 },
    { time: 1, name: 'dragonBody', angle: 100 },
    { time: 2, name: 'dragonBody', angle: 90 },
    { time: 0, name: 'dragonJaw', angle: 90 },
    { time: 1, name: 'dragonJaw', angle: 120 },
    { time: 2, name: 'dragonJaw', angle: 90 },
    { time: 0, name: 'dragonHead', angle: 90 },
    { time: 1, name: 'dragonHead', angle: 120 },
    { time: 2, name: 'dragonHead', angle: 90 },
    { time: 0, name: 'leftArm', angle: 45 },
    { time: 1, name: 'leftArm', angle: 90 },
    { time: 2, name: 'leftArm', angle: 45 },
    { time: 0, name: 'leftLowerArm', angle: -70 },
    { time: 1, name: 'leftLowerArm', angle: 90 },
    { time: 2, name: 'leftLowerArm', angle: -70 },
    { time: 0, name: 'weapon', angle: 0 },
    { time: 1, name: 'weapon', angle: -45 },
    { time: 2, name: 'weapon', angle: 0 },
    { time: 0, name: 'leftLeg', angle: 160 },
    { time: 1, name: 'leftLeg', angle: 45 },
    { time: 2, name: 'leftLeg', angle: 160 },
    { time: 0, name: 'leftFoot', angle: 260 },
    { time: 0.6, name: 'leftFoot', angle: 180 },
    { time: 1, name: 'leftFoot', angle: 45 },
    { time: 2, name: 'leftFoot', angle: 260 },
    { time: 0, name: 'rightArm', angle: 90 },
    { time: 1, name: 'rightArm', angle: 45 },
    { time: 2, name: 'rightArm', angle: 90 },
    { time: 0, name: 'rightLowerArm', angle: 90 },
    { time: 1, name: 'rightLowerArm', angle: -70 },
    { time: 2, name: 'rightLowerArm', angle: 90 },
    { time: 0, name: 'rightLeg', angle: 45 },
    { time: 1, name: 'rightLeg', angle: 160 },
    { time: 2, name: 'rightLeg', angle: 45 },
    { time: 0, name: 'rightFoot', angle: 45 },
    { time: 1, name: 'rightFoot', angle: 260 },
    { time: 1.6, name: 'rightFoot', angle: 180 },
    { time: 2, name: 'rightFoot', angle: 45 },
  ];

  idleFrames = [
    { time: 0, name: 'dragonRightArm', angle: 130 },
    { time: 1, name: 'dragonRightArm', angle: 140 },
    { time: 2, name: 'dragonRightArm', angle: 130 },
    { time: 0, name: 'dragonRightLowerArm', angle: 80 },
    { time: 1, name: 'dragonRightLowerArm', angle: 60 },
    { time: 2, name: 'dragonRightLowerArm', angle: 80 },
    { time: 0, name: 'dragonBody', angle: 80 },
    { time: 1, name: 'dragonBody', angle: 90 },
    { time: 2, name: 'dragonBody', angle: 80 },
    { time: 0, name: 'dragonHead', angle: 90 },
    { time: 1, name: 'dragonHead', angle: 100 },
    { time: 2, name: 'dragonHead', angle: 90 },
    { time: 0, name: 'dragonJaw', angle: 90 },
    { time: 1, name: 'dragonJaw', angle: 100 },
    { time: 2, name: 'dragonJaw', angle: 90 },
    { time: 0, name: 'dragonChest', angle: 90 },
    { time: 1, name: 'dragonChest', angle: 100 },
    { time: 2, name: 'dragonChest', angle: 90 },
  ];

  currentState: string = 'idle';
  animations: any[];

  constructor() {
    this.currentState = 'idle';
    this.animations = this.idleFrames;
  }

  changeState(animationName: string) {
    if (animationName === 'idle') {
      this.animations = this.idleFrames;
    } else if (animationName === 'running') {
      this.animations = this.runningFrames;
    }
  }
}
