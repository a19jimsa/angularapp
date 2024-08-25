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
    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(this.width / 2, this.height / 2), new Vec(0, 0), 0)
    );
    const enemy = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      enemy,
      new Transform(new Vec(100, 100), new Vec(0, 0), 0)
    );
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

    const hero = this.ecs.createEntity();

    this.ecs.addComponent(
      hero,
      new Transform(new Vec(300, 300), new Vec(0, 0), 0)
    );

    this.ecs.addComponent(
      hero,
      new Skeleton(
        [
          new Bone(
            'leftArm',
            'body',
            new Vec(0, 0),
            15,
            -40,
            30,
            23,
            150,
            22,
            45
          ),
          new Bone(
            'leftLowerArm',
            'leftArm',
            new Vec(0, 0),
            0,
            0,
            0,
            210,
            155,
            30,
            35
          ),
          new Bone(
            'leftLeg',
            'body',
            new Vec(0, 0),
            15,
            0,
            40,
            400,
            145,
            33,
            55
          ),
          new Bone(
            'leftFoot',
            'leftLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            160,
            40,
            40
          ),
          new Bone(
            'rightLeg',
            'body',
            new Vec(0, 0),
            0,
            0,
            40,
            400,
            145,
            33,
            55
          ),

          new Bone('body', null, new Vec(0, 0), 0, 0, 50, 430, 0, 60, 70),
          new Bone('head', 'body', new Vec(0, 0), 0, -105, 0, 25, 20, 75, 75),
          new Bone(
            'rightArm',
            'body',
            new Vec(0, 0),
            -10,
            -45,
            40,
            145,
            150,
            28,
            60
          ),
          // new Bone(
          //   'weapon',
          //   'rightLowerArm',
          //   new Vec(0, 0),
          //   0,
          //   0,
          //   100,
          //   418,
          //   200,
          //   85,
          //   160
          // ),
          new Bone(
            'rightLowerArm',
            'rightArm',
            new Vec(0, 0),
            0,
            0,
            20,
            213,
            155,
            20,
            40
          ),
          new Bone(
            'rightFoot',
            'rightLeg',
            new Vec(0, 0),
            0,
            0,
            0,
            455,
            160,
            40,
            40
          ),
        ],
        'assets/sprites/Barst.png'
      )
    );
    const astram = this.ecs.createEntity();
    this.ecs.addComponent(
      astram,
      new Transform(new Vec(400, 300), new Vec(0, 0), 0)
    );
    this.ecs.addComponent(
      astram,
      new Skeleton(
        [
          new Bone(
            'leftArm',
            'body',
            new Vec(0, 0),
            15,
            -40,
            30,
            23,
            150,
            22,
            45
          ),
          new Bone(
            'leftLowerArm',
            'leftArm',
            new Vec(0, 0),
            0,
            0,
            0,
            210,
            155,
            30,
            35
          ),
          new Bone(
            'leftLeg',
            'body',
            new Vec(0, 0),
            15,
            0,
            40,
            400,
            145,
            33,
            55
          ),
          new Bone(
            'leftFoot',
            'leftLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            160,
            40,
            40
          ),
          new Bone(
            'rightLeg',
            'body',
            new Vec(0, 0),
            0,
            0,
            40,
            400,
            145,
            33,
            55
          ),
          new Bone('body', null, new Vec(0, 0), 0, 0, 50, 430, 0, 60, 70),
          new Bone('head', 'body', new Vec(0, 0), 0, -105, 0, 25, 20, 75, 75),
          new Bone(
            'rightArm',
            'body',
            new Vec(0, 0),
            -10,
            -41,
            40,
            145,
            150,
            28,
            50
          ),
          new Bone(
            'rightLowerArm',
            'rightArm',
            new Vec(0, 0),
            0,
            0,
            20,
            213,
            155,
            20,
            40
          ),
          new Bone(
            'rightFoot',
            'rightLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            160,
            40,
            40
          ),
        ],
        'assets/sprites/Astram.png'
      )
    );

    const arden = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      arden,
      new Transform(new Vec(200, 300), new Vec(0, 0), 0)
    );
    this.ecs.addComponent<Skeleton>(
      arden,
      new Skeleton(
        [
          new Bone(
            'leftArm',
            'body',
            new Vec(0, 0),
            15,
            -40,
            30,
            23,
            150,
            22,
            45
          ),
          new Bone(
            'leftLowerArm',
            'leftArm',
            new Vec(0, 0),
            0,
            0,
            0,
            210,
            155,
            30,
            35
          ),
          new Bone(
            'leftLeg',
            'body',
            new Vec(0, 0),
            15,
            0,
            45,
            400,
            145,
            33,
            55
          ),
          new Bone(
            'leftFoot',
            'leftLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            160,
            50,
            50
          ),
          new Bone(
            'rightLeg',
            'body',
            new Vec(0, 0),
            0,
            0,
            45,
            400,
            145,
            33,
            55
          ),
          new Bone('body', null, new Vec(0, 0), 0, 0, 50, 430, 0, 60, 70),
          new Bone('head', 'body', new Vec(0, 0), 0, -105, 0, 25, 20, 75, 75),
          new Bone(
            'rightArm',
            'body',
            new Vec(0, 0),
            -20,
            -30,
            30,
            145,
            150,
            28,
            50
          ),
          new Bone(
            'rightLowerArm',
            'rightArm',
            new Vec(0, 0),
            0,
            0,
            20,
            213,
            155,
            20,
            40
          ),
          new Bone(
            'rightFoot',
            'rightLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            160,
            50,
            50
          ),
        ],
        'assets/sprites/Darros.png'
      )
    );

    const draug = this.ecs.createEntity();
    this.ecs.addComponent<Transform>(
      draug,
      new Transform(new Vec(100, 300), new Vec(0, 0), 0)
    );

    this.ecs.addComponent<Skeleton>(
      draug,
      new Skeleton(
        [
          new Bone(
            'leftArm',
            'body',
            new Vec(0, 0),
            15,
            -40,
            30,
            23,
            150,
            22,
            45
          ),
          new Bone(
            'leftLowerArm',
            'leftArm',
            new Vec(0, 0),
            0,
            0,
            0,
            210,
            155,
            30,
            35
          ),
          new Bone(
            'leftLeg',
            'body',
            new Vec(0, 0),
            15,
            0,
            30,
            400,
            145,
            33,
            55
          ),
          new Bone(
            'leftFoot',
            'leftLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            150,
            50,
            50
          ),
          new Bone(
            'rightLeg',
            'body',
            new Vec(0, 0),
            0,
            0,
            30,
            400,
            145,
            33,
            55
          ),
          new Bone('body', null, new Vec(0, 0), 0, 0, 50, 430, 0, 60, 80),
          new Bone('head', 'body', new Vec(0, 0), 0, -105, 0, 25, 20, 75, 75),
          new Bone(
            'rightArm',
            'body',
            new Vec(0, 0),
            -20,
            -30,
            30,
            145,
            150,
            28,
            50
          ),
          new Bone(
            'rightLowerArm',
            'rightArm',
            new Vec(0, 0),
            0,
            0,
            20,
            213,
            155,
            20,
            40
          ),
          new Bone(
            'rightFoot',
            'rightLeg',
            new Vec(0, 0),
            0,
            0,
            20,
            455,
            150,
            50,
            50
          ),
        ],
        'assets/sprites/Draug.png'
      )
    );

    this.ecs.addComponent<Controlable>(
      astram,
      new Controlable(new Vec(0, 0), 0, false)
    );

    this.ecs.addComponent<Controlable>(
      hero,
      new Controlable(new Vec(0, 0), 0, false)
    );
    this.ecs.addComponent<Controlable>(
      arden,
      new Controlable(new Vec(0, 0), 0, false)
    );
    this.ecs.addComponent<Controlable>(
      draug,
      new Controlable(new Vec(0, 0), 0, false)
    );
  }

  start() {
    this.renderer.clearScreen();
    this.animationSystem.update(this.ecs, this.renderer);
    this.movementSystem.update(this.ecs);
    this.controllerSystem.update(this.ecs);
    //console.log(Math.floor(performance.now() / 1000));
    window.requestAnimationFrame(() => this.start());
  }
}
