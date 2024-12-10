type Keyframe = {
  time: number; // Tidpunkten för keyframen
  name: string; // Namn på benet eller objektet som påverkas
  angle: number; // Rotationsvinkel i grader eller motsvarande enhet
};

export class StateMachine {
  //Load from JSON keyfram
  //Waiting for animationCreator to be complete!"!:"

  //Use for now hardcoded keyframes in here.
  idleFrames: Keyframe[] = [
    { time: 0, name: 'rightArm', angle: 90 },
    { time: 2, name: 'rightArm', angle: 90 },
    { time: 0, name: 'leftArm', angle: 90 },
    { time: 2, name: 'leftArm', angle: 90 },
    { time: 0, name: 'rightLowerArm', angle: 90 },
    { time: 2, name: 'rightLowerArm', angle: 90 },
    { time: 0, name: 'leftLowerArm', angle: 90 },
    { time: 2, name: 'leftLowerArm', angle: 90 },
  ];

  runningFrames: Keyframe[] = [
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
    { time: 0, name: 'dragonJaw', angle: 90 },
    { time: 1, name: 'dragonJaw', angle: 100 },
    { time: 2, name: 'dragonJaw', angle: 90 },
    { time: 0, name: 'dragonBody', angle: 85 },
    { time: 1, name: 'dragonBody', angle: 80 },
    { time: 2, name: 'dragonBody', angle: 85 },
    { time: 0, name: 'dragonLeftArm', angle: 70 },
    { time: 1, name: 'dragonLeftArm', angle: 70 },
    { time: 2, name: 'dragonLeftArm', angle: 70 },
    { time: 0, name: 'dragonRightArm', angle: 140 },
    { time: 1, name: 'dragonRightArm', angle: 140 },
    { time: 2, name: 'dragonRightArm', angle: 140 },
    { time: 0, name: 'dragonRightLowerArm', angle: 90 },
    { time: 1, name: 'dragonRightLowerArm', angle: 90 },
    { time: 2, name: 'dragonRightLowerArm', angle: 90 },
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

  attackFrames: Keyframe[] = [
    { time: 0, name: 'rightArm', angle: 90 },
    { time: 0.5, name: 'rightArm', angle: -90 },
    { time: 0.7, name: 'rightArm', angle: -90 },
    { time: 1, name: 'rightArm', angle: 90 },
    { time: 0, name: 'leftArm', angle: -90 },
    { time: 1, name: 'leftArm', angle: 90 },
    { time: 0, name: 'rightLowerArm', angle: 90 },
    { time: 0.5, name: 'rightLowerArm', angle: -90 },
    { time: 0.7, name: 'rightLowerArm', angle: -90 },
    { time: 1, name: 'rightLowerArm', angle: 90 },
    { time: 0, name: 'leftLowerArm', angle: -90 },
    { time: 1, name: 'leftLowerArm', angle: 90 },
  ];

  currentState: string = 'idle';
  animations: Keyframe[];

  constructor() {
    this.currentState = 'running';
    this.animations = this.runningFrames;
    console.log(JSON.stringify(this.runningFrames));
  }

  changeState() {
    if (this.currentState === 'attack') {
      this.animations = this.attackFrames;
    } else if (this.currentState === 'running') {
      this.animations = this.runningFrames;
    } else if (this.currentState === 'idle') {
      this.animations = this.idleFrames;
    }
  }
}
