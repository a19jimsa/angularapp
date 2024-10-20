import { ElementRef } from '@angular/core';
import { Ecs } from './ecs';
import { Renderer } from './renderer';
import { Transform } from './components/transform';
import { Vec } from './vec';
import { Bone } from './components/bone';
import { Skeleton } from './components/skeleton';
import { AnimationSystem } from './systems/animation-system';
import { MovementSystem } from './systems/movement-system';
import { ControllerSystem } from './systems/controller-system';
import { Controlable } from './components/controlable';
import { Joint } from './components/joint';
import { Camera } from './components/camera';
import { CameraSystem } from './systems/camera-system';
import { Life } from './components/life';
import { AttackSystem } from './systems/attack-system';
import { Enemy } from './components/enemy';
import { Weapon } from './components/weapon';
import { Health } from './components/health';
import { DeadSystem } from './systems/dead-system';
import { HitBox } from './components/hit-box';
import { AttackDuration } from './components/attack-duration';
import { AttackDurationSystem } from './systems/attack-duration-system';

export class AnimationScene {
  canvas: ElementRef<HTMLCanvasElement>;
  renderer!: Renderer;
  ecs: Ecs;
  canvasWidth: number;
  canvasHeight: number;
  width: number;
  height: number;
  animationSystem: AnimationSystem;
  movementSystem: MovementSystem;
  controllerSystem: ControllerSystem;
  cameraSystem: CameraSystem;
  attackSystem: AttackSystem;
  deadSystem: DeadSystem;
  attackDurationSystem: AttackDurationSystem;
  constructor(
    canvas: ElementRef<HTMLCanvasElement>,
    canvasWidth: number,
    canvasheight: number,
    width: number,
    height: number
  ) {
    this.canvas = canvas;
    this.ecs = new Ecs();

    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasheight;
    this.width = width;
    this.height = height;

    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasheight;
    this.animationSystem = new AnimationSystem();
    this.movementSystem = new MovementSystem();
    this.controllerSystem = new ControllerSystem();
    this.cameraSystem = new CameraSystem();
    this.attackSystem = new AttackSystem();
    this.deadSystem = new DeadSystem();
    this.attackDurationSystem = new AttackDurationSystem();
  }

