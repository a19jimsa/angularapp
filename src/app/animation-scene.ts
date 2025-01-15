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
import { Loader } from './loader';
import { OnGroundState } from './States/on-ground-state';
import { JumpingState } from './States/jumping-state';

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

  async init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    const dragon = this.ecs.createEntity();

    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(0, this.canvasHeight / 2), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      dragon,
      new Transform(new Vec(500, this.canvasHeight / 2), new Vec(0, 0), 10)
    );

    const playerSkeleton = new Skeleton('assets/sprites/88022.png');
    const enemySkeleton = new Skeleton('assets/sprites/88022.png');

    //Create character bones from JSON file
    const skeletonBones = await Loader.loadFromJSON(
      './assets/json/skeleton.json'
    );

    const enemyBones = await Loader.loadFromJSON('assets/json/skeleton.json');

    playerSkeleton.bones.push(...skeletonBones);
    playerSkeleton.state = new OnGroundState();
    const keyframes = await playerSkeleton.state.loadAnimation(
      'assets/json/running.json'
    );
    playerSkeleton.state.keyframes = keyframes;

    enemySkeleton.bones.push(...enemyBones);

    enemySkeleton.state = new JumpingState();
    enemySkeleton.state.keyframes = await playerSkeleton.state.loadAnimation(
      'assets/json/attack.json'
    );

    this.ecs.addComponent<Skeleton>(player, playerSkeleton);
    this.ecs.addComponent<Skeleton>(dragon, enemySkeleton);

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 0), 0, false)
    );

    this.ecs.addComponent<Camera>(player, new Camera());
    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));
    this.player = player;

    this.ecs.addComponent<Ai>(enemySkeleton, new Ai('idle', null, 500, 500));
  }

  start() {
    this.renderer.clearScreen();
    this.controllerSystem.update(this.ecs);
    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );

    this.aiSystem.update(this.ecs, this.player!);
    this.animationSystem.update(this.ecs);
    this.movementSystem.update(this.ecs);
    this.weaponSystem.update(this.ecs, this.renderer);
    this.attackSystem.update(this.ecs, this.renderer);
    this.attackDurationSystem.update(this.ecs);
    this.deadSystem.update(this.ecs);
    this.hitBoxSystem.update(this.ecs, this.renderer);
    this.projectileSystem.update(this.ecs, this.renderer);
    this.renderer.renderCharacter(this.ecs);

    this.loopId = window.requestAnimationFrame(() => this.start());
  }
}
