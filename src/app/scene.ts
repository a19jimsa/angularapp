import { ElementRef } from '@angular/core';
import { Ecs } from '../core/ecs';
import { Renderer } from './renderer';
import { CollisionSystem } from '../systems/collision-system';
import { RenderSystem } from '../systems/render-system';
import { CameraSystem } from '../systems/camera-system';
import { Transform } from '../components/transform';
import { Vec } from './vec';
import { Render } from '../components/render';
import { Camera } from '../components/camera';
import { ControlSystem } from '../systems/control-system';
import { Controlable } from '../components/controlable';
import { RotationSystem } from '../systems/rotation-system';
import { Rotation } from '../components/rotation';
import { MouseHandler } from './mouse-handler';
import { MovementSystem } from '../systems/movement-system';

export class Scene {
  ecs: Ecs;
  canvas: ElementRef<HTMLCanvasElement>;
  renderer!: Renderer;
  canvasWidth: number;
  canvasHeight: number;
  width: number;
  height: number;
  mouseHandler: MouseHandler;
  cameraSystem = new CameraSystem();
  collisionSystem = new CollisionSystem();
  //renderSystem = new RenderSystem();
  rotationSystem = new RotationSystem();
  controlSystem = new ControlSystem();
  movementSystem = new MovementSystem();

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
    this.mouseHandler = new MouseHandler(this.canvas);
  }

  init() {
    //Create entity
    const player = this.ecs.createEntity();
    const enemy = this.ecs.createEntity();

    //Add player components
    this.ecs.addComponent<Transform>(
      player,
      new Transform(new Vec(this.canvasWidth / 2, 30), new Vec(0, 0), 20)
    );
    this.ecs.addComponent<Render>(player, new Render('yellow'));
    this.ecs.addComponent<Camera>(player, new Camera());

    this.ecs.addComponent<Controlable>(
      player,
      new Controlable(new Vec(0, 10), 10, false)
    );

    //Add components
    this.ecs.addComponent<Transform>(
      enemy,
      new Transform(
        new Vec(this.canvasWidth / 2, this.height - 200),
        new Vec(0, 0),
        20
      )
    );
    this.ecs.addComponent<Render>(enemy, new Render('blue'));
    for (let i = 0; i < 10; i++) {
      var entity = this.ecs.createEntity();
      this.ecs.addComponent<Transform>(
        entity,
        new Transform(new Vec((1 + i) * 50, 1750), new Vec(0, 0), 20)
      );
      this.ecs.addComponent<Render>(entity, new Render('red'));
    }

    this.ecs.addComponent<Rotation>(player, new Rotation());
    this.renderer = new Renderer(this.canvas);
    this.renderer.setCamera(this.ecs.getComponent<Camera>(player, 'Camera'));
  }

  start() {
    this.controlSystem.update(this.ecs, this.mouseHandler);
    this.collisionSystem.update(this.ecs, this);
    this.movementSystem.update(this.ecs);
    this.rotationSystem.update(this.ecs);
    this.cameraSystem.update(
      this.ecs,
      this.canvasWidth,
      this.canvasHeight,
      this.width,
      this.height
    );
    this.renderer.clearScreen();
    this.renderer.drawBackground();
    //this.renderSystem.update(this.ecs, null);
    window.requestAnimationFrame(() => this.start());
  }
}
