import { ElementRef } from '@angular/core';
import { Vec } from './vec';
import { Camera } from './components/camera';
import { Bone } from './components/bone';
import { Joint } from './components/joint';
import { Skeleton } from './components/skeleton';
import { Transform } from './components/transform';
import { HitBox } from './components/hit-box';
import { Attack } from './components/attack';
import { Sprite } from './components/sprite';
import { Weapon } from './components/weapon';
import { Rotation } from './components/rotation';
import { Ecs } from './ecs';

export class Renderer {
  private canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;
  private image = new Image();
  private width: number;
  private height: number;
  private camera!: Camera;

  constructor(canvas: ElementRef<HTMLCanvasElement>) {
    this.canvas = canvas;
    const context = this.canvas.nativeElement.getContext('2d');
    this.width = canvas.nativeElement.width;
    this.height = canvas.nativeElement.height;
    this.camera = new Camera();

    if (context) {
      this.ctx = context;
    } else {
      throw Error(
        'Failed to get 2d content, come up with a solution dumbass ://'
      );
    }
    this.image.src = 'assets/sprites/sbackground4.png';
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  clearScreen(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  public drawHitBox(hitBox: HitBox, rotation: Rotation) {
    const radians = ((rotation.angle - 90) * Math.PI) / 180;
    this.ctx.save();
    this.ctx.fillStyle = 'green';
    this.ctx.translate(hitBox.position.X, hitBox.position.Y);
    this.ctx.rotate(radians);
    this.ctx.translate(-hitBox.position.X, -hitBox.position.Y);
    this.ctx.fillRect(
      hitBox.position.X - this.camera.position.X,
      hitBox.position.Y,
      hitBox.height,
      hitBox.width
    );

    this.ctx.restore();
  }

  private drawCircle(
    x: number,
    y: number,
    radius: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = 'black';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  private drawCurlingStone(
    x: number,
    y: number,
    radius: number,
    color: string,
    angle: number
  ) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(angle);
    this.ctx.translate(-x, -y);
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = '#3b3b3b';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + radius, y + radius / 3);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawLine(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    lineWidth: number
  ) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  private drawImage(
    src: CanvasImageSource,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.ctx.drawImage(src, x, y, width, height);
  }

  public drawForeground() {
    this.ctx.drawImage(this.image, 0, 0, 1024, 450, 0, 0, 1024, 450);
    this.ctx.drawImage(this.image, 1024, 0, 1024, 450, 0, 0, 1024, 450);
    this.ctx.drawImage(
      this.image,
      0,
      450,
      1024,
      450,
      0 - this.camera.position.X,
      0,
      1024,
      450
    );

    this.ctx.save();
    this.ctx.translate(1024 - this.camera.position.X + 1024, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.image, 0, 450, 1024, 450, 0, 0, 1024, 450);
    this.ctx.restore();
    this.ctx.save();
    this.ctx.drawImage(
      this.image,
      0,
      450,
      1024,
      450,
      2048 - this.camera.position.X,
      0,
      1024,
      450
    );
    this.ctx.restore();
    this.ctx.save();
    this.ctx.translate(3072 - this.camera.position.X + 1024, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(this.image, 0, 450, 1024, 450, 0, 0, 1024, 450);
    this.ctx.restore();
  }

  public drawBackground() {
    this.ctx.lineWidth = 1;
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      this.height / 2 - this.camera.position.Y,
      200,
      'blue'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      this.height / 2 - this.camera.position.Y,
      135,
      'white'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      this.height / 2 - this.camera.position.Y,
      75,
      'red'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      this.height / 2 - this.camera.position.Y,
      25,
      'white'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      2000 - this.height / 2 - this.camera.position.Y,
      200,
      'blue'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      2000 - this.height / 2 - this.camera.position.Y,
      135,
      'white'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      2000 - this.height / 2 - this.camera.position.Y,
      75,
      'red'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.X,
      2000 - this.height / 2 - this.camera.position.Y,
      25,
      'white'
    );
    this.drawLine(this.width / 2, 0, this.width / 2, 2000, 'red', 1);
    this.drawLine(
      0 - this.camera.position.X,
      this.height / 2 - this.camera.position.Y,
      this.width - this.camera.position.X,
      this.height / 2 - this.camera.position.Y,
      'red',
      1
    );
    this.drawLine(
      0 - this.camera.position.X,
      600 - this.camera.position.Y,
      this.width - this.camera.position.X,
      600 - this.camera.position.Y,
      'red',
      10
    );
    this.drawLine(
      0 - this.camera.position.X,
      1400 - this.camera.position.Y,
      this.width - this.camera.position.X,
      1400 - this.camera.position.Y,
      'red',
      10
    );
  }

  public drawSpeedControl(position: Vec, drawTo: Vec) {
    this.ctx.strokeStyle = 'green';
    this.ctx.beginPath();
    this.ctx.moveTo(
      position.X - this.camera.position.X,
      position.Y - this.camera.position.Y
    );
    this.ctx.lineTo(drawTo.X, drawTo.Y);
    this.ctx.stroke();
  }

  public render(position: Vec, color: string, radius: number, angle: number) {
    this.drawCurlingStone(
      position.X - this.camera.position.X,
      position.Y - this.camera.position.Y,
      radius,
      color,
      angle
    );
  }

  public renderBone(image: CanvasImageSource, bone: Bone) {
    const radians = (bone.globalRotation * Math.PI) / 180;
    this.ctx.save();
    this.ctx.translate(bone.offset.X, bone.offset.Y);
    this.ctx.rotate(radians - Math.PI / 2);
    this.ctx.scale(bone.scale.X, bone.scale.Y);
    this.ctx.translate(-bone.offset.X, -bone.offset.Y);
    this.ctx.drawImage(
      image,
      bone.startX,
      bone.startY,
      bone.endX,
      bone.endY,
      bone.offset.X - bone.pivot.X - bone.endX / 2,
      bone.offset.Y - bone.pivot.Y,
      bone.endX,
      bone.endY
    );
    this.ctx.restore();
  }

  public renderCharacter(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      if (!skeleton) return;
      for (let i = 0; i < skeleton.bones.length; i++) {
        skeleton.bones.sort((a, b) => a.order - b.order);
        this.ctx.save();
        this.ctx.translate(skeleton.position.X, skeleton.position.Y);
        this.renderBone(skeleton.image, skeleton.bones[i]);
        this.ctx.translate(-skeleton.position.X, -skeleton.position.Y);
        this.ctx.restore();
      }
    }
  }

  public renderFont(text: string) {
    this.ctx.fillStyle = 'blue';
    this.ctx.font = '50px Arial';
    this.ctx.fillText(text, 500, 500);
  }

  drawDebug(characterPosition: Vec) {
    this.ctx.fillRect(characterPosition.X, characterPosition.Y, 100, 100);
  }

  drawAttackBox(attack: HitBox) {
    this.ctx.save();
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(
      attack.position.X - this.camera.position.X,
      attack.position.Y - this.camera.position.Y,
      attack.width,
      attack.height
    );
    this.ctx.fill();
    this.ctx.restore();
  }

  drawWeapon(sprite: Sprite, transform: Transform, angle: number) {
    const radians = (angle * Math.PI) / 180;
    this.ctx.save();
    this.ctx.translate(
      transform.position.X - this.camera.position.X,
      transform.position.Y - this.camera.position.Y
    );
    if (sprite.flip) {
      this.ctx.scale(-1, 1);
    }
    this.ctx.rotate(radians);
    this.ctx.translate(-transform.position.X, -transform.position.Y);

    this.drawImage(
      sprite.image,
      transform.position.X - 20,
      transform.position.Y - sprite.image.height + 20,
      sprite.image.width,
      sprite.image.height
    );
    this.ctx.restore();
  }
}
