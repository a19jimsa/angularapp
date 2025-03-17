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
import { Foot } from '../components/foot';
import { InitializationSystem } from '../systems/initialization-system';
import { HurtBoxSystem } from '../systems/hurt-box-system';
import { Sprite } from '../components/sprite';
import { HitBox } from '../components/hit-box';
import { HurtBox } from '../components/hurt-box';
import { WalkBox } from 'src/components/walk-box';
import { Enemy } from 'src/components/enemy';
import { AimingSystem } from 'src/systems/aiming-system';
import { MouseHandler } from './mouse-handler';
import { StateSystem } from 'src/systems/state-system';
import { Player } from 'src/components/player';
import { Target } from 'src/components/target';
import { PatrolSystem } from 'src/systems/patrol-system';
import { ChaseAISystem } from 'src/systems/chase-ai-system';
import { IdleAiSystem } from 'src/systems/idle-ai-system';
import { Idle } from 'src/components/idle';
import { DamageAiSystem } from 'src/systems/damage-ai-system';
import { AttackAiSystem } from 'src/systems/attack-ai-system';
import { ParticleProp, ParticleSystem } from 'src/effects/particle-system';
import { Life } from 'src/components/life';
import { EffectSystem } from 'src/systems/effect-system';

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
  chaseSystem: ChaseAISystem;
  idleSystem: IdleAiSystem;
  damageSystem: DamageAiSystem;
  attackAiSystem: AttackAiSystem;
  particleSystem: ParticleSystem;
  particle: ParticleProp;
  effectSystem: EffectSystem;
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
    this.chaseSystem = new ChaseAISystem();
    this.idleSystem = new IdleAiSystem();
    this.damageSystem = new DamageAiSystem();
    this.attackAiSystem = new AttackAiSystem();
    this.particleSystem = new ParticleSystem();
    this.effectSystem = new EffectSystem();
    this.particle = {
      position: new Vec(200, 200),
      lifetime: 1,
      velocity: new Vec(10, 10),
      velocityVariation: new Vec(3, 0),
      sizeBegin: 0.5,
      sizeEnd: 0,
      sizeVariation: 0.3,
    };
  }

  init() {
    this.renderer = new Renderer(this.canvas);
    const player = this.ecs.createEntity();
    const draug = this.ecs.createEntity();
    const enemy = this.ecs.createEntity();

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
      new Transform(new Vec(0, this.canvasHeight - 200), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<WalkBox>(walkBox, new WalkBox());

    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(0, 0), new Vec(0, 0), 10)
    );

    this.ecs.addComponent<Transform>(
      draug,
      new Transform(new Vec(300, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Transform>(
      enemy,
      new Transform(new Vec(1000, 0), new Vec(0, 0), 0)
    );

    //TODO Add sprites to resource manager instead
    const playerSkeleton = new Skeleton(
      'assets/sprites/88022.png',
      'playerAnimations'
    );
    const dragonSkeleton = new Skeleton(
      'assets/sprites/Dragon.png',
      'playerAnimations'
    );
    const flyerSkeleton = new Skeleton(
      'assets/sprites/161452.png',
      'playerAnimations'
    );
    const draugSkeleton = new Skeleton(
      'assets/sprites/104085.png',
      'playerAnimations'
    );
    const horseSkeleton = new Skeleton(
      'assets/sprites/115616.png',
      'playerAnimations'
    );
    const enemySkeleton = new Skeleton(
      'assets/sprites/104085.png',
      'playerAnimations'
    );

    playerSkeleton.bones = Loader.getBones('skeleton');
    draugSkeleton.bones = Loader.getBones('skeleton');
    enemySkeleton.bones = Loader.getBones('skeleton');
    this.ecs.addComponent<Skeleton>(player, playerSkeleton);
    this.ecs.addComponent<Skeleton>(draug, draugSkeleton);
    this.ecs.addComponent<Skeleton>(enemy, enemySkeleton);

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 0), 0, false)
    );
    this.ecs.addComponent<Camera>(player, new Camera());
    this.ecs.addComponent<Player>(player, new Player());

    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));

    this.ecs.addComponent<Ai>(enemy, new Ai(1000, 500));
    this.ecs.addComponent<Idle>(enemy, new Idle());
    this.ecs.addComponent<Ai>(draug, new Ai(1000, 500));
    this.ecs.addComponent<Idle>(draug, new Idle());
    this.ecs.addComponent<Target>(enemy, new Target(player));
    this.ecs.addComponent<Target>(draug, new Target(player));

    const newWeapon = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      newWeapon,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      newWeapon,
      new Weapon('right_hand', 'assets/sprites/wep_lc003.png', new Vec(0, 180))
    );
    this.ecs.addComponent<Enemy>(newWeapon, new Enemy());

    const bow = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      bow,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Weapon>(
      bow,
      new Weapon('left_hand', 'assets/sprites/wep_bw026.png', new Vec(20, 0))
    );

    const arrow = this.ecs.createEntity();

    this.ecs.addComponent<Transform>(
      arrow,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Weapon>(
      arrow,
      new Weapon('right_hand', 'assets/sprites/wep_ar000.png', new Vec(0, 120))
    );

    const book = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      book,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      book,
      new Weapon('left_hand', 'assets/sprites/wep_mg000.png', new Vec(0, 20))
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
    this.ecs.addComponent<Enemy>(sword, new Enemy());

    const sword2 = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      sword2,
      new Transform(new Vec(0, 0), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Weapon>(
      sword2,
      new Weapon('right_hand', 'assets/sprites/wep_sw046.png', new Vec(0, 120))
    );

    this.ecs.addComponent<Enemy>(sword2, new Enemy());
    this.ecs.addComponent<HurtBox>(sword, new HurtBox());
    // this.ecs.addComponent<HurtBox>(sword2, new HurtBox());
    this.ecs.addComponent<Enemy>(sword2, new Enemy());
    this.ecs.addComponent<HurtBox>(newWeapon, new HurtBox());
    this.ecs.addComponent<Enemy>(newWeapon, new Enemy());

    this.ecs.addComponent<Foot>(player, new Foot('right_foot'));
    this.ecs.addComponent<Life>(player, new Life(200));
    // this.ecs.addComponent<Life>(draug, new Life(200));
    // this.ecs.addComponent<Life>(enemy, new Life(200));

    this.ecs.addComponent<HitBox>(player, new HitBox(50, 50));

    playerSkeleton.heldOffhandEntity = book;
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
    this.controllerSystem.update(this.ecs);
    this.physicsSystem.update(this.ecs);

    this.movementSystem.update(this.ecs);
    this.animationSystem.update(this.ecs);

    this.aiSystem.update(this.ecs);

    this.idleSystem.update(this.ecs);
    this.patrolSystem.update(this.ecs);
    this.chaseSystem.update(this.ecs);
    this.damageSystem.update(this.ecs);
    this.attackAiSystem.update(this.ecs);
    this.stateSystem.update(this.ecs);

    this.aimingSystem.update(this.ecs);
    this.weaponSystem.update(this.ecs);
    this.attackSystem.update(this.ecs);

    this.hurtBoxSystem.update(this.ecs);
    this.hitBoxSystem.update(this.ecs);

    this.effectSystem.update(this.ecs);

    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );

    this.particleSystem.emit(this.particle);
    this.particleSystem.onUpdate();

    // this.attackDurationSystem.update(this.ecs);
    // this.deadSystem.update(this.ecs);
    // this.hitBoxSystem.update(this.ecs, this.renderer);
    // this.projectileSystem.update(this.ecs, this.renderer);
    this.renderer.clearScreen();

    this.renderer.drawSprites(this.ecs);
    this.renderer.renderHurtBox(this.ecs);
    this.renderer.renderHitBox(this.ecs);
    this.renderer.renderCharacter(this.ecs);
    this.renderer.renderEffects(this.ecs);
    this.renderer.renderLifebar(this.ecs);
    //this.renderer.renderWalkBox(this.ecs);

    this.renderer.renderParticles(this.particleSystem.particlePool);

    //this.renderer.drawProjectile(this.ecs);
    //this.renderer.drawTriangle(this.ecs, this.mouseHandler);

    this.loopId = window.requestAnimationFrame(() => this.gameLoop());
  }
}
