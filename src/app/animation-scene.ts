import { ElementRef } from '@angular/core';
import { Ecs } from './ecs';
import { Renderer } from './renderer';
import { Transform } from './components/transform';
import { Vec } from './vec';
import { Skeleton } from './components/skeleton';
import { AnimationSystem } from './systems/animation-system';
import { MovementSystem } from './systems/movement-system';
import { ControllerSystem } from './systems/controller-system';
import { Controlable } from './components/controlable';
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
import { WeaponSystem } from './systems/weapon-system';
import { Loader } from './loader';
import { FlyerIdleState } from './States/flyer-idle-state';
import { DragonIdleState } from './States/dragon-idle-state';
import { HorseIdleState } from './States/horse-idle-state';
import { PhysicsSystem } from './systems/physics-system';
import { Weapon } from './components/weapon';

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
  physicsSystem: PhysicsSystem;
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
    this.physicsSystem = new PhysicsSystem();
  }

  async init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    const dragon = this.ecs.createEntity();
    const flyer = this.ecs.createEntity();
    const draug = this.ecs.createEntity();
    const horse = this.ecs.createEntity();
    const weapon = this.ecs.createEntity();
    const woman = this.ecs.createEntity();

    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(0, 350), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      dragon,
      new Transform(new Vec(200, 150), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      flyer,
      new Transform(new Vec(500, this.canvasHeight / 3), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      draug,
      new Transform(new Vec(700, 350), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Transform>(
      horse,
      new Transform(new Vec(800, 100), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      woman,
      new Transform(new Vec(1000, 350), new Vec(0, 0), 0)
    );

    const playerSkeleton = new Skeleton('assets/sprites/88022.png');
    const dragonSkeleton = new Skeleton('assets/sprites/Dragon.png');
    const flyerSkeleton = new Skeleton('assets/sprites/161452.png');
    const draugSkeleton = new Skeleton('assets/sprites/104085.png');
    const horseSkeleton = new Skeleton('assets/sprites/115616.png');
    const womanSkeleton = new Skeleton('assets/sprites/88444.png');

    //Create character bones from JSON file
    const skeletonBones = await Loader.loadFromJSON(
      './assets/json/skeleton.json'
    );
    const dragonBones = await Loader.loadFromJSON(
      'assets/json/dragonbones.json'
    );
    const flyerBones = await Loader.loadFromJSON('assets/json/flyerbones.json');
    const draugBones = await Loader.loadFromJSON('assets/json/skeleton.json');
    const horseBones = await Loader.loadFromJSON('assets/json/horsebones.json');
    const womanBones = await Loader.loadFromJSON('assets/json/skeleton.json');

    playerSkeleton.bones.push(...skeletonBones);

    dragonSkeleton.bones.push(...dragonBones);
    dragonSkeleton.state = new DragonIdleState();

    flyerSkeleton.bones.push(...flyerBones);
    flyerSkeleton.state = new FlyerIdleState();

    draugSkeleton.bones.push(...draugBones);

    horseSkeleton.bones.push(...horseBones);
    horseSkeleton.state = new HorseIdleState();

    womanSkeleton.bones.push(...womanBones);

    this.ecs.addComponent<Skeleton>(player, playerSkeleton);
    this.ecs.addComponent<Skeleton>(dragon, dragonSkeleton);
    this.ecs.addComponent<Skeleton>(flyer, flyerSkeleton);
    this.ecs.addComponent<Skeleton>(draug, draugSkeleton);
    this.ecs.addComponent<Skeleton>(horse, horseSkeleton);
    this.ecs.addComponent<Skeleton>(woman, womanSkeleton);

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 0), 0, false)
    );

    this.ecs.addComponent<Camera>(player, new Camera());
    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));
    this.player = player;

    this.ecs.addComponent<Ai>(dragonSkeleton, new Ai('idle', null, 500, 500));

    const newWeapon = this.ecs.createEntity();
    this.ecs.addComponent<Weapon>(
      newWeapon,
      new Weapon(
        'right_hand',
        'assets/sprites/wep_ax066.png',
        new Vec(-10, 105)
      )
    );
    this.ecs.addComponent<Weapon>(
      weapon,
      new Weapon('left_hand', 'assets/sprites/wep_bw026.png', new Vec(20, 140))
    );
    const arrow = this.ecs.createEntity();
    this.ecs.addComponent<Weapon>(
      arrow,
      new Weapon('right_hand', 'assets/sprites/wep_ar000.png', new Vec(0, 0))
    );

    playerSkeleton.heldOffhandEntity = arrow;
    playerSkeleton.heldEntity = weapon;
    draugSkeleton.heldEntity = newWeapon;
    womanSkeleton.heldEntity = newWeapon;
  }

  start() {
    this.renderer.clearScreen();
    this.renderer.drawForeground();
    this.controllerSystem.update(this.ecs);
    this.movementSystem.update(this.ecs);
    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );

    this.physicsSystem.update(this.ecs);
    this.aiSystem.update(this.ecs, this.player!);
    this.animationSystem.update(this.ecs);
    this.weaponSystem.update(this.ecs);
    this.attackSystem.update(this.ecs, this.renderer);
    this.attackDurationSystem.update(this.ecs);
    this.deadSystem.update(this.ecs);
    this.hitBoxSystem.update(this.ecs, this.renderer);
    this.projectileSystem.update(this.ecs, this.renderer);

    this.renderer.renderCharacter(this.ecs);
    this.renderer.renderWeapons(this.ecs);

    this.loopId = window.requestAnimationFrame(() => this.start());
  }
}
