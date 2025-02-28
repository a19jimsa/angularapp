import { ElementRef } from '@angular/core';
import { Vec } from './vec';
import { Camera } from '../components/camera';
import { Bone } from '../components/bone';
import { Skeleton } from '../components/skeleton';
import { Transform } from '../components/transform';
import { HitBox } from '../components/hit-box';
import { Weapon } from '../components/weapon';
import { Foot } from '../components/foot';
import { MathUtils } from '../Utils/MathUtils';
import { HurtBox } from '../components/hurt-box';
import { Smear } from '../components/smear';
import { Ecs } from '../core/ecs';
import { Sprite } from '../components/sprite';
import { MouseHandler } from './mouse-handler';
import { Projectile } from 'src/components/projectile';
import { Enchant } from 'src/components/enchant';
import { Particle } from 'src/effects/particle-system';

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
    this.image.src = 'assets/sprites/backgrounds/87844.png';
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  clearScreen(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
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

  public drawSprites(ecs: Ecs) {
    const pool = ecs.getPool<[Sprite, Transform]>('Sprite', 'Transform');
    this.ctx.save();

    pool.forEach(({ entity, components }) => {
      const [sprite, transform] = components;
      this.ctx.drawImage(
        sprite.image,
        transform.position.X - this.camera.position.X,
        transform.position.Y - this.camera.position.Y
      );
    });
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

  public renderCharacter(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const skeleton = ecs.getComponent<Skeleton>(entity, 'Skeleton');
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const foot = ecs.getComponent<Foot>(entity, 'Foot');
      let draw = true;
      let drawOffhand = true;
      if (!skeleton) continue;
      let offset = 0;
      if (foot) {
        offset = foot.value;
      }

      skeleton.bones.sort((a, b) => a.order - b.order);
      for (let i = 0; i < skeleton.bones.length; i++) {
        this.ctx.save();
        this.ctx.translate(
          transform.position.X - this.camera.position.X,
          transform.position.Y - this.camera.position.Y
        );
        if (skeleton.flip) {
          this.ctx.scale(-1, 1);
        }
        this.renderBone(skeleton.image, transform, skeleton.bones[i]);
        this.ctx.restore();
        const entity = skeleton.heldEntity;
        const offEntity = skeleton.heldOffhandEntity;
        if (entity) {
          const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
          const smear = ecs.getComponent<Smear>(entity, 'Smear');
          const hitbox = ecs.getComponent<HitBox>(entity, 'HitBox');
          const transform = ecs.getComponent<Transform>(entity, 'Transform');
          if (
            weapon &&
            transform &&
            skeleton.bones[i].order === weapon.order &&
            draw
          ) {
            this.drawCharacterWeapon(weapon, transform);

            draw = false;
          }
          if (smear) {
            this.drawSmear(smear);
          }
        }
        if (offEntity) {
          const weapon = ecs.getComponent<Weapon>(offEntity, 'Weapon');
          const transform = ecs.getComponent<Transform>(offEntity, 'Transform');
          if (
            weapon &&
            transform &&
            skeleton.bones[i].order === weapon.order &&
            drawOffhand
          ) {
            this.drawCharacterWeapon(weapon, transform);
            drawOffhand = false;
          }
        }
      }
    }
  }

  public renderBone(
    image: CanvasImageSource,
    transform: Transform,
    bone: Bone
  ) {
    const screenX = bone.position.X;
    const screenY = bone.position.Y;
    this.ctx.save();
    this.ctx.translate(screenX, screenY);
    this.ctx.rotate(
      MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2
    );
    this.ctx.scale(bone.scale.X, bone.scale.Y);
    this.ctx.translate(-screenX, -screenY);
    this.ctx.drawImage(
      image,
      bone.startX,
      bone.startY,
      bone.endX,
      bone.endY,
      screenX - bone.pivot.X - bone.endX / 2,
      screenY - bone.pivot.Y,
      bone.endX,
      bone.endY
    );
    this.ctx.restore();
  }

  public renderFont(text: string) {
    this.ctx.fillStyle = 'blue';
    this.ctx.font = '50px Arial';
    this.ctx.fillText(text, 500, 500);
  }

  drawDebug(characterPosition: Vec) {
    this.ctx.fillRect(characterPosition.X, characterPosition.Y, 100, 100);
  }

  drawHitBox(hitBox: HitBox, transform: Transform) {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(
      transform.position.X,
      transform.position.Y,
      hitBox.width,
      hitBox.height
    );
  }

  renderHitBox(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const hitBox = ecs.getComponent<HitBox>(entity, 'HitBox');
      if (hitBox) {
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(
          hitBox.position.X - this.camera.position.X,
          hitBox.position.Y - this.camera.position.Y,
          hitBox.width,
          hitBox.height
        );
      }
    }
  }

  drawCharacterWeapon(weapon: Weapon, transform: Transform) {
    const screenX = transform.position.X - this.camera.position.X;
    const screenY = transform.position.Y - this.camera.position.Y;
    this.ctx.save();
    this.ctx.translate(screenX, screenY);
    this.ctx.rotate(MathUtils.degreesToRadians(weapon.rotation) - Math.PI / 2);
    this.ctx.scale(weapon.scale.X, weapon.scale.Y);
    this.ctx.translate(-screenX, -screenY);
    this.ctx.drawImage(
      weapon.image,
      screenX - weapon.pivot.X - weapon.image.width / 2,
      screenY - weapon.pivot.Y
    );
    this.ctx.restore();
  }

  drawProjectile(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
      const projectile = ecs.getComponent<Projectile>(entity, 'Projectile');
      if (!transform || !weapon || !projectile) continue;
      const screenX = transform.position.X - this.camera.position.X;
      const screenY = transform.position.Y - this.camera.position.Y;
      this.ctx.save();
      this.ctx.translate(screenX, screenY);
      this.ctx.rotate(
        MathUtils.degreesToRadians(weapon.rotation) - Math.PI / 2
      );
      this.ctx.scale(weapon.scale.X, weapon.scale.Y);
      this.ctx.translate(-screenX, -screenY);
      this.ctx.drawImage(
        weapon.image,
        screenX - weapon.pivot.X - weapon.image.width / 2,
        screenY - weapon.pivot.Y
      );
      this.ctx.restore();
    }
  }

  renderHurtBox(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const hurtBox = ecs.getComponent<HurtBox>(entity, 'HurtBox');
      if (hurtBox) {
        this.ctx.save();
        this.ctx.fillRect(
          hurtBox.position.X - this.camera.position.X,
          hurtBox.position.Y - this.camera.position.Y,
          hurtBox.width,
          hurtBox.height
        );
        this.ctx.restore();
      }
    }
  }

  drawSmear(smear: Smear) {
    if (smear.positions.length === 0) return;
    this.ctx.beginPath();
    this.ctx.moveTo(smear.positions[0].X, smear.positions[0].Y);
    for (let i = 0; i < smear.positions.length - 1; i++) {
      this.ctx.bezierCurveTo(
        smear.positions[i].X,
        smear.positions[i].Y,
        smear.positions[i + 1].X,
        smear.positions[i + 1].Y,
        smear.positions[i + 1].X,
        smear.positions[i + 1].Y
      );
    }
    this.ctx.stroke();
  }

  drawTriangle(ecs: Ecs, mouseHandler: MouseHandler) {
    const pool = ecs.getPool<[Transform, Skeleton, Camera]>(
      'Transform',
      'Skeleton',
      'Camera'
    );
    pool.forEach(({ entity, components }) => {
      const [transform, skeleton, camera] = components;
      const torso = skeleton.bones.find((e) => e.id === 'torso');
      if (!torso) return;
      const newPosition = transform.position
        .plus(torso.position)
        .minus(camera.position);
      const hypotenuse = newPosition.dist(mouseHandler.position);
      const adjacent = mouseHandler.position.X - newPosition.X;
      const angleRadians = Math.acos(adjacent / hypotenuse);
      this.ctx.beginPath();
      this.ctx.moveTo(newPosition.X, newPosition.Y);
      this.ctx.lineTo(mouseHandler.position.X, newPosition.Y);
      this.ctx.lineTo(mouseHandler.position.X, mouseHandler.position.Y);
      this.ctx.fill();
    });
  }

  renderParticles(particlePool: Particle[]) {
    this.ctx.save();
    for (const particle of particlePool) {
      if (!particle.active) continue;
      const life = particle.lifeRemaining / particle.lifetime;
      this.ctx.globalAlpha = life;
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(
        particle.position.X,
        particle.position.Y,
        20 * (particle.sizeEnd - particle.sizeBegin),
        20 * (particle.sizeEnd - particle.sizeBegin)
      );
    }
    this.ctx.restore();
  }
}
