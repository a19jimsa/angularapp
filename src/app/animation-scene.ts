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
import { Render } from './components/render';
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

    const body = new Bone('body', null, new Vec(0, 100), 0, 430, 5, 60, 70, 0);

    const rightArm = new Bone(
      'rightArm',
      null,
      new Vec(0, 0),
      40,
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
      40,
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

    const head = new Bone('head', null, new Vec(0, 0), 75, 25, 20, 75, 75, 0);

    const joint = new Joint(
      'root',
      null,
      270,
      [0, 15, 40, 100, 30],
      [270, 90, 0, 0],
      'blue'
    );

    const pelvis = new Joint(
      'spine',
      'root',
      0,
      [20, 20, 50, 200, 100],
      [270, 90, 0, 0],
      'red'
    );
    const headJoint = new Joint(
      'head',
      'spine',
      50,
      [120, 115, 40, -100],
      [20, 15, 50],
      'green'
    );

    body.flip = true;
    head.flip = true;

    //Draw root bones
    joint.bones.push(leftLeg);
    joint.bones.push(rightLeg);
    joint.bones.push(body);
    joint.bones.push(head);
    joint.bones.push(leftFoot);
    joint.bones.push(rightFoot);

    // // // Draw pelvis children
    pelvis.bones.push(leftArm);
    pelvis.bones.push(rightArm);

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
    // const enemy = this.ecs.createEntity();
    // this.ecs.addComponent<Transform>(
    //   enemy,
    //   new Transform(new Vec(100, 100), new Vec(0, 0), 0)
    // );
    // this.ecs.addComponent<Skeleton>(
    //   player,
    //   new Skeleton(
    //     [
    //       new Bone(
    //         'rightArm',
    //         null,
    //         new Vec(this.width / 2 + 20, this.height / 2 + 10),
    //         100,
    //         90,
    //         175,
    //         42,
    //         85
    //       ),
    //       new Bone('upperLeg', 'body', new Vec(0, 0), 20, 0, 0, 0, 0),
    //       new Bone('lowerLeg', 'upperLeg', new Vec(0, 0), 50, 0, 280, 40, 70),
    //       new Bone(
    //         'body',
    //         null,
    //         new Vec(this.width / 2, this.height / 2),
    //         60,
    //         175,
    //         0,
    //         90,
    //         100
    //       ),

    //       new Bone(
    //         'head',
    //         null,
    //         new Vec(this.width / 2, this.height / 2 - 150),
    //         100,
    //         0,
    //         0,
    //         175,
    //         170
    //       ),
    //       new Bone('sword', 'upperArm', new Vec(0, 0), 100, 175, 115, 90, 280),
    //       new Bone(
    //         'upperArm',
    //         null,
    //         new Vec(this.width / 2 - 40, this.height / 2),
    //         90,
    //         5,
    //         170,
    //         70,
    //         100
    //       ),
    //     ],
    //     'assets/sprites/NinjaSeparated.png'
    //   )
    // );
    // this.ecs.addComponent<Skeleton>(
    //   enemy,
    //   new Skeleton(
    //     [
    //       new Bone('leftUpperLeg', null, new Vec(120, 300), 20, 0, 320, 50, 40),
    //       new Bone(
    //         'leftFoot',
    //         'leftUpperLeg',
    //         new Vec(this.width / 2 - 175, this.height / 2 + 70),
    //         10,
    //         0,
    //         365,
    //         50,
    //         60
    //       ),
    //       new Bone('rightUpperLeg', null, new Vec(90, 300), 20, 0, 320, 50, 40),
    //       new Bone(
    //         'rightFoot',
    //         'rightUpperLeg',
    //         new Vec(0, 0),
    //         10,
    //         0,
    //         365,
    //         50,
    //         60
    //       ),
    //       new Bone('body', null, new Vec(100, 230), 50, 0, 155, 80, 90),
    //       new Bone('torso', 'body', new Vec(0, 0), 50, 80, 160, 95, 66),
    //       new Bone('head', null, new Vec(100, 100), 100, 0, 0, 175, 155),
    //       new Bone('upperArm', null, new Vec(50, 240), 35, 0, 242, 40, 80),
    //       new Bone('lowerArm', 'upperArm', new Vec(0, 0), 10, 50, 365, 38, 54),
    //       new Bone(
    //         'samuraiSword',
    //         'fist',
    //         new Vec(0, 0),
    //         120,
    //         180,
    //         162,
    //         60,
    //         200
    //       ),
    //       new Bone('fist', 'lowerArm', new Vec(0, 0), 20, 110, 335, 50, 50),
    //     ],
    //     'assets/sprites/samurai.png'
    //   )
    // );

    // const hero = this.ecs.createEntity();

    // this.ecs.addComponent(
    //   hero,
    //   new Transform(new Vec(300, 300), new Vec(0, 0), 0)
    // );

    // this.ecs.addComponent(
    //   hero,
    //   new Skeleton(
    //     [
    //       new Bone(
    //         'leftArm',
    //         'body',
    //         new Vec(0, 0),
    //         30,
    //         -40,
    //         0,
    //         0,
    //         40,
    //         23,
    //         150,
    //         22,
    //         45,
    //         0
    //       ),
    //       new Bone(
    //         'leftLowerArm',
    //         'leftArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         0,
    //         210,
    //         155,
    //         30,
    //         35,
    //         0
    //       ),
    //       new Bone(
    //         'leftLeg',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         40,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'leftFoot',
    //         'leftLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         160,
    //         40,
    //         40,
    //         0
    //       ),
    //       new Bone(
    //         'rightLeg',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         40,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),

    //       new Bone(
    //         'body',
    //         null,
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         50,
    //         430,
    //         0,
    //         60,
    //         70,
    //         0
    //       ),
    //       new Bone(
    //         'head',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         -100,
    //         0,
    //         0,
    //         0,
    //         25,
    //         20,
    //         75,
    //         75,
    //         0
    //       ),
    //       new Bone(
    //         'rightArm',
    //         'body',
    //         new Vec(0, 0),
    //         -5,
    //         -35,
    //         0,
    //         0,
    //         35,
    //         145,
    //         158,
    //         28,
    //         60,
    //         0
    //       ),
    //       new Bone(
    //         'weapon',
    //         'rightLowerArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         100,
    //         418,
    //         200,
    //         85,
    //         160
    //       ),
    //       new Bone(
    //         'rightLowerArm',
    //         'rightArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         213,
    //         155,
    //         20,
    //         40,
    //         0
    //       ),
    //       new Bone(
    //         'rightFoot',
    //         'rightLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         0,
    //         455,
    //         160,
    //         40,
    //         40,
    //         0
    //       ),
    //     ],
    //     'assets/sprites/Barst.png'
    //   )
    // );
    // const astram = this.ecs.createEntity();
    // this.ecs.addComponent(
    //   astram,
    //   new Transform(new Vec(400, 300), new Vec(0, 0), 0)
    // );
    // this.ecs.addComponent(
    //   astram,
    //   new Skeleton(
    //     [
    //       new Bone(
    //         'leftArm',
    //         'body',
    //         new Vec(0, 0),
    //         20,
    //         -40,
    //         0,
    //         0,
    //         40,
    //         23,
    //         150,
    //         22,
    //         45,
    //         0
    //       ),
    //       new Bone(
    //         'leftLowerArm',
    //         'leftArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         0,
    //         210,
    //         155,
    //         30,
    //         35,
    //         0
    //       ),
    //       new Bone(
    //         'leftLeg',
    //         'body',
    //         new Vec(0, 0),
    //         15,
    //         0,
    //         0,
    //         0,
    //         40,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'leftFoot',
    //         'leftLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         160,
    //         40,
    //         40,
    //         0
    //       ),
    //       new Bone(
    //         'rightLeg',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         40,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'body',
    //         null,
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         50,
    //         430,
    //         0,
    //         60,
    //         70,
    //         0
    //       ),
    //       new Bone(
    //         'head',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         -105,
    //         0,
    //         0,
    //         0,
    //         25,
    //         20,
    //         75,
    //         75,
    //         0
    //       ),
    //       new Bone(
    //         'rightArm',
    //         'body',
    //         new Vec(0, 0),
    //         -10,
    //         -41,
    //         0,
    //         0,
    //         40,
    //         145,
    //         150,
    //         28,
    //         50,
    //         0
    //       ),
    //       new Bone(
    //         'rightLowerArm',
    //         'rightArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         213,
    //         155,
    //         20,
    //         40,
    //         0
    //       ),
    //       new Bone(
    //         'rightFoot',
    //         'rightLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         160,
    //         40,
    //         40,
    //         0
    //       ),
    //     ],
    //     'assets/sprites/Astram.png'
    //   )
    // );

    // const arden = this.ecs.createEntity();
    // this.ecs.addComponent<Transform>(
    //   arden,
    //   new Transform(new Vec(500, 300), new Vec(0, 0), 0)
    // );
    // this.ecs.addComponent<Skeleton>(
    //   arden,
    //   new Skeleton(
    //     [
    //       new Bone(
    //         'leftArm',
    //         'body',
    //         new Vec(0, 0),
    //         15,
    //         -40,
    //         0,
    //         0,
    //         40,
    //         23,
    //         150,
    //         22,
    //         45,
    //         0
    //       ),
    //       new Bone(
    //         'leftLowerArm',
    //         'leftArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         0,
    //         210,
    //         155,
    //         30,
    //         35,
    //         0
    //       ),
    //       new Bone(
    //         'leftLeg',
    //         'body',
    //         new Vec(0, 0),
    //         15,
    //         0,
    //         0,
    //         0,
    //         45,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'leftFoot',
    //         'leftLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         160,
    //         50,
    //         50,
    //         0
    //       ),
    //       new Bone(
    //         'rightLeg',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         45,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'body',
    //         null,
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         50,
    //         430,
    //         0,
    //         60,
    //         70,
    //         0
    //       ),
    //       new Bone(
    //         'head',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         -105,
    //         0,
    //         0,
    //         0,
    //         25,
    //         20,
    //         75,
    //         75,
    //         0
    //       ),
    //       new Bone(
    //         'rightArm',
    //         'body',
    //         new Vec(0, 0),
    //         -20,
    //         -30,
    //         0,
    //         0,
    //         50,
    //         145,
    //         150,
    //         28,
    //         50,
    //         0
    //       ),
    //       new Bone(
    //         'rightLowerArm',
    //         'rightArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         213,
    //         155,
    //         20,
    //         40,
    //         0
    //       ),
    //       new Bone(
    //         'rightFoot',
    //         'rightLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         160,
    //         50,
    //         50,
    //         0
    //       ),
    //     ],
    //     'assets/sprites/Darros.png'
    //   )
    // );

    // const draug = this.ecs.createEntity();
    // this.ecs.addComponent<Transform>(
    //   draug,
    //   new Transform(new Vec(600, 300), new Vec(0, 0), 0)
    // );

    // this.ecs.addComponent<Skeleton>(
    //   draug,
    //   new Skeleton(
    //     [
    //       new Bone(
    //         'leftArm',
    //         'body',
    //         new Vec(0, 0),
    //         15,
    //         -40,
    //         0,
    //         0,
    //         40,
    //         23,
    //         150,
    //         22,
    //         45,
    //         0
    //       ),
    //       new Bone(
    //         'leftLowerArm',
    //         'leftArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         0,
    //         210,
    //         155,
    //         30,
    //         35,
    //         0
    //       ),
    //       new Bone(
    //         'leftLeg',
    //         'body',
    //         new Vec(0, 0),
    //         15,
    //         0,
    //         0,
    //         0,
    //         30,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'leftFoot',
    //         'leftLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         150,
    //         50,
    //         50,
    //         0
    //       ),
    //       new Bone(
    //         'rightLeg',
    //         'body',
    //         new Vec(0, 0),
    //         30,
    //         0,
    //         0,
    //         0,
    //         30,
    //         400,
    //         145,
    //         33,
    //         55,
    //         0
    //       ),
    //       new Bone(
    //         'body',
    //         null,
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         50,
    //         430,
    //         0,
    //         60,
    //         80,
    //         0
    //       ),
    //       new Bone(
    //         'head',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         -105,
    //         0,
    //         0,
    //         0,
    //         25,
    //         20,
    //         75,
    //         75,
    //         0
    //       ),
    //       new Bone(
    //         'rightArm',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         30,
    //         145,
    //         150,
    //         28,
    //         50,
    //         0
    //       ),
    //       new Bone(
    //         'rightLowerArm',
    //         'rightArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         213,
    //         155,
    //         20,
    //         40,
    //         0
    //       ),
    //       new Bone(
    //         'rightFoot',
    //         'rightLeg',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         20,
    //         455,
    //         150,
    //         50,
    //         50,
    //         0
    //       ),
    //     ],
    //     'assets/sprites/Draug.png'
    //   )
    // );

    // const dragon = this.ecs.createEntity();

    // this.ecs.addComponent<Transform>(
    //   dragon,
    //   new Transform(new Vec(800, 200), new Vec(0, 0), 100)
    // );

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
    //         'leftArm',
    //         'chest',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         100,
    //         0,
    //         100,
    //         644,
    //         627,
    //         734 - 644,
    //         791 - 627
    //       ),
    //       new Bone(
    //         'leftLowerArm',
    //         'leftArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         120,
    //         639,
    //         794,
    //         749 - 639,
    //         939 - 794
    //       ),
    //       new Bone(
    //         'back',
    //         'body',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         100,
    //         334,
    //         827,
    //         512 - 334,
    //         1020 - 827
    //       ),
    //       new Bone(
    //         'body',
    //         'chest',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         100,
    //         238,
    //         517,
    //         498 - 238,
    //         656 - 517,
    //         0
    //       ),

    //       new Bone(
    //         'chest',
    //         null,
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         162,
    //         292,
    //         661,
    //         505 - 292,
    //         823 - 661,
    //         0
    //       ),

    //       new Bone(
    //         'head',
    //         'chest',
    //         new Vec(0, 0),
    //         70,
    //         -200,
    //         0,
    //         0,
    //         80,
    //         0,
    //         516,
    //         230,
    //         140,
    //         1
    //       ),
    //       new Bone(
    //         'jaw',
    //         'head',
    //         new Vec(0, 0),
    //         -20,
    //         0,
    //         0,
    //         0,
    //         0,
    //         230,
    //         661,
    //         288 - 230,
    //         756 - 661,
    //         2
    //       ),
    //       new Bone(
    //         'rightArm',
    //         'chest',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         -90,
    //         -150,
    //         80,
    //         512,
    //         503,
    //         642 - 512,
    //         713 - 503
    //       ),
    //       new Bone(
    //         'rightLowerArm',
    //         'rightArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         0,
    //         220,
    //         518,
    //         705,
    //         638 - 518,
    //         950 - 705
    //       ),

    //       new Bone(
    //         'leftFist',
    //         'leftLowerArm',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         10,
    //         0,
    //         939,
    //         75 - 0,
    //         983 - 939
    //       ),
    //       new Bone(
    //         'firstFinger',
    //         'leftFist',
    //         new Vec(0, 0),
    //         40,
    //         10,
    //         0,
    //         218,
    //         897,
    //         245 - 218,
    //         937 - 897
    //       ),
    //       new Bone(
    //         'secondFinger',
    //         'leftFist',
    //         new Vec(0, 0),
    //         30,
    //         0,
    //         0,
    //         148,
    //         881,
    //         174 - 148,
    //         939 - 881
    //       ),
    //       new Bone(
    //         'thirdFinger',
    //         'leftFist',
    //         new Vec(0, 0),
    //         20,
    //         -5,
    //         0,
    //         95,
    //         862,
    //         127 - 95,
    //         927 - 862
    //       ),
    //       new Bone(
    //         'fourthFinger',
    //         'leftFist',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         218,
    //         831,
    //         247 - 218,
    //         887 - 831
    //       ),
    //       new Bone(
    //         'fifthFinger',
    //         'leftFist',
    //         new Vec(0, 0),
    //         -25,
    //         10,
    //         0,
    //         297,
    //         828,
    //         331 - 297,
    //         882 - 828
    //       ),
    //       new Bone(
    //         'rightFist',
    //         'rightLowerArm',
    //         new Vec(0, 0),
    //         20,
    //         0,
    //         10,
    //         0,
    //         939,
    //         75 - 0,
    //         983 - 939
    //       ),
    //       new Bone(
    //         'firstFinger',
    //         'rightFist',
    //         new Vec(0, 0),
    //         40,
    //         10,
    //         0,
    //         218,
    //         897,
    //         245 - 218,
    //         937 - 897
    //       ),
    //       new Bone(
    //         'secondFinger',
    //         'rightFist',
    //         new Vec(0, 0),
    //         30,
    //         0,
    //         0,
    //         148,
    //         881,
    //         174 - 148,
    //         939 - 881
    //       ),
    //       new Bone(
    //         'thirdFinger',
    //         'rightFist',
    //         new Vec(0, 0),
    //         20,
    //         -5,
    //         0,
    //         95,
    //         862,
    //         127 - 95,
    //         927 - 862
    //       ),
    //       new Bone(
    //         'fourthFinger',
    //         'rightFist',
    //         new Vec(0, 0),
    //         0,
    //         0,
    //         0,
    //         218,
    //         831,
    //         247 - 218,
    //         887 - 831
    //       ),
    //       new Bone(
    //         'fifthFinger',
    //         'rightFist',
    //         new Vec(0, 0),
    //         -25,
    //         10,
    //         0,
    //         297,
    //         828,
    //         331 - 297,
    //         882 - 828
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