  init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    // const enemy = this.ecs.createEntity();
    // const arden = this.ecs.createEntity();
    const astram = this.ecs.createEntity();
    // const darros = this.ecs.createEntity();
    // const keiran = this.ecs.createEntity();
    const dragon = this.ecs.createEntity();

    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(200, 300), new Vec(0, 0), 10)
    );
    // this.ecs.addComponent<Transform>(
    //   enemy,
    //   new Transform(new Vec(300, 300), new Vec(0, 0), 100)
    // );
    // this.ecs.addComponent<Transform>(
    //   arden,
    //   new Transform(new Vec(400, 300), new Vec(0, 0), 100)
    // );
    // this.ecs.addComponent<Transform>(
    //   astram,
    //   new Transform(new Vec(500, 300), new Vec(0, 0), 100)
    // );
    // this.ecs.addComponent<Transform>(
    //   darros,
    //   new Transform(new Vec(600, 300), new Vec(0, 0), 100)
    // );

    // this.ecs.addComponent<Transform>(
    //   keiran,
    //   new Transform(new Vec(700, 300), new Vec(0, 0), 100)
    // );

    // this.ecs.addComponent<Health>(keiran, new Health(50));

    const playerSkeleton = new Skeleton('assets/sprites/Barst.png');
    // const enemySkeleton = new Skeleton('assets/sprites/Draug.png');
    // const ardenSkeleton = new Skeleton('assets/sprites/Arden.png');
    // const astramSkeleton = new Skeleton('assets/sprites/Astram.png');
    // const darrosSkeleton = new Skeleton('assets/sprites/Darros.png');
    // const keiranSkeleton = new Skeleton('assets/sprites/keiran.png');

    const rightLeg = new Bone(
      'rightLeg',
      null,
      new Vec(0, 10),
      40,
      400,
      145,
      33,
      55,
      0,
      -1,
      new Vec(-5, 50)
    );

    const leftLeg = new Bone(
      'leftLeg',
      null,
      new Vec(0, 0),
      40,
      400,
      145,
      33,
      55,
      0,
      -1,
      new Vec(15, 50)
    );

    const body = new Bone(
      'body',
      null,
      new Vec(0, 75 / 2),
      0,
      430,
      5,
      60,
      75,
      0,
      0,
      new Vec(0, 0)
    );

    const rightArm = new Bone(
      'rightArm',
      null,
      new Vec(0, 10),
      30,
      145,
      158,
      28,
      40,
      0,
      2,
      new Vec(-15, 10)
    );

    const leftArm = new Bone(
      'leftArm',
      null,
      new Vec(0, 10),
      35,
      23,
      150,
      22,
      45,
      0,
      -20,
      new Vec(15, 10)
    );

    const leftFoot = new Bone(
      'leftFoot',
      'leftLeg',
      new Vec(0, 0),
      40,
      455,
      160,
      40,
      40,
      0,
      -2
    );
    const rightFoot = new Bone(
      'rightFoot',
      'rightLeg',
      new Vec(0, 0),
      40,
      455,
      160,
      40,
      40,
      0,
      -2
    );

    const leftLowerArm = new Bone(
      'leftLowerArm',
      'leftArm',
      new Vec(0, 0),
      15,
      210,
      155,
      30,
      35,
      0,
      -1
    );

    const rightLowerArm = new Bone(
      'rightLowerArm',
      'rightArm',
      new Vec(0, 0),
      15,
      210,
      155,
      30,
      35,
      0,
      2
    );

    const head = new Bone(
      'head',
      null,
      new Vec(0, 37.5),
      0,
      25,
      20,
      75,
      75,
      0,
      0,
      new Vec(0, -50)
    );

    const rightMantle = new Bone(
      'rightMantle',
      null,
      new Vec(0, 20),
      50,
      5,
      293,
      41 - 5,
      359 - 293,
      10,
      0
    );

    const rightMantleLower = new Bone(
      'rightMantleLower',
      'rightMantle',
      new Vec(0, 0),
      100,
      5,
      377,
      41 - 5,
      427 - 377,
      0,
      0
    );

    const leftMantle = new Bone(
      'leftMantle',
      null,
      new Vec(0, 0),
      50,
      61,
      303,
      80 - 61,
      355 - 303,
      345,
      0
    );

    const leftMantleLower = new Bone(
      'leftMantleLower',
      'leftMantle',
      new Vec(0, 0),
      0,
      59,
      384,
      80 - 59,
      426 - 384,
      0,
      0
    );

    const weapon = new Weapon(
      'weapon',
      'rightLowerArm',
      new Vec(0, 10),
      90,
      416,
      202,
      502 - 416,
      358 - 202,
      0,
      50,
      50,
      2
    );

    const weapon2 = new Weapon(
      'weapon2',
      'leftLowerArm',
      new Vec(0, 10),
      90,
      416,
      202,
      502 - 416,
      358 - 202,
      0,
      50,
      50,
      -2
    );

    const joint = new Joint('root', null, 270, 'blue');

    // pelvis.bones.push(rightMantleLower);
    // pelvis.bones.push(leftMantleLower);

    //Draw root bones
    playerSkeleton.bones.push(body);

    playerSkeleton.bones.push(leftArm);
    playerSkeleton.bones.push(leftLeg);
    playerSkeleton.bones.push(rightArm);
    playerSkeleton.bones.push(head);
    playerSkeleton.bones.push(rightLeg);

    //Draw child bones
    playerSkeleton.bones.push(leftFoot);
    playerSkeleton.bones.push(rightFoot);
    playerSkeleton.bones.push(leftLowerArm);
    playerSkeleton.bones.push(rightLowerArm);
    playerSkeleton.bones.push(weapon);
    //playerSkeleton.bones.push(weapon2);

    playerSkeleton.joints.push(joint);

    this.ecs.addComponent<Skeleton>(player, playerSkeleton);

    //this.ecs.addComponent<Health>(astram, new Health(100));

    // const dragon = this.ecs.createEntity();

    // this.ecs.addComponent<HitBox>(
    //   astram,
    //   new HitBox(
    //     this.ecs.getComponent<Transform>(astram, 'Transform').position,
    //     100,
    //     100
    //   )
    // );

    this.ecs.addComponent<Transform>(
      dragon,
      new Transform(new Vec(250, 120), new Vec(0, 0), 100)
    );

    const dragonSkeleton = new Skeleton('assets/sprites/Dragon.png');

    const dragonbody = new Bone(
      'dragonBody',
      null,
      new Vec(200, 100),
      150,
      237,
      517,
      499 - 237,
      655 - 517,
      80,
      3,
      new Vec(-70, 20)
    );

    const dragonChest = new Bone(
      'dragonChest',
      null,
      new Vec(0, 0),
      0,
      295,
      666,
      509 - 295,
      819 - 666,
      0,
      4,
      new Vec(0, 0)
    );

    const dragonLeftArm = new Bone(
      'dragonLeftArm',
      null,
      new Vec(0, 50),
      100,
      644,
      627,
      734 - 644,
      791 - 627,
      0,
      -3,
      new Vec(110, 0)
    );
    const dragonRightArm = new Bone(
      'dragonRightArm',
      null,
      new Vec(0, 50),
      90,
      512,
      503,
      642 - 512,
      713 - 503,
      0,
      6,
      new Vec(-50, 0)
    );

    const dragonHead = new Bone(
      'dragonHead',
      null,
      new Vec(0, 70),
      75,
      0,
      516,
      230,
      140,
      12,
      50,
      new Vec(65, -50)
    );

    const jaw = new Bone(
      'dragonJaw',
      'dragonHead',
      new Vec(0, 0),
      50,
      230,
      661,
      288 - 230,
      756 - 661,
      0,
      8
    );

    const leftDragonLowerArm = new Bone(
      'dragonLeftLowerArm',
      'dragonLeftArm',
      new Vec(0, 50),
      120,
      639,
      794,
      749 - 639,
      939 - 794,
      0,
      -2
    );

    const rightDragonLowerArm = new Bone(
      'dragonRightLowerArm',
      'dragonRightArm',
      new Vec(0, 50),
      220,
      518,
      705,
      638 - 518,
      950 - 705,
      0,
      10
    );

    const dragonBack = new Bone(
      'dragonBack',
      'dragonBody',
      new Vec(0, 0),
      0,
      334,
      827,
      512 - 334,
      1020 - 827,
      0,
      -1
    );
    const dragonRightFist = new Bone(
      'dragonRightFist',
      'dragonRightLowerArm',
      new Vec(0, 0),
      0,
      122,
      957,
      243 - 122,
      1021 - 957,
      0,
      13
    );

    const dragonLeftFist = new Bone(
      'dragonLeftFist',
      'dragonLeftLowerArm',
      new Vec(0, 0),
      0,
      0,
      964,
      119 - 0,
      1024 - 964,
      0,
      13
    );

    const firstTail = new Bone(
      'firstTail',
      null,
      new Vec(0, 0),
      250,
      1033,
      514,
      1165 - 1033,
      826 - 514,
      0,
      -14,
      new Vec(-300, -100)
    );

    const secondTail = new Bone(
      'secondTail',
      'firstTail',
      new Vec(0, 0),
      120,
      1170,
      510,
      1265 - 1170,
      668 - 510,
      0,
      -15
    );
    const thirdTail = new Bone(
      'thirdTail',
      'secondTail',
      new Vec(0, 0),
      100,
      1171,
      680,
      1247 - 1171,
      821 - 680,
      0,
      -16
    );

    const fourthTail = new Bone(
      'fourthTail',
      'thirdTail',
      new Vec(0, 0),
      70,
      1025,
      836,
      1092 - 1025,
      934 - 836,
      0,
      -17
    );
    const fifthTail = new Bone(
      'fifthTail',
      'fourthTail',
      new Vec(0, 0),
      60,
      1096,
      835,
      1145 - 1096,
      919 - 835,
      0,
      -18
    );
    const sixthTail = new Bone(
      'sixthTail',
      'fifthTail',
      new Vec(0, 0),
      60,
      1152,
      836,
      1188 - 1152,
      920 - 836,
      0,
      -19
    );

    const lastTail = new Bone(
      'lastTail',
      'sixthTail',
      new Vec(0, 0),
      60,
      1253,
      677,
      1274 - 1253,
      755 - 677,
      0,
      -20
    );

    const dragonJoint = new Joint('root', null, 0, 'blue');

    dragonSkeleton.bones.push(dragonbody);
    dragonSkeleton.bones.push(dragonChest);
    dragonSkeleton.bones.push(dragonLeftArm);
    dragonSkeleton.bones.push(dragonRightArm);
    dragonSkeleton.bones.push(firstTail);
    dragonSkeleton.bones.push(dragonHead);
    dragonSkeleton.bones.push(jaw);

    //Add child bones
    dragonSkeleton.bones.push(lastTail);
    dragonSkeleton.bones.push(sixthTail);
    dragonSkeleton.bones.push(fifthTail);
    dragonSkeleton.bones.push(fourthTail);
    dragonSkeleton.bones.push(thirdTail);
    dragonSkeleton.bones.push(secondTail);
    dragonSkeleton.bones.push(dragonBack);

    dragonSkeleton.bones.push(leftDragonLowerArm);
    dragonSkeleton.bones.push(rightDragonLowerArm);

    dragonSkeleton.bones.push(dragonLeftFist);
    dragonSkeleton.bones.push(dragonRightFist);

    dragonSkeleton.joints.push(dragonJoint);

    this.ecs.addComponent<Skeleton>(dragon, dragonSkeleton);
    this.ecs.addComponent<Weapon>(player, weapon);

    // this.ecs.addComponent<Skeleton>(
    //   dragon,
    //   new Skeleton(
    //     [
    //       new Bone(
    //         'leftWing',
    //         'leftArm',
    //         new Vec(0, 0),
    //         0,
    //         -300,
    //         0,
    //         918,
    //         666,
    //         1017 - 918,
    //         841 - 666
    //       ),
    //       new Bone(
    //         'rightWing',
    //         'back',
    //         new Vec(0, 0),
    //         -120,
    //         -50,
    //         0,
    //         641,
    //         514,
    //         936 - 641,
    //         618 - 514
    //       ),

    //     ],

    //     'assets/sprites/Dragon.png'
    //   )
    // );

    // this.ecs.addComponent<Controlable>(
    //   astram,
    //   new Controlable(new Vec(0, 0), 0, false)
    // );

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 0), 0, false)
    );

    this.ecs.addComponent<Camera>(player, new Camera(1024, 420, 4096, 420));

    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));

    // this.ecs.addComponent<Controlable>(
    //   arden,
    //   new Controlable(new Vec(0, 0), 0, false)
    // );
    // this.ecs.addComponent<Controlable>(
    //   draug,
    //   new Controlable(new Vec(0, 0), 0, false)
    // );
    // this.ecs.addComponent<Controlable>(
    //   dragon,
    //   new Controlable(new Vec(0, 0), 0, false)
    // );
    // this.ecs.addComponent<Render>(dragon, new Render('blue'));
  }

  start() {
    this.renderer.clearScreen();
    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );
    this.controllerSystem.update(this.ecs);
    this.animationSystem.update(this.ecs, this.renderer);
    this.movementSystem.update(this.ecs);
    this.attackSystem.update(this.ecs, this.renderer);
    this.attackDurationSystem.update(this.ecs);
    this.deadSystem.update(this.ecs);

    console.log(Math.floor(performance.now() / 1000));
    window.requestAnimationFrame(() => this.start());
  }
}
