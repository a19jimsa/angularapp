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
  }

  init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    const enemy = this.ecs.createEntity();
    const arden = this.ecs.createEntity();
    const astram = this.ecs.createEntity();
    const darros = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(200, 300), new Vec(10, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      enemy,
      new Transform(new Vec(300, 300), new Vec(10, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      arden,
      new Transform(new Vec(400, 300), new Vec(10, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      astram,
      new Transform(new Vec(500, 300), new Vec(10, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      darros,
      new Transform(new Vec(600, 300), new Vec(10, 0), 0)
    );

    const playerSkeleton = new Skeleton('assets/sprites/Barst.png');
    const enemySkeleton = new Skeleton('assets/sprites/Draug.png');
    const ardenSkeleton = new Skeleton('assets/sprites/Arden.png');
    const astramSkeleton = new Skeleton('assets/sprites/Astram.png');
    const darrosSkeleton = new Skeleton('assets/sprites/Darros.png');

    const rightLeg = new Bone(
      'rightLeg',
      null,
      new Vec(0, 0),
      40,
      400,
      145,
      33,
      55,
      0
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
      0
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
      0
    );

    const rightArm = new Bone(
      'rightArm',
      null,
      new Vec(0, 0),
      25,
      145,
      158,
      28,
      40,
      0
    );

    const leftArm = new Bone(
      'leftArm',
      null,
      new Vec(0, 0),
      30,
      23,
      150,
      22,
      45,
      0
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
      0
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
      0
    );

    const leftLowerArm = new Bone(
      'rightLowerArm',
      'rightArm',
      new Vec(0, 0),
      40,
      210,
      155,
      30,
      35,
      0
    );
    const rightLowerArm = new Bone(
      'leftLowerArm',
      'leftArm',
      new Vec(0, 0),
      0,
      210,
      155,
      30,
      35,
      0
    );

    const head = new Bone(
      'head',
      null,
      new Vec(0, 75 / 2),
      0,
      25,
      20,
      75,
      75,
      0
    );

    const joint = new Joint(
      'root',
      null,
      270,
      [15, 0, 50, 40],
      [90, 90, 0, 0],
      'blue'
    );

    const pelvis = new Joint(
      'spine',
      'root',
      0,
      [20, 20, 70],
      [270, 80, 0],
      'red'
    );
    const headJoint = new Joint(
      'head',
      'spine',
      50,
      [120, 115, 40, 0],
      [20, 15, 50, 0],
      'green'
    );

    body.flip = true;
    head.flip = true;

    //Draw root bones
    joint.bones.push(leftLeg);
    joint.bones.push(rightLeg);
    joint.bones.push(body);

    joint.bones.push(leftFoot);
    joint.bones.push(rightFoot);

    // // // Draw pelvis children
    pelvis.bones.push(rightArm);
    pelvis.bones.push(leftArm);

    pelvis.bones.push(head);

    pelvis.bones.push(leftLowerArm);
    pelvis.bones.push(rightLowerArm);

    playerSkeleton.joints.push(joint);
    playerSkeleton.joints.push(pelvis);
    //playerSkeleton.joints.push(headJoint);

    enemySkeleton.joints.push(joint);
    enemySkeleton.joints.push(pelvis);

    ardenSkeleton.joints.push(joint);
    ardenSkeleton.joints.push(pelvis);

    astramSkeleton.joints.push(joint);
    astramSkeleton.joints.push(pelvis);

    darrosSkeleton.joints.push(joint);
    darrosSkeleton.joints.push(pelvis);

    //playerSkeleton.joints.push(head);

    this.ecs.addComponent<Skeleton>(player, playerSkeleton);
    this.ecs.addComponent<Skeleton>(enemy, enemySkeleton);
    this.ecs.addComponent<Skeleton>(arden, ardenSkeleton);
    this.ecs.addComponent<Skeleton>(astram, astramSkeleton);
    this.ecs.addComponent<Skeleton>(darros, darrosSkeleton);

    const dragon = this.ecs.createEntity();

    this.ecs.addComponent<Transform>(
      dragon,
      new Transform(new Vec(250, 50), new Vec(0, 0), 100)
    );

    const dragonSkeleton = new Skeleton('assets/sprites/Dragon.png');

    const dragonJoint = new Joint(
      'root',
      null,
      0,
      [100, 20, 60, 80, 90, 90, 70, 40],
      [20, 90, 180, 55, 330, 90, 340, 90],
      'blue'
    );

    const dragonPelvis = new Joint(
      'pelvis',
      'root',
      0,
      [0, 75, 200],
      [0, 180, 170],
      'red'
    );

    const dragonbody = new Bone(
      'dragonBody',
      null,
      new Vec(200, 100),
      150,
      237,
      517,
      499 - 237,
      655 - 517,
      80
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
      0
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
      0
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
      0
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
      12
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
      0
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
      0
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
      0
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
      0
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
      0
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
      0
    );

    dragonJoint.bones.push(dragonLeftArm);
    dragonJoint.bones.push(dragonChest);
    dragonJoint.bones.push(dragonRightArm);

    dragonJoint.bones.push(jaw);
    dragonJoint.bones.push(dragonHead);

    dragonJoint.bones.push(leftDragonLowerArm);
    dragonJoint.bones.push(rightDragonLowerArm);

    dragonJoint.bones.push(dragonLeftFist);
    dragonJoint.bones.push(dragonRightFist);

    dragonPelvis.bones.push(dragonBack);
    dragonPelvis.bones.push(dragonbody);

    dragonSkeleton.joints.push(dragonPelvis);
    dragonSkeleton.joints.push(dragonJoint);

    this.ecs.addComponent<Skeleton>(dragon, dragonSkeleton);

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

    //       new Bone(
    //         'lastTail',
    //         'fifthTail',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         130,
    //         1253,
    //         677,
    //         1274 - 1253,
    //         755 - 677
    //       ),
    //       new Bone(
    //         'sixtTail',
    //         'fifthTail',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         120,
    //         1151,
    //         837,
    //         1191 - 1151,
    //         919 - 837
    //       ),
    //       new Bone(
    //         'fifthTail',
    //         'fourthTail',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         100,
    //         1093,
    //         833,
    //         1145 - 1093,
    //         920 - 833
    //       ),
    //       new Bone(
    //         'fourthTail',
    //         'thirdTail',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         100,
    //         1025,
    //         836,
    //         1092 - 1025,
    //         934 - 836
    //       ),
    //       new Bone(
    //         'thirdTail',
    //         'secondTail',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         100,
    //         1171,
    //         680,
    //         1247 - 1171,
    //         821 - 680
    //       ),
    //       new Bone(
    //         'secondTail',
    //         'firstTail',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         110,
    //         1171,
    //         515,
    //         1266 - 1171,
    //         677 - 515
    //       ),
    //       new Bone(
    //         'firstTail',
    //         'chest',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         200,
    //         1033,
    //         514,
    //         1165 - 1033,
    //         826 - 514
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
    this.animationSystem.update(this.ecs, this.renderer);
    //this.movementSystem.update(this.ecs);
    this.controllerSystem.update(this.ecs);
    console.log(Math.floor(performance.now() / 1000));
    window.requestAnimationFrame(() => this.start());
  }
}
