export class StateMachine {
  //Load from JSON keyframes

  //Use for now hardcoded keyframes in here.

  runningFrames = [
    { time: 0, name: 'root', angle: 90 },
    { time: 1, name: 'root', angle: 120 },
    { time: 2, name: 'root', angle: 90 },
    { time: 0, name: 'head', angle: 80 },
    { time: 1, name: 'head', angle: 90 },
    { time: 2, name: 'head', angle: 80 },
    { time: 0, name: 'leftArm', angle: 45 },
    { time: 1, name: 'leftArm', angle: 90 },
    { time: 2, name: 'leftArm', angle: 45 },
    { time: 0, name: 'leftLowerArm', angle: -70 },
    { time: 1, name: 'leftLowerArm', angle: 90 },
    { time: 2, name: 'leftLowerArm', angle: -70 },
    { time: 0, name: 'weapon', angle: 350 },
    { time: 1, name: 'weapon', angle: 250 },
    { time: 2, name: 'weapon', angle: 350 },
    { time: 0, name: 'weapon2', angle: 250 },
    { time: 1, name: 'weapon2', angle: 350 },
    { time: 2, name: 'weapon2', angle: 250 },
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
    { time: 0, name: 'rightLeg', angle: 60 },
    { time: 1, name: 'rightLeg', angle: 120 },
    { time: 2, name: 'rightLeg', angle: 60 },
    { time: 0, name: 'leftLeg', angle: 120 },
    { time: 1, name: 'leftLeg', angle: 50 },
    { time: 2, name: 'leftLeg', angle: 120 },
    { time: 0, name: 'rightFoot', angle: 45 },
    { time: 1, name: 'rightFoot', angle: 260 },
    { time: 1.6, name: 'rightFoot', angle: 180 },
    { time: 2, name: 'rightFoot', angle: 45 },
    { time: 0, name: 'dragonHead', angle: 90 },
    { time: 1, name: 'dragonHead', angle: 100 },
    { time: 2, name: 'dragonHead', angle: 90 },
    { time: 0, name: 'dragonBody', angle: 85 },
    { time: 1, name: 'dragonBody', angle: 80 },
    { time: 2, name: 'dragonBody', angle: 85 },
    { time: 0, name: 'dragonLeftArm', angle: 60 },
    { time: 1, name: 'dragonLeftArm', angle: 60 },
    { time: 2, name: 'dragonLeftArm', angle: 60 },
    { time: 0, name: 'dragonRightArm', angle: 140 },
    { time: 1, name: 'dragonRightArm', angle: 140 },
    { time: 2, name: 'dragonRightArm', angle: 140 },
    { time: 0, name: 'dragonRightLowerArm', angle: 60 },
    { time: 1, name: 'dragonRightLowerArm', angle: 60 },
    { time: 2, name: 'dragonRightLowerArm', angle: 60 },
    { time: 0, name: 'firstTail', angle: 10 },
    { time: 1, name: 'firstTail', angle: 20 },
    { time: 2, name: 'firstTail', angle: 10 },
    { time: 0, name: 'secondTail', angle: 60 },
    { time: 1, name: 'secondTail', angle: 50 },
    { time: 2, name: 'secondTail', angle: 60 },
    { time: 0, name: 'thirdTail', angle: 50 },
    { time: 1, name: 'thirdTail', angle: 40 },
    { time: 2, name: 'thirdTail', angle: 50 },
    { time: 0, name: 'fourthTail', angle: 40 },
    { time: 1, name: 'fourthTail', angle: 20 },
    { time: 2, name: 'fourthTail', angle: 40 },
    { time: 0, name: 'fifthTail', angle: 30 },
    { time: 1, name: 'fifthTail', angle: 0 },
    { time: 2, name: 'fifthTail', angle: 30 },
    { time: 0, name: 'sixthTail', angle: 20 },
    { time: 1, name: 'sixthTail', angle: 0 },
    { time: 2, name: 'sixthTail', angle: 20 },
    { time: 0, name: 'lastTail', angle: -20 },
    { time: 1, name: 'lastTail', angle: 0 },
    { time: 2, name: 'lastTail', angle: -20 },
  ];

  attackFrames = [
    { time: 0, name: 'weapon', angle: -90 },
    { time: 0.3, name: 'weapon', angle: 0 },
    { time: 1.5, name: 'weapon', angle: 0 },
    { time: 5, name: 'weapon2', angle: 0 },
    { time: 0, name: 'weapon2', angle: -90 },
    { time: 0.3, name: 'weapon2', angle: 90 },
    { time: 1.5, name: 'weapon2', angle: 90 },
    { time: 5, name: 'weapon2', angle: 90 },
    { time: 0, name: 'rightArm', angle: 0 },
    { time: 0.3, name: 'rightArm', angle: 90 },
    { time: 1.5, name: 'rightArm', angle: 90 },
    { time: 5, name: 'rightArm', angle: 90 },
    { time: 0, name: 'leftArm', angle: -90 },
    { time: 0.3, name: 'leftArm', angle: 90 },
    { time: 1.5, name: 'leftArm', angle: 90 },
    { time: 5, name: 'leftArm', angle: 90 },
    { time: 0, name: 'rightLowerArm', angle: 0 },
    { time: 0.3, name: 'rightLowerArm', angle: 90 },
    { time: 1.5, name: 'rightLowerArm', angle: 90 },
    { time: 5, name: 'rightLowerArm', angle: 90 },
    { time: 0, name: 'leftLowerArm', angle: -90 },
    { time: 0.3, name: 'leftLowerArm', angle: 90 },
    { time: 1.5, name: 'leftLowerArm', angle: 90 },
    { time: 5, name: 'leftLowerArm', angle: 90 },
  ];

  currentState: string = 'bajs';
  animations: any[];

  constructor() {
    this.currentState = 'attack';
    this.animations = this.attackFrames;
  }

  changeState() {
    if (this.currentState === 'attack') {
      this.animations = this.attackFrames;
    }
    if (this.currentState === 'running') {
      this.animations = this.runningFrames;
    }
  }
}
