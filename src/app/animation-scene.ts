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
import { AttackSystem } from './systems/attack-system';
import { DeadSystem } from './systems/dead-system';
import { AttackDurationSystem } from './systems/attack-duration-system';
import { AiSystem } from './systems/ai-system';
import { Entity } from './entity';
import { Ai } from './components/ai';
import { HitBoxSystem } from './systems/hit-box-system';
import { ProjectileSystem } from './systems/projectile-system';
import { Sprite } from './components/sprite';
import { ParentBone } from './components/parent-bone';
import { WeaponSystem } from './systems/weapon-system';
import { Rotation } from './components/rotation';
import { Damage } from './components/damage';
import { Element } from './components/element';

export class AnimationScene {
  canvas: ElementRef<HTMLCanvasElement>;
  renderer!: Renderer;
  ecs: Ecs;
  player: Entity | null = null;
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
  aiSystem: AiSystem;
  hitBoxSystem: HitBoxSystem;
  projectileSystem: ProjectileSystem;
  weaponSystem: WeaponSystem;
  loopId = 0;

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

    this.canvas.nativeElement.width = canvasWidth;
    this.canvas.nativeElement.height = canvasheight;
    this.animationSystem = new AnimationSystem();
    this.movementSystem = new MovementSystem();
    this.controllerSystem = new ControllerSystem();
    this.cameraSystem = new CameraSystem();
    this.attackSystem = new AttackSystem();
    this.deadSystem = new DeadSystem();
    this.attackDurationSystem = new AttackDurationSystem();
    this.aiSystem = new AiSystem();
    this.hitBoxSystem = new HitBoxSystem();
    this.projectileSystem = new ProjectileSystem();
    this.weaponSystem = new WeaponSystem();
  }

  init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    const dragon = this.ecs.createEntity();

    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(0, this.canvasHeight / 2), new Vec(0, 0), 10)
    );

    const playerSkeleton = new Skeleton('assets/sprites/Arden.png');

    //Create character bones from JSON file

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
      25,
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
      30,
      23,
      150,
      22,
      45,
      0,
      -20,
      new Vec(20, 10)
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
      -2,
      new Vec(0, 0)
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
      -2,
      new Vec(0, 0)
    );

    const leftLowerArm = new Bone(
      'leftLowerArm',
      'leftArm',
      new Vec(0, 5),
      15,
      210,
      155,
      30,
      35,
      0,
      -2,
      new Vec(0, 0)
    );

    const rightLowerArm = new Bone(
      'rightLowerArm',
      'rightArm',
      new Vec(0, 5),
      15,
      210,
      155,
      30,
      35,
      0,
      20,
      new Vec(0, 0)
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
      new Vec(0, -60)
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
      0,
      new Vec(0, 0)
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
      0,
      new Vec(0, 0)
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
      0,
      new Vec(0, 0)
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
      0,
      new Vec(0, 0)
    );

    const joint = new Joint('root', null, 270, 'blue');

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

    console.log(JSON.stringify(playerSkeleton.bones));

    playerSkeleton.joints.push(joint);

    this.ecs.addComponent<Skeleton>(player, playerSkeleton);

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
      95,
      644,
      627,
      734 - 644,
      791 - 627,
      0,
      -3,
      new Vec(110, 20)
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
      8,
      new Vec(0, 0)
    );

    const leftDragonLowerArm = new Bone(
      'dragonLeftLowerArm',
      'dragonLeftArm',
      new Vec(0, 0),
      130,
      639,
      794,
      749 - 639,
      939 - 794,
      0,
      -2,
      new Vec(0, 0)
    );

    const rightDragonLowerArm = new Bone(
      'dragonRightLowerArm',
      'dragonRightArm',
      new Vec(0, 0),
      200,
      518,
      705,
      638 - 518,
      950 - 705,
      0,
      10,
      new Vec(0, 0)
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
      -1,
      new Vec(0, 0)
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
      13,
      new Vec(0, 0)
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
      13,
      new Vec(0, 0)
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
      new Vec(-300, -50)
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
      -15,
      new Vec(0, 0)
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
      -16,
      new Vec(0, 0)
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
      -17,
      new Vec(0, 0)
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
      -18,
      new Vec(0, 0)
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
      -19,
      new Vec(0, 0)
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
      -20,
      new Vec(0, 0)
    );

    const leftWing = new Bone(
      'leftWing',
      null,
      new Vec(0, 0),
      100,
      918,
      666,
      1017 - 918,
      841 - 666,
      0,
      -10,
      new Vec(100, -100)
    );

    const rightWing = new Bone(
      'rightWing',
      null,
      new Vec(0, 0),
      100,
      641,
      514,
      936 - 641,
      618 - 514,
      0,
      2,
      new Vec(-150, 0)
    );

    const dragonJoint = new Joint('root', null, 0, 'blue');

    dragonSkeleton.bones.push(dragonbody);
    dragonSkeleton.bones.push(dragonChest);
    dragonSkeleton.bones.push(dragonLeftArm);
    dragonSkeleton.bones.push(dragonRightArm);
    dragonSkeleton.bones.push(firstTail);
    dragonSkeleton.bones.push(dragonHead);
    dragonSkeleton.bones.push(jaw);
    dragonSkeleton.bones.push(rightWing);
    dragonSkeleton.bones.push(leftWing);

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

    console.log(JSON.stringify(dragonSkeleton.bones));

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 0), 0, false)
    );

    this.ecs.addComponent<Camera>(player, new Camera());
    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));
    this.player = player;

    this.ecs.addComponent<Ai>(dragon, new Ai('idle', null, 500, 500));

    //Create weapon
    const weaponEntity1 = this.ecs.createEntity();
    this.ecs.addComponent(
      weaponEntity1,
      new Transform(new Vec(0, 0), new Vec(0, 0), 10)
    );

    this.ecs.addComponent(
      weaponEntity1,
      new Sprite('assets/sprites/wep_ax043.png')
    );

    this.ecs.addComponent(weaponEntity1, new ParentBone('leftLowerArm'));
    this.ecs.addComponent(weaponEntity1, new Rotation());
    //Create weapon
    const weaponEntity = this.ecs.createEntity();
    this.ecs.addComponent(
      weaponEntity,
      new Transform(new Vec(0, 0), new Vec(0, 0), 10)
    );

    this.ecs.addComponent(
      weaponEntity,
      new Sprite('assets/sprites/wep_ax066.png')
    );

    this.ecs.addComponent(weaponEntity, new ParentBone('rightLowerArm'));
    this.ecs.addComponent(weaponEntity, new Rotation());
    this.ecs.addComponent(weaponEntity1, new Damage(100));
    this.ecs.addComponent(weaponEntity1, new Element('fire'));
  }

  start() {
    this.renderer.clearScreen();
    this.renderer.drawForeground();
    this.controllerSystem.update(this.ecs);
    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );

    this.aiSystem.update(this.ecs, this.player!);
    this.animationSystem.update(this.ecs, this.renderer);
    this.movementSystem.update(this.ecs);
    this.weaponSystem.update(this.ecs, this.renderer);

    this.attackSystem.update(this.ecs, this.renderer);
    this.attackDurationSystem.update(this.ecs);
    this.deadSystem.update(this.ecs);
    this.hitBoxSystem.update(this.ecs, this.renderer);
    this.projectileSystem.update(this.ecs, this.renderer);

    this.loopId = window.requestAnimationFrame(() => this.start());
  }
}
