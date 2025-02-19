import { ElementRef } from '@angular/core';
import { Ecs } from '../core/ecs';
import { Renderer } from './renderer';
import { Transform } from '../components/transform';
import { Vec } from './vec';
import { Skeleton } from '../components/skeleton';
import { AnimationSystem } from '../systems/animation-system';
import { MovementSystem } from '../systems/movement-system';
import { ControllerSystem } from '../systems/controller-system';
import { Controlable } from '../components/controlable';
import { Camera } from '../components/camera';
import { CameraSystem } from '../systems/camera-system';
import { AttackSystem } from '../systems/attack-system';
import { DeadSystem } from '../systems/dead-system';
import { AttackDurationSystem } from '../systems/attack-duration-system';
import { AiSystem } from '../systems/ai-system';
import { Entity } from './entity';
import { Ai } from '../components/ai';
import { HitBoxSystem } from '../systems/hit-box-system';
import { ProjectileSystem } from '../systems/projectile-system';
import { WeaponSystem } from '../systems/weapon-system';
import { Loader } from './loader';
import { PhysicsSystem } from '../systems/physics-system';
import { Weapon } from '../components/weapon';
import { Flying } from '../components/flying';
import { Foot } from '../components/foot';
import { InitializationSystem } from '../systems/initialization-system';
import { HurtBoxSystem } from '../systems/hurt-box-system';
import { Sprite } from '../components/sprite';
import { HitBox } from '../components/hit-box';
import { HurtBox } from '../components/hurt-box';
import { ResourceManager } from 'src/core/resource-manager';
import { WalkBox } from 'src/components/walk-box';
import { Enemy } from 'src/components/enemy';
import { AimingSystem } from 'src/systems/aiming-system';
import { MouseHandler } from './mouse-handler';
import { State } from 'src/components/state';
import { StateSystem } from 'src/systems/state-system';
import { Player } from 'src/components/player';
import { Target } from 'src/components/target';
import { PatrolSystem } from 'src/systems/patrol-system';
import { ChaseSystem } from 'src/systems/chase-system';

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
  initializationSystem: InitializationSystem;
  hurtBoxSystem: HurtBoxSystem;
  aimingSystem: AimingSystem;
  stateSystem: StateSystem;
  mouseHandler: MouseHandler;
  patrolSystem: PatrolSystem;
  chaseSystem: ChaseSystem;
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

    this.mouseHandler = new MouseHandler(canvas);

    this.animationSystem = new AnimationSystem();
    this.movementSystem = new MovementSystem();
    this.controllerSystem = new ControllerSystem(this.mouseHandler);
    this.cameraSystem = new CameraSystem();
    this.attackSystem = new AttackSystem();
    this.deadSystem = new DeadSystem();
    this.attackDurationSystem = new AttackDurationSystem();
    this.aiSystem = new AiSystem();
    this.hitBoxSystem = new HitBoxSystem();
    this.projectileSystem = new ProjectileSystem();
    this.weaponSystem = new WeaponSystem();
    this.physicsSystem = new PhysicsSystem();
    this.initializationSystem = new InitializationSystem();
    this.hurtBoxSystem = new HurtBoxSystem();
    this.aimingSystem = new AimingSystem(this.mouseHandler);
    this.stateSystem = new StateSystem();
    this.patrolSystem = new PatrolSystem();
    this.chaseSystem = new ChaseSystem();
  }

  async init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    const dragon = this.ecs.createEntity();
    const flyer = this.ecs.createEntity();
    const draug = this.ecs.createEntity();
    const horse = this.ecs.createEntity();
    const enemy = this.ecs.createEntity();
    const dragon2 = this.ecs.createEntity();
    const birdBoss = this.ecs.createEntity();

    //Just create some ground that is walkable with collision
    for (let i = 1; i < 5; i++) {
      const background = this.ecs.createEntity();
      this.ecs.addComponent<Sprite>(
        background,
        new Sprite('assets/sprites/backgrounds/87844.png')
      );
      const backgroundSprite = this.ecs.getComponent<Sprite>(
        background,
        'Sprite'
      );
      this.ecs.addComponent<Transform>(
        background,
        new Transform(
          new Vec(
            (i - 1) * backgroundSprite.image.width,
            this.canvasHeight - backgroundSprite.image.height
          ),
          new Vec(0, 0),
          0
        )
      );
    }

    //Walkbox components
    const walkBox = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      walkBox,
      new Transform(new Vec(0, this.canvasHeight - 100), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<HitBox>(walkBox, new HitBox(this.canvasWidth, 1));
    this.ecs.addComponent<WalkBox>(walkBox, new WalkBox());

    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(0, 0), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      dragon,
      new Transform(new Vec(0, 0), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      dragon2,
      new Transform(new Vec(1500, 0), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Transform>(
      flyer,
      new Transform(new Vec(500, 0), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      draug,
      new Transform(new Vec(300, 0), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Transform>(
      horse,
      new Transform(new Vec(800, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      enemy,
      new Transform(new Vec(1000, 0), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Transform>(
      birdBoss,
      new Transform(new Vec(1500, 0), new Vec(0, 0), 0)
    );

    await ResourceManager.loadAllAnimation();
    //Create character bones from JSON file
    const skeletonBones = await Loader.loadFromJSON(
      'assets/json/skeleton.json'
    );
    const dragonBones = await Loader.loadFromJSON(
      'assets/json/dragonbones.json'
    );

    const flyerBones = await Loader.loadFromJSON('assets/json/flyerbones.json');
    const draugBones = await Loader.loadFromJSON('assets/json/skeleton.json');
    const horseBones = await Loader.loadFromJSON('assets/json/horsebones.json');
    const womanBones = await Loader.loadFromJSON('assets/json/skeleton.json');
    const dragonBones2 = await Loader.loadFromJSON('assets/json/dragon2.json');
    const birdBones = await Loader.loadFromJSON('assets/json/bigbird.json');

    //TODO Add sprites to resource manager instead
    const playerSkeleton = new Skeleton('assets/sprites/88022.png');
    const dragonSkeleton = new Skeleton('assets/sprites/Dragon.png');
    const flyerSkeleton = new Skeleton('assets/sprites/161452.png');
    const draugSkeleton = new Skeleton('assets/sprites/104085.png');
    const horseSkeleton = new Skeleton('assets/sprites/115616.png');
    const enemySkeleton = new Skeleton('assets/sprites/94814.png');
    const dragon2Skeleton = new Skeleton('assets/sprites/161326.png');
    const birdBossSkeleton = new Skeleton('assets/sprites/113969.png');

    playerSkeleton.bones.push(...skeletonBones);
    dragonSkeleton.bones.push(...dragonBones);
    flyerSkeleton.bones.push(...flyerBones);
    draugSkeleton.bones.push(...draugBones);
    horseSkeleton.bones.push(...horseBones);
    enemySkeleton.bones.push(...womanBones);
    dragon2Skeleton.bones.push(...dragonBones2);
    birdBossSkeleton.bones.push(...birdBones);

    this.ecs.addComponent<Skeleton>(player, playerSkeleton);
    this.ecs.addComponent<Skeleton>(dragon, dragonSkeleton);
    this.ecs.addComponent<Skeleton>(flyer, flyerSkeleton);
    this.ecs.addComponent<Skeleton>(draug, draugSkeleton);
    this.ecs.addComponent<Skeleton>(horse, horseSkeleton);
    this.ecs.addComponent<Skeleton>(enemy, enemySkeleton);
    this.ecs.addComponent<Skeleton>(dragon2, dragon2Skeleton);
    this.ecs.addComponent<Skeleton>(birdBoss, birdBossSkeleton);

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 0), 0, false)
    );

    this.ecs.addComponent<State>(player, new State('playerAnimations'));
    this.ecs.addComponent<State>(enemy, new State('playerAnimations'));
    this.ecs.addComponent<State>(draug, new State('playerAnimations'));
    this.ecs.addComponent<State>(dragon, new State('dragonAnimations'));
    this.ecs.addComponent<Camera>(player, new Camera());
    this.ecs.addComponent<Player>(player, new Player());

    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));

    this.ecs.addComponent<Ai>(enemy, new Ai(1000, 150));
    this.ecs.addComponent<Ai>(draug, new Ai(1000, 150));
    this.ecs.addComponent<Target>(enemy, new Target(player));
    this.ecs.addComponent<Target>(draug, new Target(player));
    this.ecs.addComponent<Flying>(flyer, new Flying());

    const newWeapon = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      newWeapon,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      newWeapon,
      new Weapon(
        'right_hand',
        'assets/sprites/wep_ax066.png',
        new Vec(-10, 105)
      )
    );

    const bow = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      bow,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      bow,
      new Weapon('left_hand', 'assets/sprites/wep_bw026.png', new Vec(20, 140))
    );

    const arrow = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      arrow,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      arrow,
      new Weapon('right_hand', 'assets/sprites/wep_ar000.png', new Vec(0, 0))
    );

    const sword = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      sword,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      sword,
      new Weapon('right_hand', 'assets/sprites/wep_sw008.png', new Vec(0, 120))
    );
    const sword2 = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      sword2,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      sword2,
      new Weapon('right_hand', 'assets/sprites/wep_sw046.png', new Vec(0, 120))
    );
    this.ecs.addComponent<HurtBox>(sword, new HurtBox());

    this.ecs.addComponent<Foot>(player, new Foot('right_foot'));
    this.ecs.addComponent<Foot>(dragon, new Foot('right_hand'));
    this.ecs.addComponent<Foot>(flyer, new Foot('last_tail'));

    this.ecs.addComponent<HitBox>(player, new HitBox(50, 100));

    playerSkeleton.heldOffhandEntity = null;
    //this.ecs.addComponent<Smear>(sword, new Smear());
    playerSkeleton.heldEntity = sword;
    draugSkeleton.heldEntity = sword2;
    enemySkeleton.heldEntity = newWeapon;

    this.ecs.addComponent<Enemy>(enemy, new Enemy());
    this.ecs.addComponent<HitBox>(enemy, new HitBox(100, 100));
    this.ecs.addComponent<Enemy>(draug, new Enemy());
    this.ecs.addComponent<HitBox>(draug, new HitBox(100, 100));

    this.initializationSystem.update(this.ecs);
    console.log(this.ecs);
  }

  gameLoop() {
    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );
    this.aiSystem.update(this.ecs);
    this.controllerSystem.update(this.ecs);
    this.movementSystem.update(this.ecs);
    this.physicsSystem.update(this.ecs);
    this.patrolSystem.update(this.ecs);
    this.chaseSystem.update(this.ecs);
    this.stateSystem.update(this.ecs);
    this.animationSystem.update(this.ecs);
    this.aimingSystem.update(this.ecs);
    this.weaponSystem.update(this.ecs);
    this.attackSystem.update(this.ecs);
    this.hurtBoxSystem.update(this.ecs);
    this.hitBoxSystem.update(this.ecs);

    // this.attackDurationSystem.update(this.ecs);
    // this.deadSystem.update(this.ecs);
    // this.hitBoxSystem.update(this.ecs, this.renderer);
    // this.projectileSystem.update(this.ecs, this.renderer);
    this.renderer.clearScreen();
    this.renderer.drawSprites(this.ecs);
    this.renderer.renderHurtBox(this.ecs);
    this.renderer.renderHitBox(this.ecs);

    this.renderer.renderCharacter(this.ecs);
    this.renderer.drawProjectile(this.ecs);
    //this.renderer.drawTriangle(this.ecs, this.mouseHandler);

    this.loopId = window.requestAnimationFrame(() => this.gameLoop());
  }
}
