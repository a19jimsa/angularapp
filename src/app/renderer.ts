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
import { Particle } from 'src/effects/particle-system';
import { WalkBox } from 'src/components/walk-box';
import { Effect } from 'src/components/effect';
import { Life } from 'src/components/life';
import { Entity } from './entity';
import { Player } from 'src/components/player';
import { Inventory } from 'src/components/inventory';
import { Item } from 'src/components/item';

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
    const pool = ecs.getPool<[Sprite, Transform, WalkBox]>(
      'Sprite',
      'Transform',
      'Walkbox'
    );
    this.ctx.save();

    pool.forEach(({ entity, components }) => {
      const [sprite, transform] = components;
      this.ctx.drawImage(
        sprite.image,
        transform.position.x - this.camera.position.x,
        transform.position.y - this.camera.position.y
      );
    });
    this.ctx.restore();
  }

  public drawBackground() {
    this.ctx.lineWidth = 1;
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      this.height / 2 - this.camera.position.y,
      200,
      'blue'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      this.height / 2 - this.camera.position.y,
      135,
      'white'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      this.height / 2 - this.camera.position.y,
      75,
      'red'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      this.height / 2 - this.camera.position.y,
      25,
      'white'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      2000 - this.height / 2 - this.camera.position.y,
      200,
      'blue'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      2000 - this.height / 2 - this.camera.position.y,
      135,
      'white'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      2000 - this.height / 2 - this.camera.position.y,
      75,
      'red'
    );
    this.drawCircle(
      this.width / 2 - this.camera.position.x,
      2000 - this.height / 2 - this.camera.position.y,
      25,
      'white'
    );
    this.drawLine(this.width / 2, 0, this.width / 2, 2000, 'red', 1);
    this.drawLine(
      0 - this.camera.position.x,
      this.height / 2 - this.camera.position.y,
      this.width - this.camera.position.x,
      this.height / 2 - this.camera.position.y,
      'red',
      1
    );
    this.drawLine(
      0 - this.camera.position.x,
      600 - this.camera.position.y,
      this.width - this.camera.position.x,
      600 - this.camera.position.y,
      'red',
      10
    );
    this.drawLine(
      0 - this.camera.position.x,
      1400 - this.camera.position.y,
      this.width - this.camera.position.x,
      1400 - this.camera.position.y,
      'red',
      10
    );
  }

  public drawSpeedControl(position: Vec, drawTo: Vec) {
    this.ctx.strokeStyle = 'green';
    this.ctx.beginPath();
    this.ctx.moveTo(
      position.x - this.camera.position.x,
      position.y - this.camera.position.y
    );
    this.ctx.lineTo(drawTo.x, drawTo.y);
    this.ctx.stroke();
  }

  public render(position: Vec, color: string, radius: number, angle: number) {
    this.drawCurlingStone(
      position.x - this.camera.position.x,
      position.y - this.camera.position.y,
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
          transform.position.x - this.camera.position.x,
          transform.position.y - this.camera.position.y
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
          const transform = ecs.getComponent<Transform>(entity, 'Transform');
          if (
            weapon &&
            transform &&
            skeleton.bones[i].order === weapon.order &&
            draw
          ) {
            this.drawCharacterWeapon(entity, ecs);

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
            this.drawCharacterWeapon(offEntity, ecs);
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
    const screenX = bone.position.x;
    const screenY = bone.position.y;
    this.ctx.save();
    this.ctx.translate(screenX, screenY);
    this.ctx.rotate(
      MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2
    );
    this.ctx.scale(bone.scale.x, bone.scale.y);
    this.ctx.translate(-screenX, -screenY);
    this.ctx.drawImage(
      image,
      bone.startX,
      bone.startY,
      bone.endX,
      bone.endY,
      screenX - bone.pivot.x - bone.endX / 2,
      screenY - bone.pivot.y,
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
    this.ctx.fillRect(characterPosition.x, characterPosition.y, 100, 100);
  }

  drawHitBox(hitBox: HitBox, transform: Transform) {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(
      transform.position.x,
      transform.position.y,
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
          hitBox.position.x - this.camera.position.x,
          hitBox.position.y - this.camera.position.y,
          hitBox.width,
          hitBox.height
        );
      }
    }
  }

  drawCharacterWeapon(entity: Entity, ecs: Ecs) {
    const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
    const sprite = ecs.getComponent<Sprite>(entity, 'Sprite');
    const transform = ecs.getComponent<Transform>(entity, 'Transform');
    if (!weapon || !sprite) return;
    const screenX = transform.position.x - this.camera.position.x;
    const screenY = transform.position.y - this.camera.position.y;
    this.ctx.save();
    this.ctx.translate(screenX, screenY);
    this.ctx.rotate(MathUtils.degreesToRadians(weapon.rotation) - Math.PI / 2);
    this.ctx.scale(weapon.scale.x, weapon.scale.y);
    this.ctx.translate(-screenX, -screenY);
    this.ctx.drawImage(
      sprite.image,
      screenX - weapon.pivot.x - sprite.image.width / 2,
      screenY - weapon.pivot.y
    );
    this.ctx.restore();
  }

  drawProjectile(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const transform = ecs.getComponent<Transform>(entity, 'Transform');
      const weapon = ecs.getComponent<Weapon>(entity, 'Weapon');
      const projectile = ecs.getComponent<Projectile>(entity, 'Projectile');
      const sprite = ecs.getComponent<Sprite>(entity, 'Sprite');
      if (!transform || !weapon || !projectile || !sprite) continue;
      const screenX = transform.position.x - this.camera.position.x;
      const screenY = transform.position.y - this.camera.position.y;
      this.ctx.save();
      this.ctx.translate(screenX, screenY);
      this.ctx.rotate(
        MathUtils.degreesToRadians(weapon.rotation) - Math.PI / 2
      );
      this.ctx.scale(weapon.scale.x, weapon.scale.y);
      this.ctx.translate(-screenX, -screenY);
      this.ctx.drawImage(
        sprite.image,
        screenX - weapon.pivot.x - sprite.image.width / 2,
        screenY - weapon.pivot.y
      );
      this.ctx.restore();
    }
  }

  renderHurtBox(ecs: Ecs) {
    for (const entity of ecs.getEntities()) {
      const hurtBox = ecs.getComponent<HurtBox>(entity, 'HurtBox');
      if (hurtBox) {
        this.ctx.fillRect(
          hurtBox.position.x - this.camera.position.x,
          hurtBox.position.y - this.camera.position.y,
          hurtBox.width,
          hurtBox.height
        );
      }
    }
  }

  drawSmear(smear: Smear) {
    if (smear.positions.length === 0) return;
    this.ctx.beginPath();
    this.ctx.moveTo(smear.positions[0].x, smear.positions[0].y);
    for (let i = 0; i < smear.positions.length - 1; i++) {
      this.ctx.bezierCurveTo(
        smear.positions[i].x,
        smear.positions[i].y,
        smear.positions[i + 1].x,
        smear.positions[i + 1].y,
        smear.positions[i + 1].x,
        smear.positions[i + 1].y
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
      const adjacent = mouseHandler.position.x - newPosition.x;
      const angleRadians = Math.acos(adjacent / hypotenuse);
      this.ctx.beginPath();
      this.ctx.moveTo(newPosition.x, newPosition.y);
      this.ctx.lineTo(mouseHandler.position.x, newPosition.y);
      this.ctx.lineTo(mouseHandler.position.x, mouseHandler.position.y);
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
        particle.position.x,
        particle.position.y,
        20 * (particle.sizeEnd - particle.sizeBegin),
        20 * (particle.sizeEnd - particle.sizeBegin)
      );
    }
    this.ctx.restore();
  }

  renderWalkBox(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, WalkBox]>('Transform', 'WalkBox');
    pool.forEach(({ entity, components }) => {
      const [transform, walkbox] = components;
      this.ctx.fillRect(
        transform.position.x,
        transform.position.y,
        this.canvas.nativeElement.width,
        100
      );
    });
  }

  renderEffects(ecs: Ecs) {
    const pool = ecs.getPool<[Effect]>('Effect');
    pool.forEach(({ entity, components }) => {
      const [effect] = components;
      if (!effect.isAlive) return;
      for (const sprite of effect.sprites) {
        const screenX = effect.position.x - this.camera.position.x;
        const screenY = effect.position.y - this.camera.position.y;

        this.ctx.save();

        // Flytta till sprite-positionen på skärmen
        this.ctx.translate(
          screenX + sprite.position.x,
          screenY + sprite.position.y
        );

        // Rotera kring pivotpunkten
        this.ctx.rotate(MathUtils.degreesToRadians(sprite.rotation));

        // Skala objektet
        this.ctx.scale(sprite.scaleX, sprite.scaleY);

        // Rita bilden justerat efter pivotpunkten
        this.ctx.drawImage(
          effect.image,
          sprite.startX,
          sprite.startY,
          sprite.endX,
          sprite.endY, // Källa (sprite sheet)
          -sprite.pivot.x - sprite.endX / 2,
          -sprite.pivot.y, // Målposition
          sprite.endX,
          sprite.endY // Storlek
        );

        this.ctx.restore();
      }
    });
  }

  renderLifebar(ecs: Ecs) {
    const pool = ecs.getPool<[Transform, Life]>('Transform', 'Life');
    pool.forEach(({ entity, components }) => {
      const [transform, life] = components;
      const width = life.currentHp % 1000;
      this.ctx.fillRect(20, 20, width, 10);
    });
  }

  renderInventory(ecs: Ecs) {
    const pool = ecs.getPool<[Inventory, Player, Skeleton]>(
      'Inventory',
      'Player',
      'Skeleton'
    );
    let x = 0;
    let y = 0;
    pool.forEach(({ entity, components }) => {
      const [inventory, player, skeleton] = components;
      if (!inventory.show) return;
      const margin = 100;
      this.ctx.fillStyle = 'grey';
      this.ctx.fillRect(
        margin,
        margin,
        this.width - margin * 2,
        this.height - margin * 2
      );

      if (skeleton) {
        for (const bone of skeleton.bones) {
          const screenX = 1000 + bone.position.x;
          const screenY = this.height / 2 + bone.position.y;
          this.ctx.save();
          this.ctx.translate(screenX, screenY);
          this.ctx.rotate(
            MathUtils.degreesToRadians(bone.globalRotation) - Math.PI / 2
          );
          this.ctx.scale(bone.scale.x, bone.scale.y);
          this.ctx.translate(-screenX, -screenY);
          this.ctx.drawImage(
            skeleton.image,
            bone.startX,
            bone.startY,
            bone.endX,
            bone.endY,
            screenX - bone.pivot.x - bone.endX / 2,
            screenY - bone.pivot.y,
            bone.endX,
            bone.endY
          );
          this.ctx.restore();
        }
      }

      for (const item of inventory.items) {
        const sprite = item[1].find((e) => e.type === 'Sprite');
        const isOver = item[1].find((e) => e.type === 'Item');
        if (sprite instanceof Sprite && isOver instanceof Item) {
          if (isOver.isOver) {
            this.ctx.strokeRect(
              isOver.position.x,
              isOver.position.y,
              sprite.clip.endX,
              sprite.clip.endY
            );
          }

          this.ctx.stroke();
          this.ctx.drawImage(
            sprite.image,
            isOver.position.x,
            isOver.position.y
          );
          if (skeleton && skeleton.heldEntity === item[1]) {
            this.ctx.fillRect(
              isOver.position.x,
              isOver.position.y,
              sprite.clip.endX,
              sprite.clip.endY
            );
            this.ctx.fill();
          }
        }
      }
    });
  }
}
